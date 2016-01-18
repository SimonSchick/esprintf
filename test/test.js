'use strict';

const esprintf = require('../');
const assert = require('assert');

/* global describe, it */

function testErrorMessage(regex) {
	return error => regex.test(error.message);
}

/* eslint-disable max-nested-callbacks */

describe('esprintf', () => {

	describe('general', () => {
		it('Trims a string if the set length is less than the string length', () => {
			assert.equal(esprintf('%3s', 'abcdef'), 'abc');
		});

		it('Trims a string if the set length is less than the string length', () => {
			assert.equal(esprintf('%-3s', 'abcdef'), 'abc');
		});

		it('Throws when mixing assoc with non assoc formatting', () => {
			assert.throws(
				() => {
					esprintf('%s %(test)d', {
						test: 1
					});
				},
				testErrorMessage(/Cannot use associative parameters mixed with non associative/)
			);
		});

		it('Throws when no parameter for dynamic width is set', () => {
			assert.throws(
				() => {
					esprintf('%*s', 'test');
				},
				testErrorMessage(/No value for dynamic width for parameter no/)
			);
		});

		it('Throws when no parameter for dynamic precision is set', () => {
			assert.throws(
				() => {
					esprintf('%.*d', 21);
				},
				testErrorMessage(/No value for dynamic precision for parameter no/)
			);
		});

		it('Throws when no parameter is available', () => {
			assert.throws(
				() => {
					esprintf('%s');
				},
				testErrorMessage(/No value for format parameter no/)
			);
		});

		it('Throws when getting a string where the param should be a number', () => {
			assert.throws(
				() => {
					esprintf('%d', 'u wot m8');
				},
				testErrorMessage(/Invalid value for format parameter no/)
			);
		});

		it('Does not trim or padd a value with the correct length', () => {
			assert.equal(esprintf('%4s', 'test'), 'test');
		});
	});

	describe('%%', () => {
		it('Replaces %% with %', () => {
			assert.equal(esprintf('%%'), '%');
		});
	});


	describe('%s', () => {
		it('Does not delete dashes from the formatted string', () => {
			assert.equal(esprintf('%s', '-'), '-');
		});

		it('Correctly formats 3 string values of length 1', () => {
			assert.equal(esprintf('%s %s %s', 'a', 'b', 'c'), 'a b c');
		});

		it('Correctly formats 3 string values of length 1 with left justification and no min width', () => {
			assert.equal(esprintf('%-s %-s %-s', 'a', 'b', 'c'), 'a b c');
		});

		it('Correctly padds a format with 6 dynamic strings with dynamic length', () => {
			assert.equal(
				esprintf(
					'%-*s %-*s %-*s %-*s %-*s', 'asda', 20, 'asdas', 21, 'asda', 22, 'asdasd', 23, 'asdasd', 24
					),
				'asda                 asdas                 asda                   asdasd                  asdasd                  ' //eslint-disable-line
			);
		});

		it('Correctly truncates the string length for a string with a dynamic width of 0', () => {
			assert.equal(esprintf('%*s', 'asda', 0), '');
		});
	});

	describe('%i/%d', () => {
		it('Correctly formats a single integer', () => {
			assert.equal(esprintf('%i', 123456), '123456');
		});

		it('Correctly formats a single integer with forced prefix', () => {
			assert.equal(esprintf('%+i', 123456), '+123456');
		});

		it('Correctly truncates a single integer with fixed length', () => {
			assert.equal(esprintf('%3i', 123456), '123');
		});

		it('Correctly padds a single integer with zeros', () => {
			assert.equal(esprintf('%07i', 123456), '0123456');
		});

		it('Correctly rounds to an integer value', () => {
			assert.equal(esprintf('%i', 3.1415), '3');
		});

		it('Correctly formats negative numbers', () => {
			assert.equal(esprintf('%i', -123456), '-123456');
		});

		it('Correctly formats forced prefix number with +', () => {
			assert.equal(esprintf('%+i', 123456), '+123456');
		});

		it('Correctly adds a whitespace when blank prefix is precified', () => {
			assert.equal(esprintf('% i %i', 123456, -123456), ' 123456 -123456');
		});
	});

	function repeat(str, num) {
		if (num < 0) {
			return '';
		}
		return new Array(num + 1).join(str);
	}

	function paddLeft(str, length, what) {
		if (length <= str.length) {
			return str.substring(0, length);
		}
		what = what || ' ';
		return repeat(what, length - str.length) + str;
	}


	describe('%f', () => {
		it('Correctly formats a single float', () => {
			assert.equal(
				esprintf('%f', 123456.12345),
				123456.12345.toLocaleString(undefined, {minimumSignificantDigits: 12}));
		});

		it('Correctly formats a single float with forced prefix', () => {
			assert.equal(esprintf('%+f', 12346.123), '+' + 12346.123.toLocaleString() + '000');
		});

		it('Correctly truncates a single float with fixed length', () => {
			assert.equal(esprintf('%3f', 123456.123), (123).toLocaleString());
		});

		it('Correctly padds a single float with zeros', () => {
			assert.equal(
				esprintf('%09f', 123456),
				paddLeft((123456).toLocaleString(undefined, {minimumSignificantDigits: 12}) + '.000000', 9, '0')
			);
		});

		it('Correctly padds a single float with zeros and a floating point length of 2', () => {
			assert.equal(esprintf('%010.2f', 123456.12), paddLeft(123456.12.toLocaleString(), 10, '0'));
		});

		it('Has no floating point if precision is 0', () => {
			assert.equal(esprintf('%010.0f', 123456), paddLeft((123456).toLocaleString(), 10, '0'));
		});

		it('Corretly formats a number with dynamic precision', () => {
			assert.equal(esprintf('%.*f', 123.1234, 3), 123.123.toLocaleString());
		});
	});

	describe('%x', () => {
		it('Single value', () => {
			assert.equal(esprintf('%x', 0xff), 'ff');
		});

		it('Single value with forced prefix', () => {
			assert.equal(esprintf('%#x', 0xff), '0xff');
		});
	});

	describe('%c', () => {
		it('Single value', () => {
			assert.equal(esprintf('%c', 'a'.charCodeAt(0)), 'a');
		});

		it('Throws if argument is not a number', () => {
			assert.throws(
				() => {
					esprintf('%c', 'a');
				},
				testErrorMessage(/Argument for %c must be a number/)
			);
		});
	});

	describe('%b', () => {
		it('Single value', () => {
			assert.equal(esprintf('%b', 15), '1111');
		});

		it('Single floating point value', () => {
			assert.equal(esprintf('%b', 111.1), '1101111.000110');
		});
	});

	describe('%a', () => {
		it('Single value', () => {
			assert.equal(esprintf('%09a', 123456), '001e240p0');
		});
	});

	describe('%j', () => {
		it('Single value', () => {
			assert.equal(esprintf('%j', {
				top: 'kek'
			}), '{"top":"kek"}');
		});

		it('Single value with custom padding', () => {
			assert.equal(esprintf('%\'\tj', {
				top: 'kek'
			}), '{\n\t"top": "kek"\n}');
		});
	});

	describe('Index based formatting', () => {
		it('Works with a single value', () => {
			assert.equal(
				esprintf('%1$s', 'woo'),
				'woo'
			);
		});

		it('Works with more than 1 value', () => {
			assert.equal(
				esprintf('%2$s %1$s', 'wuff', 'waff'),
				'waff wuff'
			);
		});

		it('Works with more than 1 referencing the same value', () => {
			assert.equal(
				esprintf('%1$s %1$s', 'wuff'),
				'wuff wuff'
			);
		});
	});

	describe('Associative formatting', () => {
		it('Works with a single value', () => {
			assert.equal(
				esprintf('%(test)s', {
					test: 'woo'
				}),
				'woo'
			);
		});

		it('Works with more than 1 value', () => {
			assert.equal(
				esprintf('%(test2)s %(test)s', {
					test: 'wuff',
					test2: 'waff'
				}),
				'waff wuff'
			);
		});

		it('Works with more than 1 referencing the same value', () => {
			assert.equal(
				esprintf('%(test)s %(test)s', {
					test: 'wuff'
				}),
				'wuff wuff'
			);
		});

		it('Throws when the assoc parameter is not set', () => {
			assert.throws(
				() => {
					esprintf('%(test)s', {
						test2: 1
					});
				},
				testErrorMessage(/No value for format parameter/)
			);
		});

		it('Throws when the assoc parameter with json', () => {
			assert.throws(
				() => {
					esprintf('%(test)j', {
						test: {
							wot: 1
						}
					});
				},
				testErrorMessage(/Cannot use associative parameters mixed with non associative using json/)
			);
		});

		it('Throws when the identifier is unknown', () => {
			assert.throws(
				() => {
					esprintf('%k', 1);
				},
				testErrorMessage(/Unsupport identified/)
			);
		});
	});

	describe('madness', () => {
		it('Is probably not a valid usecase', () => {
			assert.equal(
				esprintf(
					'%b %d %i %u %o %x %X %5f %F %e %E %g %G %a %A %c %s',
					111, //b
					42, //d
					42, //i
					42, //u
					42, //o
					42, //x
					42, //X
					42.42, //f
					42.42, //F
					42154654.42, //e
					42154654.42, //E
					42154654.42, //g
					42154654.42, //G
					42154654.42, //a
					42154654.42, //A
					'a'.charCodeAt(0), //c
					'aefiosf'//s
				),
				'1101111 42 42 42 52 2a 2A ' + 42.42.toLocaleString() + ' 42.420000 4.215465e+7 4.215465E+7 4.21547e+7 4.21547E+7 2833a9e.6b851ep0 2833A9E.6B851EP0 a aefiosf'//eslint-disable-line
			);
		});
	});
});
