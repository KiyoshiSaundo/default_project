// html.js

var gulp    = require('gulp'),
    watch   = require('gulp-watch'),
    include = require('gulp-include'),
    ifElse  = require('gulp-if-else');

module.exports = {
	task: function(taskName, params) {
		var pathIn  = params.path.in + '/html/**/*.{html,txt}';
		var pathOut = params.path.out;

		gulp.task(taskName, function() {
			return gulp.src(pathIn)
				.pipe(include())
				.pipe(gulp.dest(pathOut));
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/html/**/*.{html,txt}',
			params.path.in + '/html_partials/**/*.{html,txt}'
		];
		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};