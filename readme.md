# esprintf

[![NPM](https://nodei.co/npm/esprintf.png)](https://nodei.co/npm/esprintf/)

[![Build Status](https://travis-ci.org/SimonSchick/esprintf.svg?branch=master)](https://travis-ci.org/SimonSchick/esprintf)
[![Dependencies](https://david-dm.org/SimonSchick/esprintf.svg)](https://david-dm.org/SimonSchick/esprintf)
[![Coverage Status](https://coveralls.io/repos/SimonSchick/esprintf/badge.svg)](https://coveralls.io/r/SimonSchick/esprintf)
[![npm version](http://img.shields.io/npm/v/esprintf.svg)](https://npmjs.org/package/esprintf)


## Requirements & Installation

Just run ```npm install esprintf```

## Usage

The following formatters are supported:

- b Binary
- d & i Decimial
- u Unsigned int
- o Octal
- x Lowercase hexadecimal 
- X Uppercase hexadecimal
- f Floating point number using locale
- F Floating point number
- e Expontential representation using locale
- E Expontential representation 
- g Shortest of both f and e
- G Shortest of both F and E
- a Lowercase hexadecimal floating point
- A Uppercase hexadecimal floating point
- c Character
- s String
- j JSON

All regular sprintf operations are supported:

- Padding/Truncation length and content specification
- Dynamic length and precision
- Forced prefix/sign
- Left justification

Furthermore this function supports index based and associative replacement:

Please see the tests for more info.

Please note that mixing regular and index based replacement is possible but NOT recommended as it's messy, mixing regular or index based with associate replacement is NOT possible.

JSON formatting special:

I added JSON formatting for convenience reasons(because I could), in order to use prettyfied json you need to pass the padding specifier eg.

```javascript
console.log(esprintf('%\'\tj', {
	hello: 'world'
}));
```

Will result in:

```json
{
	"hello":	"world"
}
```

It also supports template strings:

```javascript
esprintf`%.2${42.4242}f`;
```

Will result in:

`42.42`

