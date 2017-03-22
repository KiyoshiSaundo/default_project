// sprites.js

var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    spritesmith = require('gulp.spritesmith'),
    merge       = require('merge-stream');

module.exports = {
	task: function(taskName, params) {
		var pathIn        = params.path.in + '/sprites/**/*.{jpg,jpeg,gif,png}';
		var pathOutImages = params.path.in + '/images';
		var pathOutCss    = params.path.in + '/scss';

		gulp.task(taskName, function() {
			var spriteData = gulp.src(pathIn)
				.pipe(spritesmith({
					imgName: 'sprites.png',
					imgPath: 'images/sprites.png', // in css
					cssName: '_sprites.scss',
					algorithm: 'binary-tree',
					padding: 1,
					cssVarMap: function(sprite) {
						sprite.name = 's-' + sprite.name;
					}
				}));

			var imgStream = spriteData.img
				.pipe(gulp.dest(pathOutImages));

			var cssStream = spriteData.css
				.pipe(gulp.dest(pathOutCss));

			return merge(imgStream, cssStream);
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.in + '/sprites/**/*.{jpg,jpeg,gif,png}'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};