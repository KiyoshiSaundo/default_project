// mdrnzr.js

var gulp   = require('gulp'),
    watch  = require('gulp-watch'),
    mkdirp = require('mkdirp'),
    fs     = require('fs'),
    mdrnzr = require('modernizr');

module.exports = {
	task: function(taskName, params) {
		var pathIn      = params.path.root + '/modernizr-config.json';
		var pathOutDir  = params.path.out + '/js';
		var pathOutFile = params.path.out + '/js/modernizr.js';
		var pathOutBDir  = params.path.bitrix + '/js';
		var pathOutBFile = params.path.bitrix + '/js/modernizr.js';

		gulp.task(taskName, function() {
			var config = require(pathIn);
			return mdrnzr.build(config, function(code) {
				mkdirp(pathOutDir, function() {
					fs.writeFile(pathOutFile, code);
				});
				if (params.isBitrix) {
					mkdirp(pathOutBDir, function() {
						fs.writeFile(pathOutBFile, code);
					});
				}
			});
		});
	},
	watch: function (taskName, params) {
		var pathWatch = [
			params.path.root + '/modernizr-config.json'
		];

		watch(pathWatch, function() {
			gulp.start(taskName, params.bSync.reload);
		});
	}
};