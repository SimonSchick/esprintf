'use strict';

var esprintf = require('../');
var assert = require('assert');

/* global describe, it */


describe('esprintf', function() {
	describe('%s', function() {
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

	describe('%i', function() {
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

		it('Correctly rounds to an integer value', function() {
			assert.equal(esprintf('%i', 3.1415), '3');
		});
	});

	describe('%f', function() {
		it('Correctly formats a single float', function() {
			assert.equal(esprintf('%f', 123456.12345), (123456.12345).toLocaleString());
		});

		it('Correctly formats a single float with forced prefix', function() {
			assert.equal(esprintf('%+f', 12346.123), '+' + (12346.123).toLocaleString());
		});

		it('Correctly truncates a single float with fixed length', function() {
			assert.equal(esprintf('%3f', 123456.123), (123).toLocaleString());
		});

		it('Correctly padds a single float with zeros', function() {
			assert.equal(esprintf('%09f', 123456), '000' + (123456).toLocaleString());
		});

		it('Correctly padds a single float with zeros and a floating point length of 2', function() {
			assert.equal(esprintf('%010.2f', 123456.12), '0' + (123456.12).toLocaleString());
		});
	});

	describe('%x', function() {
		it('Single value', function() {
			assert.equal(esprintf('%x', 0xff), 'ff');
		});

		it('Single value with forced prefix', function() {
			assert.equal(esprintf('%#x', 0xff), '0xff');
		});
	});

	describe('%c', function() {
		it('Single value', function() {
			assert.equal(esprintf('%c', 'a'.charCodeAt(0)), 'a');
		});
	});

	describe('%b', function() {
		it('Single value', function() {
			assert.equal(esprintf('%b', 15), '1111');
		});
	});

	describe('%j', function() {
		it('Single value', function() {
			assert.equal(esprintf('%j', {
				top: 'kek'
			}), '{"top":"kek"}');
		});

		it('Single value with custom padding', function() {
			assert.equal(esprintf('%\'\tj', {
				top: 'kek'
			}), '{\n\t"top": "kek"\n}');
		});
	});

	describe('Index based formatting', function() {
		it('Works with a single value', function() {
			assert.equal(
				esprintf('%1$s', 'woo'),
				'woo'
			);
		});

		it('Works with more than 1 value', function() {
			assert.equal(
				esprintf('%2$s %1$s', 'wuff', 'waff'),
				'waff wuff'
			);
		});

		it('Works with more than 1 referencing the same value', function() {
			assert.equal(
				esprintf('%1$s %1$s', 'wuff'),
				'wuff wuff'
			);
		});
	});

	describe('Associative formatting', function() {
		it('Works with a single value', function() {
			assert.equal(
				esprintf('%(test)s', {
					test: 'woo'
				}),
				'woo'
			);
		});

		it('Works with more than 1 value', function() {
			assert.equal(
				esprintf('%(test2)s %(test)s', {
					test: 'wuff',
					test2: 'waff'
				}),
				'waff wuff'
			);
		});

		it('Works with more than 1 referencing the same value', function() {
			assert.equal(
				esprintf('%(test)s %(test)s', {
					test:'wuff'
				}),
				'wuff wuff'
			);
		});
	});

	describe('madness', function() {
		it('Is probably not a valid usecase', function() {
			assert.equal(
				esprintf(
					'%b %d %i %u %o %x %X %f %F %e %E %g %G %a %A %c %s',
					111,//b
					42,//d
					42,//i
					42,//u
					42,//o
					42,//x
					42,//X
					42.42,//f
					42.42,//F
					42154654.42,//e
					42154654.42,//E
					42154654.42,//g
					42154654.42,//G
					42154654.42,//a
					42154654.42,//A
					'a'.charCodeAt(0),//c
					'aefiosf'//s
				),
				//jscs:disable
				'110111 42 42 42 52 2a 2A ' + (42.42).toLocaleString() + ' 42.420000 4.215465e+7 4.215465E+7 4.21547e+7 4.21547E+7 2833a9e.6b851ep0 2833A9E.6B851EP0 a aefiosf'// jshint ignore:line
				//jscs:enable
			);
		});
	});
});
