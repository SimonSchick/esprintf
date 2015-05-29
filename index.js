'use strict';

/**
 * Repeats a string num times.
 * @param  {string} str
 * @param  {number} num
 * @return {string}
 */
function repeat(str, num) {
	if (num < 0) {
		return '';
	}
	return new Array(num + 1).join(str);
}

/**
 * Padds or truncates a string left.
 * @param  {string} str    The string to be modified
 * @param  {number} length Length of the final string
 * @param  {string} what   The padding string(should be one character)
 * @return {string}
 */
function paddLeft(str, length, what) {
	if (length <= str.length) {
		return str.substring(0, length);
	}
	what = what || ' ';
	return repeat(what, length - str.length) + str;
}

/**
 * Padds or truncates a string right.
 * @param  {string} str    The string to be modified
 * @param  {number} length Length of the final string
 * @param  {string} what   The padding string(should be one character)
 * @return {string}
 */
function paddRight(str, length, what) {
	if (length <= str.length) {
		return str.substring(0, length);
	}
	what = what || ' ';
	return str + repeat(what, length - str.length);
}

/**
 * Utility function to check if a string is included in a string
 * @param  {string} str
 * @param  {string} what
 * @return {boolean}
 */
function contains(str, what) {
	return str.indexOf(what) !== -1;
}

var types = {
	number: 0,
	string: 1
};

/**
 * Converts the given value to the new numeric base and truncates the precision to the given value.
 * @param  {number} base Should follow the restrictions of Number.prototype.toString()
 * @param  {number} value
 * @param  {number} precision
 * @return {string}
 */
function precBase(base, value, precision, onlyIfPrecision) {
	var val = value.toString(base);
	var floatingPoint = val.indexOf('.');
	if (precision === 0 && floatingPoint > -1) {
		return val.substring(0, floatingPoint);//Node version > 0.10.*
	}
	if (floatingPoint === -1) {
		if (precision > 0 && !onlyIfPrecision) {
			return val + '.' + repeat('0', precision);//Node v0.10.*
		}
		return val;
	}
	if (val.length - floatingPoint > precision) {
		return val.substring(0, floatingPoint + precision + 1);
	} else if (val.length - floatingPoint < precision) {
		return val + repeat('0', precision - (val.length - floatingPoint) + 1);//Node v0.10.*
	}
	return val;//Node v0.10.*
}

//List of possible specifiers with transformation and validation
var specifiers = {
	d: {
		transform: function(a) { return a | 0; },
		allowSign: true,
		type: types.number
	},
	u: {
		transform: function(a) { return a >>> 0; },
		allowSign: true,
		type: types.number
	},
	o: {
		transform: function(a) { return a.toString(8); },
		prefix: '0',
		type: types.number
	},
	x: {
		transform: function(a) { return Math.floor(a).toString(16); },
		prefix: '0x',
		type: types.number
	},
	X: {
		transform: function(a) { return specifiers.x.transform(a).toUpperCase(); },
		prefix: '0X',
		type: types.number
	},
	f: {
		transform: function(a, b) {
			return precBase(10, a.toLocaleString(
				undefined,
				{
					minimumSignificantDigits: 21
				}
			), b);
		},
		allowSign: true,
		type: types.number
	},
	F: {
		transform: function(a, b) { return a.toFixed(b); },
		allowSign:	true,
		type:		types.number
	},
	e: {
		transform: function(a, b) { return a.toExponential(b); },
		allowSign: true
	},
	E: {
		transform: function(a, b) { return specifiers.e.transform(a, b).toUpperCase(); },
		allowSign: true,
		type: types.number
	},
	g: {
		transform: function(a, b) { return a.toPrecision(b); },
		allowSign: true,
		type: types.number
	},
	G: {
		transform: function(a, b) { return a.toPrecision(b).toUpperCase(); },
		allowSign: true,
		type: types.number
	},
	a: {
		transform: function(a, b) {
			return precBase(16, a, b, true) + 'p0';
		},
		allowSign: true,
		prefix: '0x',
		type: types.number
	},
	A: {
		transform: function(a, b) { return specifiers.a.transform(a, b).toUpperCase(); },
		allowSign: true,
		prefix: '0X',
		type: types.number
	},
	c: {
		transform: function(a, b) {
			if (typeof a !== 'number') {
				throw new TypeError('Argument for %c must be a number');
			}
			return String.fromCharCode(a);
		}
	},
	s: {
		type: types.string
	},
	b: {
		transform: function(a, b) { return precBase(2, a, b, true); },
		type: types.number
	},
	j: {
		transform: function(a, b, customPadding) {
			return JSON.stringify(a, null, customPadding);
		}
	}
};
//Alias
specifiers.i = specifiers.d;

//The regex used for matching flags, note that at the moment this also includes \w to catch bad identifiers
var reg = /%(?:(\d+)\$|\((\w+)\))?([+# -]*)('(.)|0)?((?:\d|\*)+)?(?:\.([\d*]*))?([bdiuoxXfFeEgGaAcsj%\w])/g;

/**
 * Formats arguments according to the given format string.
 * Supports sequential, referential and associative formatting rules.
 * @param  {string} formatString
 * @param  {...number|Object} vararg The arguments to be passed when formatting non-associative
 * OR the object holding the key value pairs for associative formatting
 * @return {string}
 */
function esprintf(formatString) {
	var valueIdx = 0;
	var parentArguments = arguments;
	var isAssoc = arguments[1] instanceof Object;
	// jshint maxparams:10
	return formatString.replace(reg,
		function(wholeMatch, reference, assocReference, flags, zeroPadding, customPadding, width, precision, type) {
		// jshint maxparams: 4
		if (type === '%') {
			return '%';
		}

		valueIdx++;

		reference = parseInt(reference) || valueIdx;

		flags = flags || '';

		var leftJustify = contains(flags, '-');
		var forceSign = contains(flags, '+');
		var blankFill = contains(flags, ' ');
		var forcePrecisionOrPrefix = contains(flags, '#');

		customPadding = customPadding || zeroPadding;

		var padding = customPadding || ' ';

		var value;

		if (isAssoc && type !== 'j') {//special handling of JSON :/
			if (!assocReference) {
				throw new SyntaxError('Cannot use associative parameters mixed with non associative');
			}
			value = parentArguments[1][assocReference];
			if (value === undefined) {
				throw new Error('No value for format parameter \'' + assocReference + '\'');
			}
		} else {
			if (assocReference) {
				throw new SyntaxError('Cannot use associative parameters mixed with non associative using json');
			}
			value = parentArguments[reference];
		}

		if (width === '*') {
			width = parentArguments[++reference];
			valueIdx++;

			if (width === undefined) {
				throw new Error('No value for dynamic width for parameter no. ' + (reference - 2));
			}
		} else {
			width = parseInt(width);
		}

		if (precision === '*') {
			precision = parentArguments[++reference];
			valueIdx++;
			if (precision === undefined) {
				throw new Error('No value for dynamic precision for parameter no. ' + (reference - 3));
			}
		}

		var specifier = specifiers[type];

		if (precision === undefined) {
			precision = 6;
		}
		precision = parseInt(precision);



		if (!specifier) {
			throw new Error('Unsupport identified \'' + type + '\'');
		}

		if (value === undefined) {
			throw new Error('No value for format parameter no. ' + (reference - 1));
		}

		if (specifier.type === types.number && !parseInt(value)) {
			throw new TypeError('Invalid value for format parameter no. ' + (reference - 1) + ' expected number, got string');
		}
		var ret = specifier.transform ? specifier.transform(value, precision, customPadding) : value;

		var allowSign = specifier.allowSign;
		var prefix = specifier.prefix;

		ret = ret.toString();

		var fullPrefix = (forcePrecisionOrPrefix ? prefix : '') +
		(
			(forceSign && allowSign && value > 0) ? '+' : (blankFill ? ' ' : '')
		);

		if (width !== undefined && width === width) {//width might be NaN
			var method = leftJustify ? paddRight : paddLeft;

			if (padding === '0') {
				return fullPrefix + method(ret, width, '0');
			}
			return method(fullPrefix + ret, width, padding);
		}

		return fullPrefix + ret;

	});
}

module.exports = esprintf;
