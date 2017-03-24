// svgsprites.js

var gulp      = require('gulp'),
    watch     = require('gulp-watch'),
    svgSprite = require('gulp-svg-sprites'),
    merge     = require('merge-stream');

module.exports = {
	task: function(taskName, params) {
		var pathIn  = params.path.in + '/sprites/**/*.svg';
		var pathOut = params.path.in + '/images';

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
				.pipe(svgSprite({
					preview: false,
					mode: 'symbols',
					svgId: 'svg-%f',
					svg: {
						defs: 'sprites.svg',
						symbols: 'sprites.svg'
					}
				}))
				.pipe(gulp.dest(pathOut));
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/sprites/**/*.svg'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};