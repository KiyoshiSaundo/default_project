// fonts.js

var gulp     = require('gulp'),
    watch    = require('gulp-watch'),
    gulpif   = require('gulp-if'),
    cssnano  = require('gulp-cssnano'),
    minify   = require('gulp-minify'),
    font2css = require('gulp-font2css').default,
    merge    = require('merge-stream');

module.exports = {
	task: function(taskName, params) {
		var pathInFonts   = params.path.in + '/fonts/**/*.{woff,woff2}';
		var pathOutFonts  = params.path.out + '/fonts';

		var pathInJS      = params.path.in + '/fonts/fonts.js';
		var pathOutJS     = params.path.out + '/js';

		var pathOutBFonts = params.path.bitrix + '/fonts';
		var pathOutBJS    = params.path.bitrix + '/js';

		gulp.task(taskName, function() {
			var cssFonts = gulp.src(pathInFonts)
				.pipe(font2css())
				.pipe(cssnano({
					discardUnused: {
						fontFace: false
					}
				}))
				.pipe(gulpif(
					params.isBitrix,
					gulp.dest(pathOutBFonts),
					gulp.dest(pathOutFonts)
				));

			var jsFonts = gulp.src(pathInJS)
				.pipe(minify({
					ext: {
						src: '.js',
						min: '.min.js'
					}
				}))
				.pipe(gulpif(
					params.isBitrix,
					gulp.dest(pathOutBJS),
					gulp.dest(pathOutJS)
				));

			return merge(cssFonts, jsFonts);
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/fonts/**/*.{woff,woff2,js}'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};