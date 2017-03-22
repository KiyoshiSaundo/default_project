// server.js

var gulp  = require('gulp');

module.exports = {
	task: function(taskName, params) {
		gulp.task(taskName, function() {
			params.bSync.init({
				server: {
					baseDir: params.server.path
				},
				notify: false,
				tunnel: params.server.tunnel,
				host: 'localhost',
				port: 9000,
				logLevel: params.server.logLevel,
				logPrefix: "server",
				open: params.server.open
			});
		});
	}
};