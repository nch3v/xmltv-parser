var XmltvParser = require("../src/index.js");
var _ = require("lodash");

describe("XmltvParser", function() {

	describe("when parsing date and time", function() {

		var parser;

		beforeEach(function() {
			parser = new XmltvParser();
		});

		it("should return a valid date when no time zone provided", function() {
			var s = "20080715080000";
			var result = parser._parseDateTime(s);

			expect(result.getFullYear()).toBe(2008);
			expect(result.getMonth()).toBe(6); // month is minus 1 in javascript
			expect(result.getDate()).toBe(15);

			expect(result.getHours()).toBe(8);
			expect(result.getMinutes()).toBe(0);
			expect(result.getSeconds()).toBe(0);
		});

		it("should handle time offset when there is a time zone", function() {
			var s = "20080715080000 -0600";
			var result = parser._parseDateTime(s);

			expect(result.getUTCFullYear()).toBe(2008);
			expect(result.getUTCMonth()).toBe(6); // month is minus 1 in javascript
			expect(result.getUTCDate()).toBe(15);

			expect(result.getUTCHours()).toBe(8+6);
			expect(result.getUTCMinutes()).toBe(0);
			expect(result.getUTCSeconds()).toBe(0);
		});

	});

	describe("when dealing with channels", function() {

		const xmltvFilePath = __dirname+"/assets/sample-from-wikipedia.xml";
		var parser;

		beforeEach(function() {
			parser = new XmltvParser();
		});

		it("calls the `onChannel` callback with id and names defined", function(done) {
			var channelCounter = 0;

			parser.onChannel = function(channel) {
				channelCounter++;
				expect(channel.id).toBeDefined();
				expect(channel.names).toBeDefined();
				expect(channel.names.length).toBeGreaterThan(0);
			};

			parser.parseFile(xmltvFilePath, function() {
				expect(channelCounter).toBe(2);
				done();
			});

		});

		it("calls the `onProgramme` callback with a Programme object", function(done) {
			var progCounter = 0;

			parser.onProgramme = function(prog) {
				if(progCounter==1) {
					expect(prog.chan).toBe("I10759.labs.zap2it.com");
					var start = prog.start;
					expect(start.getUTCFullYear()).toBe(2008);
					expect(start.getUTCMonth()).toBe(6); // months start from zero !
					expect(start.getUTCDate()).toBe(15);
					expect(start.getUTCHours()).toBe(16); // 10 minus offset
					expect(start.getUTCMinutes()).toBe(30);
					var end = prog.end;
					expect(end.getUTCFullYear()).toBe(2008);
					expect(end.getUTCMonth()).toBe(6); // months start from zero !
					expect(end.getUTCDate()).toBe(15);
					expect(end.getUTCHours()).toBe(17); // 11 minus offset
					expect(end.getUTCMinutes()).toBe(30);
					expect(prog.title).toBe("The Young and the Restless");
					expect(prog.subTitle).toBe("Sabrina Offers Victoria a Truce");
					expect(prog.desc).toBe("Jeff thinks Kyon stole the face cream; Nikki asks Nick to give David a chance; Amber begs Adrian to go to Australia.");

					var actors = _.filter(prog.credits, function(credit) {
            return credit.role === "actor"
          });
					expect(actors.length).toBe(4);
					expect(_.pluck(actors,'name')).toEqual(["Peter Bergman","Eric Braeden","Jeanne Cooper","Melody Thomas Scott"]);
				}

				progCounter++;
			};

			parser.parseFile(xmltvFilePath, function() {
				expect(progCounter).toBe(2);
				done();
			});

		});

	});
});

