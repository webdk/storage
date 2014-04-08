/* jshint node:true */

var gulp = require('gulp');
var rename = require('gulp-rename');
var es6 = require('gulp-es6-module-transpiler');

var paths = {
  scripts: '*.es6.js'
};

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(es6({ type: 'cjs' }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(/\.es6$/, '');
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['scripts']);