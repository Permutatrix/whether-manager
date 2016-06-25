var gulp = require('gulp');

var rollup = require('rollup-stream');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var istanbul = require('istanbul');
var Mocha = require('mocha');
var MochaSpecReporter = require('mocha/lib/reporters/spec');
var path = require('path');

gulp.task('default', function() {
  return rollup({ entry: './src/whether-manager.js' })
  .pipe(source('whether-manager.js', './src'))
  .pipe(buffer())
  .pipe(babel({ presets: ['es2015-minimal'] }))
  .pipe(gulp.dest('.'));
});

gulp.task('instrumented', function() {
  return rollup({
    entry: './src/whether-manager.js',
    plugins: [require('rollup-plugin-istanbul')()]
  })
  .pipe(source('whether-manager.js', './src'))
  .pipe(buffer())
  .pipe(babel({ presets: ['es2015-minimal'] }))
  .pipe(gulp.dest('.'));
});

gulp.task('test', ['instrumented'], function(cb) {
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
});
