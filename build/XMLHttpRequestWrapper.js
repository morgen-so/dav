'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var debug = require('./debug')('dav:xmlhttprequest');
var request = require('request');

/**
 * @fileoverview Promise wrapper around native xhr api.
 */

var XMLHttpRequestWrapper = (function () {
	function XMLHttpRequestWrapper() {
		_classCallCheck(this, XMLHttpRequestWrapper);

		this.sandbox = null;
		this._options = null;
		this._request = null;
		this._response = null;
		this._responseText = null;
		this._defaultTimeout = 15000;
	}

	_createClass(XMLHttpRequestWrapper, [{
		key: 'abort',
		// OPENED
		value: function abort() {
			if (this._request) this._request.abort();
		}
	}, {
		key: 'getResponseHeader',
		value: function getResponseHeader(headerName) {
			return this._response ? this._response.headers[headerName.toLowerCase()] : null;
		}
	}, {
		key: 'setRequestHeader',
		value: function setRequestHeader(header, value) {
			if (!this._options) throw new Error("Request must be initialized with open() before setting headers");
			if (!this._options.headers) this._options.headers = {};
			this._options.headers[header] = value;
		}
	}, {
		key: 'open',
		value: function open(method, url, async, user, password) {
			this._responseText = null;
			this._response = null;
			this._request = null;
			this._options = {
				method: method,
				url: url,
				auth: user ? {
					user: user,
					pass: password,
					sendImmediately: false
				} : undefined,
				timeout: this._defaultTimeout
			};
		}
	}, {
		key: 'send',
		value: function send(data) {
			var _this = this;

			debug('Sending request data: ' + data);
			if (this.sandbox) this.sandbox.add(this);
			if (data) this._options.body = data;
			return new Promise(function (resolve, reject) {
				_this._request = request(_this._options, function (error, response, body) {
					_this._response = response;
					if (error) return reject(error);
					if (response.statusCode < 200 || response.statusCode >= 400) {
						var _error = new Error('Bad status ' + response.statusCode + ': ' + body);
						_error.code = response.statusCode;
						return reject(_error);
					}
					// Ok
					_this._responseText = body;
					return resolve(body);
				});
			});
		}
	}, {
		key: 'status',
		get: function get() {
			return this._response ? this._response.statusCode : null;
		}
	}, {
		key: 'responseText',
		get: function get() {
			return this._responseText;
		}
	}, {
		key: 'response',
		get: function get() {
			throw new Error("Not implemented");
		}
	}, {
		key: 'timeout',
		get: function get() {
			return this._defaultTimeout;
		},
		set: function set(ms) {
			if (this._options) this._options.timeout = ms;
		}
	}, {
		key: 'responseType',
		get: function get() {
			return this.getResponseHeader("Content-Type");
		}
	}, {
		key: 'readyState',
		get: function get() {
			if (!this._options) return 0; // UNSENT
			else if (this._response) return 4; // DONE
				else return 1;
		}
	}]);

	return XMLHttpRequestWrapper;
})();

exports['default'] = XMLHttpRequestWrapper;
module.exports = exports['default'];