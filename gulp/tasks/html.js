// html.js

var params = require('../params.js');

var gulp    = require('gulp'),
    include = require('gulp-include'),
    ifElse  = require('gulp-if-else'),
    bSync   = require('browser-sync').create();

gulp.task('html', function() {
	return gulp.src(params.paths.in.html)
		.pipe(include())
		.pipe(gulp.dest(params.paths.out.html))
		.pipe(bSync.reload({
			stream: true
		}));
});