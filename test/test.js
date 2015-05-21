'use strict';

var esprintf = require('../');
var assert = require('assert');

/* global describe, it */

describe('esprintf', function() {
	it('Does not delete dashes from the formatted string', function() {
		assert.equal(esprintf('%s', '-'), '-');
	});

	it('Correctly formats 3 string values of length 1', function() {
		assert.equal(esprintf('%s %s %s', 'a', 'b', 'c'), 'a b c');
	});

	it('Correctly formats 3 string values of length 1 with left justification and no min width', function() {
		assert.equal(esprintf('%-s %-s %-s', 'a', 'b', 'c'), 'a b c');
	});

	it('Correctly padds a format with 6 dynamic strings with dynamic length', function() {
		assert.equal(
			esprintf('%-*s %-*s %-*s %-*s %-*s', 'asda', 20, 'asdas', 21, 'asda', 22, 'asdasd', 23, 'asdasd', 24),
			'asda                 asdas                 asda                   asdasd                  asdasd                  '
		);
	});

	it('Correctly truncates the string length for a string with a dynamic width of 0', function() {
		assert.equal(esprintf('%*s', 'asda', 0), '');
	});
});
