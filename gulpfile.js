var gulp   = require('gulp'),
    rimraf = require('rimraf');

/* === PARAMS =============================================================== */

var params = {

	taskList : [
		'html',
		'styles',
		'mdrnzr',
		'scripts',
		'images',
		'sprites',
		// 'svgsprites',
		'fonts'
	],

	isImageMin : false,
	isCssMap   : false,
	isBitrix   : false,

	prefixer : ['last 3 versions'],

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
		bitrix : __dirname + '/www/local/templates/TEMPLATE'
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

for (var i = params.taskList.length - 1; i >= 0; i--) {
	includeTask( params.taskList[i] );
}

gulp.task('watch', function() {
	for (var i = params.taskList.length - 1; i >= 0; i--) {
		includeWatch( params.taskList[i] );
	}
});

/* === DEFAULT TASKS ======================================================== */

gulp.task('build', params.taskList);
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