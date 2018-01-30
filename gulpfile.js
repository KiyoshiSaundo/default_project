// gulpfile.js

var gulp   = require('gulp'),
    rimraf = require('rimraf');

/* === SETTINGS - change it  ================================================ */

var isImageMin = false;
var isCssMap   = false;
var isServer   = false;
var bxTemplate = false; // or 'TEMPLATE_DIR_NAME'
var prefixer   = ['last 3 versions'];
var tasksList  = [
	'html',
	'styles',
	'mdrnzr',
	'scripts',
	'images',
	'sprites',
	'svgsprites',
	'fonts'
]

/* === GLOBAL PARAMS  ======================================================= */

var params = {

	tasksList : tasksList,

	isImageMin : imageMin,
	isCssMap   : cssMap,
	isBitrix   : bxTemplate ? true : false,

	prefixer : prefixer,

	bSync  : require('browser-sync').create(),
	server : {
		path     : __dirname + '/www/static',
		tunnel   : false,
		open     : false, // 'tunnel'
		logLevel : 'silent', // 'info'
	},

	path : {
		root   : __dirname,
		in     : __dirname + '/source',
		out    : __dirname + '/www/static',
		bitrix : __dirname + '/www/local/templates/' + bxTemplate
	}

};

/* === SERVER =============================================================== */

gulp.task('server', function() {
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

/* === TASKS ================================================================ */

for (var i = params.tasksList.length - 1; i >= 0; i--) {
	includeTask( params.tasksList[i] );
}

gulp.task('watch', function() {
	for (var i = params.tasksList.length - 1; i >= 0; i--) {
		includeWatch( params.tasksList[i] );
	}
});

/* === DEFAULT TASKS ======================================================== */

gulp.task('build', params.tasksList);
gulp.task('default', ['build', 'watch', 'server']);
gulp.task('clean', function() {
	rimraf(params.path.out, function () {
		console.log('static clean');
	});
});

/* === HELPERS ============================================================== */

function includeTask(task) {
	var t = require('./gulp/tasks/'+task);
	return t.task(task, params);
}
function includeWatch(task) {
	var t = require('./gulp/tasks/'+task);
	return t.watch(task, params);
}