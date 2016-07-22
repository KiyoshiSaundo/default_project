var   gulp = require('gulp')
	, watch = require('gulp-watch')
	, concat = require('gulp-concat')
	, browserSync = require('browser-sync').create()
	, include = require("gulp-include")
	, rimraf = require('rimraf') // remove dir
	, ifElse = require('gulp-if-else')
	, filter = require('gulp-filter')
	// w3c
	, w3cjs = require('gulp-w3cjs')
	, through2 = require('through2')
	// css
	, scss = require('gulp-ruby-sass')
	, sourcemaps = require('gulp-sourcemaps')
	, autoprefixer = require('gulp-autoprefixer')
	, cssnano = require('gulp-cssnano')
	// js
	, minify = require('gulp-minify')
	// images
	, imagemin = require('gulp-imagemin')
	// sprites
	, spritesmith = require('gulp.spritesmith')
	, merge = require('merge-stream')
	// fonts
	, font2css = require('gulp-font2css').default
	;

var isDev = true;

var path = {
	in: {
		pages:   ['dev/pages/**/*', '!dev/pages/partials/*'],
		css:     ['dev/scss/**/*.scss'],
		js:      ['dev/js/**/*.js'],
		img:     ['dev/images/**/*.{jpg,jpeg,gif,png}'],
		fonts:   ['dev/fonts/**/*.{woff,woff2}'],
		fontsjs: ['dev/fonts/fonts.js'],
		sprites: ['dev/sprites/**/*.{jpg,jpeg,gif,png}'],
		plugins: ['dev/plugins/**/*.js']
	},
	watch: {
		pages:   ['dev/pages/**/*'],
		css:     ['dev/scss/**/*.scss'],
		js:      ['dev/js/**/*.js'],
		img:     ['dev/images/**/*.{jpg,jpeg,gif,png}'],
		fonts:   ['dev/fonts/**/*.{woff,woff2}'],
		fontsjs: ['dev/fonts/fonts.js'],
		sprites: ['dev/sprites/**/*.{jpg,jpeg,gif,png}'],
		plugins: ['dev/plugins/**/*.js']
	},
	out: {
		pages:     'build/',
		css:       'build/',
		js:        'build/js/',
		img:       'build/images/',
		fonts:     'build/fonts/',
		fontsjs:   'build/js/',
		sprites_i: 'dev/images/',
		sprites_s: 'dev/scss/',
		plugins:   'build/js/'
	},
	clean: './build'
};

// server
gulp.task('server', function () {
	browserSync.init({
		server: {
			baseDir: './build'
		},
		tunnel: false,
		// tunnel: true,
		host: 'localhost',
		port: 9000,
		logPrefix: "kio",
		open: false,
		// open: "tunnel",
	});
});

// pages
gulp.task('pages', function() {
	fW3C = filter(['**/*.html', '!**/ajax/**'], {restore: true});
	return gulp.src(path.in.pages)
		.pipe(include())
		.pipe(fW3C)
		.pipe(w3cjs())
		.pipe(fW3C.restore)
		.pipe(gulp.dest(path.out.pages))
		.pipe(browserSync.reload({stream: true}));
});

// styles
gulp.task('styles', function() {
	return scss(path.in.css, {noCache: true, sourcemap: true})
		.pipe(ifElse(isDev,
			function() { return sourcemaps.init() }
		))
		.pipe(autoprefixer({browsers: ['last 3 version']}))
		.pipe(cssnano({zindex: false, discardUnused: {fontFace: false}}))
		.pipe(ifElse(isDev,
			function() { return sourcemaps.write('.') }
		))
		.pipe(gulp.dest(path.out.css))
		.pipe(browserSync.stream());
});

// images
gulp.task('images', function() {
	return gulp.src(path.in.img)
		.pipe(ifElse(!isDev,
			function() { return imagemin({progressive: true, interlaced: true}) }
		))
		.pipe(gulp.dest(path.out.img))
		.pipe(browserSync.reload({stream: true}));
});

// plugins
gulp.task('plugins', function() {
	return gulp.src(path.in.plugins)
		.pipe(concat('plugins.js'))
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.plugins))
		.pipe(browserSync.reload({stream: true}));
});

// sprites
gulp.task('sprites', function () {
	var spriteData =
		gulp.src(path.in.sprites)
			.pipe(spritesmith({
				imgName: 'sprites.png',
				imgPath: 'images/sprites.png', // in css
				cssName: '_sprites.scss',
				algorithm: 'binary-tree',
				padding: 1,
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name
				}
			}));

	var imgStream = spriteData.img
		.pipe(gulp.dest(path.out.sprites_i));

	var cssStream = spriteData.css
		.pipe(gulp.dest(path.out.sprites_s));

	return merge(imgStream, cssStream);
});

// fonts
gulp.task('fonts', function () {
	return gulp.src(path.in.fonts)
		.pipe(font2css())
		.pipe(cssnano({discardUnused: {fontFace: false}}))
		.pipe(gulp.dest(path.out.fonts))
		.pipe(browserSync.reload({stream: true}));
});

// fontjs
gulp.task('fontsjs', function () {
	return gulp.src(path.in.fontsjs)
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.fontsjs))
		.pipe(browserSync.reload({stream: true}));
});

// scripts
gulp.task('scripts', function() {
	return gulp.src(path.in.js)
		.pipe(concat('main.js'))
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.js))
		.pipe(browserSync.reload({stream: true}));
});

// clean directory 'build'
gulp.task('clean', function (cb) {
	return rimraf(path.clean, cb);
});

// build
gulp.task('build', [
	'pages',
	'sprites',
	'styles',
	'images',
	'fonts',
	'fontsjs',
	'scripts',
	'plugins'
]);

// watch
gulp.task('watch', function () {
	watch(path.watch.pages, function () {
		gulp.start('pages');
	});
	watch(path.watch.css, function () {
		gulp.start('styles');
	});
	watch(path.watch.img, function () {
		gulp.start('images');
	});
	watch(path.watch.sprites, function () {
		gulp.start('sprites');
	});
	watch(path.watch.js, function () {
		gulp.start('scripts');
	});
	watch(path.watch.fonts, function () {
		gulp.start('fonts');
	});
	watch(path.watch.fontsjs, function () {
		gulp.start('fontsjs');
	});
	watch(path.watch.plugins, function () {
		gulp.start('plugins');
	});
});

gulp.task('default', ['build', 'watch', 'server']);