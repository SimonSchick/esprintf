'use strict';

var esprintf = require('../');

console.log(esprintf('%s %s %s', 'a', 'b', 'c'));
console.log(esprintf('%s %s %s', 'a', 'b', 'c'));
console.log(esprintf('%-s %-s %-s', 'a', 'b', 'c'));
console.log(esprintf('%-*s %-*s %-*s %-*s %-*s', 'asda', 20, 'asdas', 21, 'asda', 22, 'asdasd', 23, 'asdasd', 24));
console.log(esprintf('%*s', 'asda', 0));
