'use strict';

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

function paddRight(str, length, what) {
	if (length <= str.length) {
		return str.substring(0, length);
	}
	what = what || ' ';
	return str + repeat(what, length - str.length);
}

function contains(str, what) {
	return str.indexOf(what) !== -1;
}

var types = {
	number: 0,
	string: 1
};

function precBase(base, value, precision) {
	var val = value.toString(base);
	var floatingPoint = val.indexOf('.');
	return val.substring(0, floatingPoint + precision + 1);
}

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
		transform: function(a, b) { return precBase(10, a.toLocaleString(), b); },
		allowSign: true,
		type: types.number
	},
	F: {
		transform: function(a, b) { return a.toFixed(b); },
		allowSign: true,
		type: types.number
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
		transform: function(a, b) { return specifiers.g.transform(a, b).toUpperCase(); },
		allowSign: true,
		type: types.number
	},
	a: {
		transform: function(a, b) {
			return precBase(16, a, b) + 'p0';
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
		transform: String.fromCharCode
	},
	s: {
		type: types.string
	},
	b: {
		transform: function(a, b) { return precBase(2, a, b); },
		type: types.number
	}
};

specifiers.i = specifiers.d;

var reg = /%(?:(\d+)\$|\((\w+)\))?([+ #-]*)('(.)|0)?((?:\d|\*)+)?(?:\.([\d*]*))?([bdiuoxXfFeEgGaAcsp%])/g;

function esprintf(formatString) {
	var valueIdx = 1;
	var parentArguments = arguments;
	var isAssoc = arguments[1] instanceof Object;
	// jshint maxparams:10
	return formatString.replace(reg,
		function(wholeMatch, reference, assocReference, flags, zeroPadding, customPadding, width, precision, type) {
		// jshint maxparams: 4
		if (type === '%') {
			return '%';
		}
		reference = parseInt(reference) || valueIdx;

		flags = flags || '';

		var leftJustify = contains(flags, '-');
		var forceSign = contains(flags, '+');
		var blankFill = contains(flags, ' ');
		var forcePrecisionOrPrefix = contains(flags, '#');

		customPadding = customPadding || zeroPadding;

		var padding = customPadding || ' ';

		var value;

		if (isAssoc) {
			if (!assocReference) {
				throw new Error('Cannot use associative parameters mixed with non associative');
			}
			value = parentArguments[1][assocReference];
			if (value === undefined) {
				throw new Error('No value for format parameter \'' + assocReference + '\'');
			}
		} else {
			if (assocReference) {
				throw new Error('Cannot use associative parameters mixed with non associative');
			}
			value = parentArguments[valueIdx++];
		}

		if (width === '*') {
			width = parentArguments[valueIdx++];

			if (width === undefined) {
				throw new Error('No value for dynamic width for parameter no. ' + (reference - 2));
			}
		} else {
			width = parseInt(width);
		}

		precision = parseInt(precision) || 6;
		if (precision === '*') {
			precision = parentArguments[valueIdx++];
			if (precision === undefined) {
				throw new Error('No value for dynamic precision for parameter no. ' + (reference - 3));
			}
		}

		var specifier = specifiers[type];
		if (!specifier) {
			throw new Error('Unsupport identified \'' + type + '\'');
		}

		if (value === undefined) {
			throw new Error('No value for format parameter no. ' + (reference - 1));
		}

		if (specifier.type === types.number && !parseInt(value)) {
			throw new TypeError('Invalid value for format parameter no. ' + (reference - 1) + ' expected number, got string');
		}
		var ret = specifier.transform ? specifier.transform(value, precision) : value;

		var allowSign = specifier.allowSign;
		var prefix = specifier.prefix;

		ret = ret.toString();

		var fullPrefix = (forcePrecisionOrPrefix ? prefix : '') +
		(
			(forceSign && allowSign && value > 0) ? '+' : (
				(value < 0) ? '-' : (blankFill ? ' ' : '')
			)
		);

		if (width !== undefined && width === width) {
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
