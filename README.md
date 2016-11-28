# Install

`npm i xmltv-parser`

# Use

```
var XmltvParser = require('xmltv-parser');
var file = '/path/file';
var parser = new XmltvParser();

parser.onChannel = function(chan) {
  // channel local id
  console.log(chan.id);

  // channel names (usually only one)
  console.log(chan.names);
};

parser.onProgramme = function(prog) {
  // title & sub title
  console.log(prog.title);
  console.log(prog.subTitle);

  // channel local id
  console.log(prog.chan);

  // broadcast start & end
  console.log(prog.start, prog.end);

  // description
  console.log(prog.desc);

  // array of category
  console.log(prog.cat);

  // array of credited person as an object {name, role} where role can be actor, director, presenter, ...
  for(var c=0; c<prog.credits; c++) {
    console.log(prog.credits[c].name,': ', prog.credits[c].role);
  }
}

parser.parseFile(file);
```