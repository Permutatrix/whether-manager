var gulp = require('gulp');

var rollup = require('rollup-stream');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var Mocha = require('mocha');
var path = require('path');

gulp.task('default', function() {
  return rollup({ entry: './src/whether-manager.js' })
  .pipe(source('whether-manager.js', './src'))
  .pipe(buffer())
  .pipe(babel({ presets: ['es2015-minimal'] }))
  .pipe(gulp.dest('.'));
});

gulp.task('test', ['default'], function(cb) {
  var mocha = new Mocha();
  mocha.addFile(path.resolve(process.cwd(), 'test/test.js'));
  mocha.run(function(errorCount) {
    if(errorCount > 0) {
      process.exit(1);
    }
    cb();
  });
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

gulp.task('coverage', ['instrumented'], function(cb) {
  require('./scripts/coverage.js')(cb);
});
