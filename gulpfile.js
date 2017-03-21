var params = require('./gulp/params.js');

var gulp       = require('gulp'),
	watch      = require('gulp-watch'),
    requireDir = require('require-dir');

// Require all tasks
requireDir( './gulp/tasks', { recurse: true } );

// watch
gulp.task('watch', function() {
	watch(params.paths.watch.html, function() {
		gulp.start('html');
	});
	watch(params.paths.watch.css, function() {
		gulp.start('styles');
	});
	watch(params.paths.watch.img, function() {
		gulp.start('images');
	});
	watch(params.paths.watch.sprites, function() {
		gulp.start('sprites');
	});
	watch(params.paths.watch.js, function() {
		gulp.start('scripts');
	});
	watch(params.paths.watch.fonts, function() {
		gulp.start('fonts');
	});
});

// build
gulp.task('build', [
	'html',
	'styles',
	'scripts',
	'images',
	'sprites',
	'fonts'
]);

// default
gulp.task('default', [
	'build',
	'watch',
	'server'
]);

// clean directory 'www/static'
gulp.task('clean', function(cb) {
	return rimraf(path.clean, cb);
});