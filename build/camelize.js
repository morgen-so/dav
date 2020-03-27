"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = camelize;

/**
 * @fileoverview Camelcase something.
 */
function camelize(str) {
  var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '_';
  var words = str.split(delimiter);
  return [words[0]].concat(words.slice(1).map(function (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  })).join('');
}