'use strict';

var moment = require('moment');
var SaxoParser = require('saxo-parser');

// -- Channel class -----------------------------------------------------------

var Channel = function (id) {
  this.id = id;
  this.names = [];
};

Channel.prototype.addName = function (name) {
  this.names.push(name);
};

Channel.prototype.getNames = function () {
  return this.names;
};

// -- Prog class --------------------------------------------------------------

var Prog = function (channel) {
  this.chan = channel;
  this.cat = [];
  this.credits = [];
};

Prog.prototype.setMoment = function (start, end) {
  this.start = start;
  this.end = end;
};

Prog.prototype.addCategory = function (cat) {
  this.cat.push(cat);
};

Prog.prototype.addPerson = function (name, role) {
  this.credits.push({name: name, role: role});
};


// -- XmltvParser class -------------------------------------------------------

var XmltvParser = function (options) {
  options = options || {};
  this.options = {
    timeFmt: options.timeFmt || 'YYYYMMDDHHmmss Z',
    strictTime: typeof options.strictTime !== 'undefined' ? options.strictTime : false
  };
};

XmltvParser.prototype.createConfiguration = function () {
  var self = this;
  var personNameExtractorRegExp = /^([^\(\)]+)/;

  var saxoConf = {
    channel: {

      // when opening tag get the id attributes and initialize array to save channel names
      _open: function (tag) {
        tag.channel = new Channel(tag.attributes.id);
      },

      'display-name': function (tag) {
        var channel = tag.parent.channel;
        channel.addName(tag.text);
      },

      // when leaving channel call the callback method
      _close: function (tag) {
        self.onChannel && self.onChannel.call(self, tag.channel);
      }
    },

    programme: {
      _open: function (tag) {
        tag.prog = new Prog(tag.attributes.channel);
        tag.prog.setMoment(self._parseDateTime(tag.attributes.start), self._parseDateTime(tag.attributes.stop));
      },

      // programme end tag
      _close: function (tag) {
        self.onProgramme && self.onProgramme.call(self, tag.prog);
      },

      'title': function (tag) {
        var prog = tag.parent.prog;
        prog.title = tag.text;
      },

      'sub-title': function (tag) {
        var prog = tag.parent.prog;
        prog.subTitle = tag.text;
      },

      'desc': function (tag) {
        var prog = tag.parent.prog;
        prog.desc = tag.text;
      },

      'category': function (tag) {
        var prog = tag.parent.prog;
        prog.addCategory(tag.text);
      },

      'credits': {
        // get all credited persons whatever the role
        '*': function (tag) {
          var roleRole = tag.name;
          var prog = tag.parent.parent.prog;
          var personName = personNameExtractorRegExp.exec(tag.text)[0];
          personName.split(',').forEach(function (name) {
            prog.addPerson(name.trim(), roleRole);
          });

        }
      }
    }
  };

  return saxoConf;
};


/**
 * Parses xmltv date format. Looks like: 20150603025000 +0200.
 * Returns a date object or null if it doesn't fit the format
 */
XmltvParser.prototype._parseDateTime = function (date) {
  var parsed = moment(date, this.options.timeFmt, this.options.strictTime);
  if (parsed.isValid()) {
    return parsed.toDate();
  }
  return null;
};


XmltvParser.prototype.parseFile = function (filePath, endCallback) {
  var saxoParser = new SaxoParser(this.createConfiguration());
  saxoParser.parseFile(filePath, endCallback);
};

module.exports = XmltvParser;
