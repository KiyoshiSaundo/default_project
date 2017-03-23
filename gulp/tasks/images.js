// images.js

var gulp     = require('gulp'),
    watch    = require('gulp-watch'),
    imagemin = require('gulp-imagemin'),
    ifElse   = require('gulp-if-else');

module.exports = {
	task: function(taskName, params) {
		var pathIn  = [
			params.path.in + '/images/**/*.{jpg,jpeg,gif,png}',
			params.path.in + '/images_tmp/**/*.{jpg,jpeg,gif,png}'
		];
		var pathOut = params.path.out + '/images';

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
				.pipe(ifElse(params.isImageMin, function() {
					return imagemin({
						progressive: true,
						interlaced: true
					});
				}))
				.pipe(gulp.dest(pathOut));
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/images/**/*.{jpg,jpeg,gif,png}',
			params.path.in + '/images_tmp/**/*.{jpg,jpeg,gif,png}'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};