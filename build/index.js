"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  debug: true,
  ns: true,
  Request: true,
  request: true,
  transport: true,
  version: true,
  createAccount: true,
  Client: true,
  Sandbox: true,
  createSandbox: true
};
Object.defineProperty(exports, "debug", {
  enumerable: true,
  get: function get() {
    return _debug["default"];
  }
});
Object.defineProperty(exports, "Request", {
  enumerable: true,
  get: function get() {
    return request.Request;
  }
});
Object.defineProperty(exports, "version", {
  enumerable: true,
  get: function get() {
    return _package.version;
  }
});
Object.defineProperty(exports, "createAccount", {
  enumerable: true,
  get: function get() {
    return _accounts.createAccount;
  }
});
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function get() {
    return _client.Client;
  }
});
Object.defineProperty(exports, "Sandbox", {
  enumerable: true,
  get: function get() {
    return _sandbox.Sandbox;
  }
});
Object.defineProperty(exports, "createSandbox", {
  enumerable: true,
  get: function get() {
    return _sandbox.createSandbox;
  }
});
exports.transport = exports.request = exports.ns = void 0;

var _debug = _interopRequireDefault(require("./debug"));

var ns = _interopRequireWildcard(require("./namespace"));

exports.ns = ns;

var request = _interopRequireWildcard(require("./request"));

exports.request = request;

var transport = _interopRequireWildcard(require("./transport"));

exports.transport = transport;

var _package = require("../package");

var _accounts = require("./accounts");

var _calendars = require("./calendars");

Object.keys(_calendars).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _calendars[key];
    }
  });
});

var _client = require("./client");

var _contacts = require("./contacts");

Object.keys(_contacts).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _contacts[key];
    }
  });
});

var _model = require("./model");

Object.keys(_model).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _model[key];
    }
  });
});

var _sandbox = require("./sandbox");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }