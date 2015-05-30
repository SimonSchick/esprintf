'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var spawn = require('child_process').spawn;
var Q = require('q');

function validateFiles(files) {
	return Q.Promise(function(resolve, reject) {
		gulp.src(files)
		.pipe($.jshint())
		.pipe($.jshint.reporter(require('jshint-stylish')))
		.pipe($.jshint.reporter('fail'))
		.pipe($.jscs())
		.pipe($.filter(['*', '!test/*']))
		.pipe($.istanbul()) // Covering files
		.pipe($.istanbul.hookRequire()) // Force `require` to return covered files
		.on('finish', function () {
			gulp.src(['test/*.js'])
			.pipe($.mocha())
			.pipe($.istanbul.writeReports()) // Creating the reports after tests runned
			.pipe($.istanbul.enforceThresholds({
				thresholds: {
					global: 90
				}
			})) // Enforce a coverage of at least 90%
			.on('end', resolve)
			.on('error', reject);
		})
		.on('error', reject);
	});
}

gulp.task('git-pre-commit', function() {
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

gulp.task('validate', function(cb) {
	return validateFiles([
		'**/*.js',
		'!node_modules/**/*',
		'!docs/**/*',
		'!coverage/**/'
	]);
});
