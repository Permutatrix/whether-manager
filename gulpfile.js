var gulp = require('gulp');

var rollup = require('rollup-stream');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');


gulp.task('default', function() {
  return rollup({ entry: './src/whether-manager.js' })
  .pipe(source('whether-manager.js', './src'))
  .pipe(buffer())
  .pipe(babel({ presets: ['es2015-minimal'] }))
  .pipe(gulp.dest('.'));
});
