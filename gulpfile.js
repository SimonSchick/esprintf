'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var Q = require('q');


function promisifyStream(stream) {
	return new Q.Promise(function(resolve, reject) {
		stream
		.on('finish', resolve)
		.on('error', reject);
	});
}

function coveralls() {
	return promisifyStream(
		gulp.src(['coverage/lcov.info'])
		.pipe($.coveralls())
	);
}

function testAndCoverage(lcovOnly) {
	var reportOptions;

	if (lcovOnly) {
		reportOptions = {
			reporters: ['lcov', 'text', 'text-summary']
		};
	}

	return promisifyStream(
		gulp.src(['test/*.js'])
		.pipe($.mocha())
		.pipe($.istanbul.writeReports())
		.pipe($.istanbul.enforceThresholds({
			thresholds: {
				global: 90
			}
		}))
	);
}

function validateFiles(files, lcovOnly) {
	return promisifyStream(
		gulp.src(files)
		.pipe($.jshint())
		.pipe($.jshint.reporter(require('jshint-stylish')))
		.pipe($.jshint.reporter('fail'))
		.pipe($.jscs())
		.pipe($.filter(['*', '!test/*']))
		.pipe($.istanbul())
		.pipe($.istanbul.hookRequire())
	)
	.then(function() {
		return testAndCoverage(lcovOnly);
	});
}

var files = [
	'**/*.js',
	'!node_modules/**/*',
	'!docs/**/*',
	'!coverage/**/'
];

gulp.task('default', function() {
	if (process.env.TRAVIS) {
		return validateFiles(files, true);
	}
	return validateFiles(files);
});

gulp.task('coveralls', function() {
	return coveralls();
});

gulp.task('git-pre-commit', ['default']);
