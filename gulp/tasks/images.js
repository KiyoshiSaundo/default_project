// images.js

var params = require('../params.js');

var gulp     = require('gulp'),
    ifElse   = require('gulp-if-else'),
    imagemin = require('gulp-imagemin'),
    bSync    = require('browser-sync').create();

gulp.task('images', function() {
	return gulp.src(params.paths.in.img)
		.pipe(ifElse(params.isImageMin, function() {
			return imagemin({
				progressive: true,
				interlaced: true
			});
		}))
		.pipe(gulp.dest(params.paths.out.img))
		.pipe(bSync.reload({
			stream: true
		}));
});