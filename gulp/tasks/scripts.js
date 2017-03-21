// scripts.js

var params = require('../params.js');

var gulp    = require('gulp'),
    include = require('gulp-include'),
    order   = require('gulp-order'),
    concat  = require('gulp-concat'),
    minify  = require('gulp-minify'),
    bSync   = require('browser-sync').create();

gulp.task('scripts', function() {
	return gulp.src(params.paths.in.js)
		.pipe(include())
		.pipe(order([
			"plugins.js",
			"*.js"
		]))
		.pipe(concat('main.js'))
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			}
		}))
		.pipe(gulp.dest(params.paths.out.js))
		.pipe(bSync.reload({
			stream: true
		}));
});