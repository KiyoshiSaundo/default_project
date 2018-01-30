// styles.js

var gulp       = require('gulp'),
    watch      = require('gulp-watch'),
    include    = require('gulp-include'),
    gulpif     = require('gulp-if'),
    scss       = require('gulp-sass'),
    scssGlob   = require('gulp-sass-glob'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer   = require('gulp-autoprefixer'),
    cssnano    = require('gulp-cssnano');

module.exports = {
	task: function(taskName, params) {
		var pathIn   = params.path.in + '/scss/**/*.scss';
		var pathOut  = params.path.out;
		var pathOutB = params.path.bitrix;

		// fix #7
		var dependence = [];
		for (let i = 0; i < params.tasksList.length; i++) {
			if (params.tasksList[i] == 'sprites')
				dependence = ['sprites'];
		}

		gulp.task(taskName, dependence, function() {
			return gulp.src(pathIn)
				.pipe(include())
				.pipe(gulpif(
					params.isCssMap,
					sourcemaps.init()
				))
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
				.pipe(gulpif(
					params.isCssMap,
					sourcemaps.write('.')
				))
				.pipe(gulpif(
					params.isBitrix,
					gulp.dest(pathOutB),
					gulp.dest(pathOut)
				));
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