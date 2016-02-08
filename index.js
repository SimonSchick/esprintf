'use strict';

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
	return what.repeat(length - str.length) + str;
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
	return str + what.repeat(length - str.length);
}

const types = {
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
function precBase(base, value, precision) {
	const val = value.toString(base);
	const floatingPoint = val.indexOf('.');
	if (precision === 0 && floatingPoint > -1) {
		return val.substring(0, floatingPoint);//Node version > 0.10.*
	}
	if (floatingPoint === -1) {
		return val;
	}
	if (val.length - floatingPoint > precision) {
		return val.substring(0, floatingPoint + precision + 1);
	}
}

//List of possible specifiers with transformation and validation
const specifiers = {
	d: {
		transform: a => a | 0,
		allowSign: true,
		type: types.number
	},
	u: {
		transform: a => a >>> 0,
		allowSign: true,
		type: types.number
	},
	o: {
		transform: a => a.toString(8),
		prefix: '0',
		type: types.number
	},
	x: {
		transform: a => Math.floor(a).toString(16),
		prefix: '0x',
		type: types.number
	},
	X: {
		transform: a => specifiers.x.transform(a).toUpperCase(),
		prefix: '0X',
		type: types.number
	},
	f: {
		transform: (a, b) => precBase(10, a.toLocaleString(
			undefined,
			{
				minimumSignificantDigits: 21
			}
		), b),
		allowSign: true,
		type: types.number
	},
	F: {
		transform: (a, b) => a.toFixed(b),
		allowSign: true,
		type: types.number
	},
	e: {
		transform: (a, b) => a.toExponential(b),
		allowSign: true
	},
	E: {
		transform: (a, b) => specifiers.e.transform(a, b).toUpperCase(),
		allowSign: true,
		type: types.number
	},
	g: {
		transform: (a, b) => a.toPrecision(b),
		allowSign: true,
		type: types.number
	},
	G: {
		transform: (a, b) => a.toPrecision(b).toUpperCase(),
		allowSign: true,
		type: types.number
	},
	a: {
		transform: (a, b) => precBase(16, a, b, true) + 'p0',
		allowSign: true,
		prefix: '0x',
		type: types.number
	},
	A: {
		transform: (a, b) => specifiers.a.transform(a, b).toUpperCase(),
		allowSign: true,
		prefix: '0X',
		type: types.number
	},
	c: {
		transform: a => {
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
		transform: (a, b) => precBase(2, a, b, true),
		type: types.number
	},
	j: {
		transform: (a, b, customPadding) => JSON.stringify(a, null, customPadding)
	}
};
//Alias
specifiers.i = specifiers.d;

//The regex used for matching flags, note that at the moment this also includes \w to catch bad identifiers
const reg = /%(?:(\d+)\$|\((\w+)\))?([+# -]*)('(.)|0)?((?:\d|\*)+)?(?:\.([\d*]*))?([bdiuoxXfFeEgGaAcsj%\w])/g;

/**
 * Formats arguments according to the given format string.
 * Supports sequential, referential and associative formatting rules.
 * @param  {string} formatString
 * @param  {...number|Object} vararg The arguments to be passed when formatting non-associative
 * OR the object holding the key value pairs for associative formatting
 * @return {string}
 */
function esprintf(formatString) {
	let valueIdx = 0;
	const parentArguments = arguments;
	const isAssoc = arguments[1] instanceof Object;
	// jshint maxparams:10
	return formatString.replace(reg, (wholeMatch, reference, assocReference, flags, zeroPadding, customPadding, width, precision, type) => { //eslint-disable-line
		// jshint maxparams: 4
		if (type === '%') {
			return '%';
		}

		valueIdx++;

		reference = parseInt(reference, 10) || valueIdx;

		flags = flags || '';

		const leftJustify = flags.includes('-');
		const forceSign = flags.includes('+');
		const blankFill = flags.includes(' ');
		const forcePrecisionOrPrefix = flags.includes('#');

		customPadding = customPadding || zeroPadding;

		const padding = customPadding || ' ';

		let value;

		if (isAssoc && type !== 'j') { //special handling of JSON :/
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
			width = parseInt(width, 10);
		}

		if (precision === '*') {
			precision = parentArguments[++reference];
			valueIdx++;
			if (precision === undefined) {
				throw new Error('No value for dynamic precision for parameter no. ' + (reference - 3));
			}
		}

		const specifier = specifiers[type];

		if (!specifier) {
			throw new SyntaxError('Unsupport identified \'' + type + '\'');
		}

		if (value === undefined) {
			throw new Error('No value for format parameter no. ' + (reference - 1));
		}

		if (precision === undefined) {
			precision = 6;
		}
		precision = parseInt(precision, 10);

		if (isNaN(precision)) {
			throw new TypeError('Bad precision value for format parameter no. ' + reference - 1);
		}

		if (specifier.type === types.number && !parseInt(value, 10)) {
			throw new TypeError(
				'Invalid value for format parameter no. ' + (reference - 1) + ' expected number, got string'
			);
		}
		let ret = specifier.transform ? specifier.transform(value, precision, customPadding) : value;

		const allowSign = specifier.allowSign;
		const prefix = specifier.prefix;

		ret = ret.toString();

		const fullPrefix = (forcePrecisionOrPrefix ? prefix : '') +
		(
			(forceSign && allowSign && value > 0) ? '+' : (blankFill ? ' ' : '') //eslint-disable-line
		);

		if (width !== undefined && !isNaN(width)) { //width might be NaN
			const method = leftJustify ? paddRight : paddLeft;

			if (padding === '0') {
				return fullPrefix + method(ret, width, '0');
			}
			return method(fullPrefix + ret, width, padding);
		}

		return fullPrefix + ret;

	});
}

module.exports = esprintf;
