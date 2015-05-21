'use strict';

var esprintf = require('../');
var assert = require('assert');

/* global describe, it */

describe('esprintf', function() {
	describe('Testing string formatting', function() {
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

	describe('Testing integer formatting', function() {
		it('Correctly formats a single integer', function() {
			assert.equal(esprintf('%i', 123456), '123456');
		});

		it('Correctly formats a single integer with forced prefix', function() {
			assert.equal(esprintf('%+i', 123456), '+123456');
		});

		it('Correctly truncates a single integer with fixed length', function() {
			assert.equal(esprintf('%3i', 123456), '123');
		});

		it('Correctly padds a single integer with zeros', function() {
			assert.equal(esprintf('%07i', 123456), '0123456');
		});
	});

	describe('Testing float formatting', function() {
		it('Correctly formats a single float', function() {
			assert.equal(esprintf('%f', 123456.12345), '123456.12345');
		});

		it('Correctly formats a single float with forced prefix', function() {
			assert.equal(esprintf('%+f', 12346.123), '+12346.123');
		});

		it('Correctly truncates a single float with fixed length', function() {
			assert.equal(esprintf('%3f', 123456.123), '123');
		});

		it('Correctly padds a single float with zeros', function() {
			assert.equal(esprintf('%09f', 123456), '000123456');
		});

		it('Correctly padds a single float with zeros and a floating point length of 2', function() {
			assert.equal(esprintf('%010.2f', 123456.12), '0123456.12');
		});
	});
});
