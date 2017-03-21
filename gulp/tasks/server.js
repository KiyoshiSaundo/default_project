// server.js

var params = require('../params.js');

var gulp  = require('gulp'),
    bSync = require('browser-sync').create();

gulp.task('server', function() {
	bSync.init({
		server: {
			baseDir: params.paths.server
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