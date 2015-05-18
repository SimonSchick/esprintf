'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var spawn = require('child_process').spawn;
var Q = require('q');

function validateFiles(files) {
	return gulp.src(files)
	.pipe($.jshint())
	.pipe($.jshint.reporter(require('jshint-stylish')))
	.pipe($.jshint.reporter('fail'))
	.pipe($.jscs());
}

gulp.task('git-pre-commit', function(done) {
	var process = spawn('git', ['diff', '--name-only', '--staged', '--', '*.js']);

	var buffer = new Buffer(0);

	process.stdout.on('data', function(data) {
		buffer = Buffer.concat([buffer, data]);
	});

	//this is a tiny hack as Q doesn't seem to supply a method to do this easily...
	return Q.Promise(function(resolve, reject) {
		process.on('close', function(code) {
			try {
				if (code !== 0) {
					reject(new Error('Failed to fetch changed files from git'));
				}
				var files = buffer.toString().trim().split('\n');
				resolve(validateFiles(files));
			} catch (error) {
				reject(error);
			}
		});
	});
});

gulp.task('validate', function() {
	return validateFiles([
		'**/*.js',
		'!node_modules/**/*',
		'!docs/**/*'
	]);
});
