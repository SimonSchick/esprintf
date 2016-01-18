'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const Q = require('q');

function promisifyStream(stream) {
	return new Q.Promise((resolve, reject) => {
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

function testAndCoverage() {
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
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failAfterError())
		.pipe($.filter(['*', '!test/*']))
		.pipe($.istanbul())
		.pipe($.istanbul.hookRequire())
	)
	.then(() => testAndCoverage(lcovOnly));
}

const files = [
	'**/*.js',
	'!node_modules/**/*',
	'!docs/**/*',
	'!coverage/**/'
];

gulp.task('default', () => {
	if (process.env.TRAVIS) {
		return validateFiles(files, true);
	}
	return validateFiles(files);
});

gulp.task('coveralls', coveralls);

gulp.task('git-pre-commit', ['default']);
