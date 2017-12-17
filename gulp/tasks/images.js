// images.js

var gulp     = require('gulp'),
    watch    = require('gulp-watch'),
    gulpif   = require('gulp-if'),
    filter   = require('gulp-filter'),
    imagemin = require('gulp-imagemin');

module.exports = {
	task: function(taskName, params) {
		var pathIn  = [
			params.path.in + '/images/**/*.{jpg,jpeg,gif,png,svg}',
			params.path.in + '/images_tmp/**/*.{jpg,jpeg,gif,png,svg}'
		];
		var pathOut  = params.path.out + '/images';
		var pathOutB = params.path.bitrix + '/images';

		const f = filter(['**', '!**/*.svg'], {restore: true});

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
				.pipe(f)
				.pipe(gulpif(
					params.isImageMin,
					imagemin({
						progressive: true,
						interlaced: true
					})
				))
				.pipe(f.restore)
				.pipe(gulpif(
					params.isBitrix,
					gulp.dest(pathOutB),
					gulp.dest(pathOut)
				));
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