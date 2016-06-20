var gulp = require('gulp')
	, watch = require('gulp-watch')
	, concat = require('gulp-concat')
	// server
	, browserSync = require("browser-sync")
	, reload = browserSync.reload
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
	// , cssfont64 = require('gulp-cssfont64')
	// , font64 = require('gulp-simplefont64')
	, font2css = require('gulp-font2css').default
	// other
	, rigger = require('gulp-rigger') // include (//=)
	, rimraf = require('rimraf') // remove dir
	, ifElse = require('gulp-if-else')
	;

var isDev = true;

var path = {
	in: {
		pages:   ['dev/pages/**/*.{html,txt}', '!dev/partials/**/*.html'],
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
	watch: {
		pages:   ['dev/pages/**/*.{html,txt}'],
		css:     ['dev/scss/**/*.scss'],
		js:      ['dev/js/**/*.js'],
		img:     ['dev/images/**/*.{jpg,jpeg,gif,png}'],
		fonts:   ['dev/fonts/**/*.{woff,woff2}'],
		fontsjs: ['dev/fonts/fonts.js'],
		sprites: ['dev/sprites/**/*.{jpg,jpeg,gif,png}'],
		plugins: ['dev/plugins/**/*.js']
	},
	clean: './build'
};

// server
gulp.task('server', function () {
	browserSync({
		server: {
			baseDir: './build'
		},
		// tunnel: true,
		tunnel: false,
		host: 'localhost',
		port: 9000,
		logPrefix: "kio",
		open: false,
		// open: "local",
		// open: "tunnel",
	});
});

// pages
gulp.task('pages', function() {
	return gulp.src(path.in.pages)
		.pipe(rigger())
		.pipe(gulp.dest(path.out.pages))
		.pipe(reload({stream: true}));
});

// styles
gulp.task('styles', ['sprites'], function() {
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
		.pipe(reload({stream: true}));
});

// images
gulp.task('images', ['sprites'], function() {
	return gulp.src(path.in.img)
		.pipe(ifElse(!isDev,
			function() { return imagemin({progressive: true, interlaced: true}) }
		))
		.pipe(gulp.dest(path.out.img))
		.pipe(reload({stream: true}));
});

// plugins
gulp.task('plugins', function() {
	return gulp.src(path.in.plugins)
		.pipe(concat('plugins.js'))
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.plugins))
		.pipe(reload({stream: true}));
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
		.pipe(reload({stream: true}));
});

// fontjs
gulp.task('fontsjs', function () {
	return gulp.src(path.in.fontsjs)
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.fontsjs))
		.pipe(reload({stream: true}));
});

// scripts
gulp.task('scripts', function() {
	return gulp.src(path.in.js)
		.pipe(concat('main.js'))
		.pipe(minify({ext:{src:'.js',min:'.min.js'}}))
		.pipe(gulp.dest(path.out.js))
		.pipe(reload({stream: true}));
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