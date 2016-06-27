var istanbul = require('istanbul');
var Mocha = require('mocha');
var MochaSpecReporter = require('mocha/lib/reporters/spec');
var path = require('path');

module.exports = function coverage(cb) {
  var mocha = new Mocha({
    reporter: function(runner) {
      var collector = new istanbul.Collector();
      var reporter = new istanbul.Reporter();
      reporter.addAll(['lcov', 'html']);
      new MochaSpecReporter(runner);
      
      runner.on('end', function() {
        collector.add(global.__coverage__);
        
        reporter.write(collector, true, cb);
      });
    }
  });
  mocha.addFile(path.resolve(process.cwd(), 'test/test.js'));
  mocha.run(function(errorCount) {
    if(errorCount > 0) {
      process.exit(1);
    }
  });
}
