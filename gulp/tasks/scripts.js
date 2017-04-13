// scripts.js

var gulp    = require('gulp'),
    watch   = require('gulp-watch'),
    include = require('gulp-include'),
    gulpif  = require('gulp-if'),
    order   = require('gulp-order'),
    concat  = require('gulp-concat'),
    minify  = require('gulp-minify');

module.exports = {
	task: function(taskName, params) {
		var pathIn   = params.path.in + '/js/**/*';
		var pathOut  = params.path.out + '/js';
		var pathOutB = params.path.bitrix + '/js';

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
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
				.pipe(gulpif(
					params.isBitrix,
					gulp.dest(pathOutB),
					gulp.dest(pathOut)
				));
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/js/**/*'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};