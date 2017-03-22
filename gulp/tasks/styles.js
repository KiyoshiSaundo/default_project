// styles.js

var gulp       = require('gulp'),
    watch      = require('gulp-watch'),
    include    = require('gulp-include'),
    ifElse     = require('gulp-if-else'),
    scss       = require('gulp-sass'),
    scssGlob   = require('gulp-sass-glob'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer   = require('gulp-autoprefixer'),
    cssnano    = require('gulp-cssnano');

module.exports = {
	task: function(taskName, params) {
		var pathIn  = params.path.in + '/scss/**/*.scss';
		var pathOut = params.path.out;

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
				.pipe(include())
				.pipe(ifElse(params.isCssMap, function() {
					return sourcemaps.init();
				}))
				.pipe(scssGlob())
				.pipe(scss({
					errLogToConsole: true
				}))
				.pipe(prefixer({
					browsers: params.prefixer
				}))
				.pipe(cssnano({
					zindex: false,
					discardUnused: {
						fontFace: false
					}
				}))
				.pipe(ifElse(params.isCssMap, function() {
					return sourcemaps.write('.');
				}))
				.pipe(gulp.dest(pathOut));
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/scss/**/*.scss'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};