var gulp = require('gulp'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat'),
	browserSync = require('browser-sync').create(),
	include = require("gulp-include"),
	rimraf = require('rimraf'), // remove dir
	ifElse = require('gulp-if-else'),
 	filter = require('gulp-filter'),
 	order = require('gulp-order'),
	// bower
	mainBowerFiles = require('main-bower-files'),
	// css
	scss = require('gulp-sass'),
	scssGlob = require('gulp-sass-glob'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	cssnano = require('gulp-cssnano'),
	// js
	minify = require('gulp-minify'),
	// images
	imagemin = require('gulp-imagemin'),
	// sprites
	spritesmith = require('gulp.spritesmith'),
	merge = require('merge-stream'),
	// fonts
	font2css = require('gulp-font2css').default;

var isDev = true;

var path = { in : {
		html: ['source/html/**/*'],
		css: ['source/scss/**/*.scss'],
		js: ['source/js/**/*.js'],
		img: ['source/images/**/*.{jpg,jpeg,gif,png}'],
		fonts: ['source/fonts/**/*.{woff,woff2}'],
		fontsjs: ['source/fonts/fonts.js'],
		sprites: ['source/sprites/**/*.{jpg,jpeg,gif,png}'],
		plugins: ['source/plugins/**/*.js']
	},
	watch: {
		html: ['source/html/**/*', 'source/html_partials/**/*'],
		css: ['source/scss/**/*.scss'],
		js: ['source/js/**/*.js'],
		img: ['source/images/**/*.{jpg,jpeg,gif,png}'],
		fonts: ['source/fonts/**/*.{woff,woff2}'],
		fontsjs: ['source/fonts/fonts.js'],
		sprites: ['source/sprites/**/*.{jpg,jpeg,gif,png}'],
		plugins: ['source/plugins/**/*.js']
	},
	out: {
		html: 'www/static/',
		css: 'www/static/',
		js: 'www/static/js/',
		img: 'www/static/images/',
		fonts: 'www/static/fonts/',
		fontsjs: 'www/static/js/',

		plugins_js: 'source/js/',

		sprites_i: 'source/images/',
		sprites_s: 'source/scss/'
	},
	clean: 'www/static'
};

// server
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: './www/static'
		},
		notify: false,
		tunnel: false,
		// tunnel: true,
		host: 'localhost',
		port: 9000,
		logPrefix: "kio",
		open: false,
		// open: "tunnel",
	});
});

// html
gulp.task('html', function() {
	return gulp.src(path.in.html)
		.pipe(include())
		.pipe(gulp.dest(path.out.html))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// styles
gulp.task('styles', function() {
	return gulp.src(path.in.css)
		.pipe(scssGlob())
		.pipe(ifElse(isDev, function() {
			return sourcemaps.init();
		}))
		.pipe(scss({
			errLogToConsole: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 3 version']
		}))
		.pipe(cssnano({
			zindex: false,
			discardUnused: {
				fontFace: false
			}
		}))
		.pipe(ifElse(isDev, function() {
			return sourcemaps.write('.');
		}))
		.pipe(gulp.dest(path.out.css))
		.pipe(browserSync.stream());
});

// images
gulp.task('images', function() {
	return gulp.src(path.in.img)
		.pipe(ifElse(!isDev, function() {
			return imagemin({
				progressive: true,
				interlaced: true
			});
		}))
		.pipe(gulp.dest(path.out.img))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// plugins
gulp.task('plugins', function() {
	var vendors = mainBowerFiles();

	return gulp.src(vendors)
		.pipe(filter('**.js'))
		// .pipe(order(vendors))
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest(path.out.plugins_js));
});

// sprites
gulp.task('sprites', function() {
	var spriteData =
		gulp.src(path.in.sprites)
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
		.pipe(gulp.dest(path.out.sprites_i));

	var cssStream = spriteData.css
		.pipe(gulp.dest(path.out.sprites_s));

	return merge(imgStream, cssStream);
});

// fonts
gulp.task('fonts', function() {
	return gulp.src(path.in.fonts)
		.pipe(font2css())
		.pipe(cssnano({
			discardUnused: {
				fontFace: false
			}
		}))
		.pipe(gulp.dest(path.out.fonts))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// fontjs
gulp.task('fontsjs', function() {
	return gulp.src(path.in.fontsjs)
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			}
		}))
		.pipe(gulp.dest(path.out.fontsjs))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// scripts
gulp.task('scripts', function() {
	return gulp.src(path.in.js)
		.pipe(concat('main.js'))
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			}
		}))
		.pipe(gulp.dest(path.out.js))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// clean directory 'build'
gulp.task('clean', function(cb) {
	return rimraf(path.clean, cb);
});

// build
gulp.task('build', [
	'html',
	'sprites',
	'styles',
	'images',
	'fonts',
	'fontsjs',
	'scripts',
	'plugins'
]);

// watch
gulp.task('watch', function() {
	watch(path.watch.html, function() {
		gulp.start('html');
	});
	watch(path.watch.css, function() {
		gulp.start('styles');
	});
	watch(path.watch.img, function() {
		gulp.start('images');
	});
	watch(path.watch.sprites, function() {
		gulp.start('sprites');
	});
	watch(path.watch.js, function() {
		gulp.start('scripts');
	});
	watch(path.watch.fonts, function() {
		gulp.start('fonts');
	});
	watch(path.watch.fontsjs, function() {
		gulp.start('fontsjs');
	});
	watch(path.watch.plugins, function() {
		gulp.start('plugins');
	});
});

gulp.task('default', ['build', 'watch', 'server']);