// styles.js

var params = require('../params.js');

var gulp       = require('gulp'),
    include    = require('gulp-include'),
    ifElse     = require('gulp-if-else'),
    scss       = require('gulp-sass'),
    scssGlob   = require('gulp-sass-glob'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer   = require('gulp-autoprefixer'),
    cssnano    = require('gulp-cssnano'),
    bSync      = require('browser-sync').create();

gulp.task('styles', function() {
	return gulp.src(params.paths.in.css)
		.pipe(include())
		.pipe(ifElse(params.isCssMap, function() {
			return sourcemaps.init();
		}))
		.pipe(scssGlob())
		.pipe(scss({
			errLogToConsole: true
		}))
		.pipe(prefixer({
			browsers: ['last 3 versions']
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
		.pipe(gulp.dest(params.paths.out.css))
		.pipe(bSync.reload({
			stream: true
		}));
});