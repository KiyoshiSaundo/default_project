// sprites.js

var params = require('../params.js');

var gulp        = require('gulp'),
    spritesmith = require('gulp.spritesmith'),
    merge       = require('merge-stream');

gulp.task('sprites', function() {
	var spriteData = gulp.src(params.paths.in.sprites)
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
		.pipe(gulp.dest(params.paths.out.sprites_i));

	var cssStream = spriteData.css
		.pipe(gulp.dest(params.paths.out.sprites_s));

	return merge(imgStream, cssStream);
});