var gulp   = require('gulp'),
    rimraf = require('rimraf');

/* =============== PARAMS =============== */

var params = {

	isImageMin : false,
	isCssMap : false,

	prefixer : ['last 3 versions'],

	bSync  : require('browser-sync').create(),
	server : {
		path     : __dirname + '/www/static',
		tunnel   : false,
		open     : false, // 'tunnel'
		logLevel : 'silent', // 'info'
	},

	path: {
		root : __dirname,
		in   : __dirname + '/source',
		out  : __dirname + '/www/static',
	}

};

/* =============== CUSTOM TASKS =============== */

includeTask('server');

var tasks = [
	'html',
	'styles',
	'mdrnzr',
	'scripts',
	'images',
	'sprites',
	'fonts'
];

for (var i = tasks.length - 1; i >= 0; i--) {
	includeTask( tasks[i] );
}

gulp.task('watch', function() {
	for (var i = tasks.length - 1; i >= 0; i--) {
		includeWatch( tasks[i] );
	}
});

/* =============== DEFAULT TASKS =============== */

gulp.task('build', tasks);
gulp.task('default', ['build', 'watch', 'server']);
gulp.task('clean', function() {
	rimraf(params.path.out, function () {
		console.log('static clean');
	});
});

/* =============== HELPERS =============== */

function includeTask(task) {
	var t = require('./gulp/tasks/'+task);
	return t.task(task, params);
}
function includeWatch(task) {
	var t = require('./gulp/tasks/'+task);
	return t.watch(task, params);
}