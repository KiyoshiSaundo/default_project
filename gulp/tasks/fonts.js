// fonts.js

var params = require('../params.js');

var gulp     = require('gulp'),
    cssnano  = require('gulp-cssnano'),
    minify   = require('gulp-minify'),
    font2css = require('gulp-font2css').default,
    merge    = require('merge-stream');

// fonts
gulp.task('fonts', function() {
	var cssFonts = gulp.src(params.paths.in.fonts)
		.pipe(font2css())
		.pipe(cssnano({
			discardUnused: {
				fontFace: false
			}
		}))
		.pipe(gulp.dest(params.paths.out.fonts));

	var jsFonts = gulp.src(params.paths.in.fontsjs)
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			}
		}))
		.pipe(gulp.dest(params.paths.out.fontsjs));

	return merge(cssFonts, jsFonts);
});