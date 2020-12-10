(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dav = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var debug = require('./debug')["default"]('dav:xmlhttprequest');

var DEFAULT_TIMEOUT = 15000;
/**
 * @fileoverview Promise wrapper around native xhr api.
 */

var XMLHttpRequestWrapper = /*#__PURE__*/function () {
  function XMLHttpRequestWrapper() {
    (0, _classCallCheck2["default"])(this, XMLHttpRequestWrapper);
    this.sandbox = null;
    this._url = null;
    this._options = null;
    this._response = null;
    this._responseText = null;
    this._timeout = DEFAULT_TIMEOUT;
    this._abortController = new AbortController();
  }

  (0, _createClass2["default"])(XMLHttpRequestWrapper, [{
    key: "abort",
    value: function abort() {
      this._abortController.abort();
    }
  }, {
    key: "getResponseHeader",
    value: function getResponseHeader(headerName) {
      return this._response ? this._response.headers[headerName.toLowerCase()] : null;
    }
  }, {
    key: "setRequestHeader",
    value: function setRequestHeader(header, value) {
      if (!this._options) throw new Error('Request must be initialized with open() before setting headers');
      if (!this._options.headers) this._options.headers = {};
      this._options.headers[header] = value;
    }
  }, {
    key: "open",
    value: function open(method, url, async, user, password) {
      var followRedirect = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
      this._responseText = null;
      this._response = null;
      this._url = url;
      this._options = {
        method: method,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'minetime/request'
        },
        redirect: followRedirect ? 'follow' : 'manual',
        credentials: 'omit',
        signal: this._abortController.signal
      }; // Set Authorization request header

      if (user) {
        var credentialsStr = user + ':' + (password || '');
        var authHeader = "Basic ".concat(window.btoa(credentialsStr));
        this.setRequestHeader('Authorization', authHeader);
      }
    }
  }, {
    key: "send",
    value: function send(data) {
      var _this = this;

      debug("Sending request (".concat(this._options.method, ") to ").concat(this._url, " with data: ").concat(data));
      if (this.sandbox) this.sandbox.add(this);
      if (data) this._options.body = data;
      return new Promise( /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(resolve, reject) {
          var timeoutId, response, blob, responseText, error;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // Abort request after timer expires
                  timeoutId = setTimeout(function () {
                    return _this.abort();
                  }, _this._timeout);
                  _context.prev = 1;
                  _context.next = 4;
                  return fetch(_this._url, _this._options);

                case 4:
                  response = _context.sent;
                  _this._response = response;
                  clearTimeout(timeoutId); // Get response body

                  _context.next = 9;
                  return response.blob();

                case 9:
                  blob = _context.sent;
                  _context.next = 12;
                  return blob.text();

                case 12:
                  responseText = _context.sent;

                  if (response.ok) {
                    _context.next = 17;
                    break;
                  }

                  error = new Error("Bad status ".concat(response.status, ": ").concat(responseText));
                  error.code = response.status;
                  return _context.abrupt("return", reject(error));

                case 17:
                  // Ok
                  _this._responseText = responseText;
                  return _context.abrupt("return", resolve(responseText));

                case 21:
                  _context.prev = 21;
                  _context.t0 = _context["catch"](1);
                  return _context.abrupt("return", reject(_context.t0));

                case 24:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[1, 21]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "status",
    get: function get() {
      return this._response ? this._response.status : null;
    }
  }, {
    key: "responseText",
    get: function get() {
      return this._responseText;
    }
  }, {
    key: "response",
    get: function get() {
      throw new Error('Not implemented');
    }
  }, {
    key: "timeout",
    get: function get() {
      return this._timeout;
    },
    set: function set(ms) {
      this._timeout = ms;
    }
  }, {
    key: "responseType",
    get: function get() {
      return this.getResponseHeader('Content-Type');
    }
  }, {
    key: "readyState",
    get: function get() {
      if (!this._options) return 0; // UNSENT
      else if (this._response) return 4; // DONE
        else return 1; // OPENED
    }
  }]);
  return XMLHttpRequestWrapper;
}();

exports["default"] = XMLHttpRequestWrapper;

},{"./debug":7,"@babel/runtime/helpers/asyncToGenerator":27,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/createClass":29,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/regenerator":37}],2:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _co = _interopRequireDefault(require("co"));

var _url = _interopRequireDefault(require("url"));

var _calendars = require("./calendars");

var _contacts = require("./contacts");

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var _model = require("./model");

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

var debug = require('./debug')["default"]('dav:accounts');

var defaults = {
  accountType: 'caldav',
  loadCollections: true,
  loadObjects: false
};
/**
 * rfc 6764.
 *
 * @param {dav.Account} account to find root url for.
 */

var serviceDiscovery = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee(account, options) {
  var endpoint, uri, req, xhr, location;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          debug('Attempt service discovery.');
          endpoint = _url["default"].parse(account.server);
          endpoint.protocol = endpoint.protocol || 'http'; // TODO(gareth) https?

          uri = _url["default"].format({
            protocol: endpoint.protocol,
            host: endpoint.host,
            pathname: "/.well-known/".concat(options.accountType)
          });
          req = request.basic({
            method: 'GET'
          });
          _context.prev = 5;
          _context.next = 8;
          return options.xhr.send(req, uri, {
            sandbox: options.sandbox,
            followRedirect: false
          });

        case 8:
          xhr = _context.sent;

          if (!(xhr.status >= 300 && xhr.status < 400)) {
            _context.next = 14;
            break;
          }

          // http redirect.
          location = xhr.getResponseHeader('Location');

          if (!(typeof location === 'string' && location.length)) {
            _context.next = 14;
            break;
          }

          debug("Discovery redirected to ".concat(location));
          return _context.abrupt("return", _url["default"].resolve(_url["default"].format({
            protocol: endpoint.protocol,
            host: endpoint.host
          }), location));

        case 14:
          _context.next = 19;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](5);
          debug('Discovery failed... failover to the provided url');

        case 19:
          return _context.abrupt("return", endpoint.href);

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[5, 16]]);
}));
/**
 * rfc 5397.
 *
 * @param {dav.Account} account to get principal url for.
 */


var principalUrl = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee2(account, options) {
  var req, res, container, principal;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          debug("Fetch principal url from context path (rootUrl) ".concat(account.rootUrl, "."));
          req = request.propfind({
            props: [{
              name: 'current-user-principal',
              namespace: ns.DAV
            }, {
              name: 'owner',
              namespace: ns.DAV
            }],
            depth: 0,
            mergeResponses: true
          });
          _context2.next = 4;
          return options.xhr.send(req, account.rootUrl, {
            sandbox: options.sandbox
          });

        case 4:
          res = _context2.sent;
          container = res.props;
          principal = container.currentUserPrincipal || container.owner;
          debug("Received principal: ".concat(principal));
          return _context2.abrupt("return", _url["default"].resolve(account.rootUrl, principal));

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));
/**
 * @param {dav.Account} account to get home url for.
 */


var homeUrl = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee3(account, options) {
  var prop, req, responses, response, container, href;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          debug("Fetch home url from principal url ".concat(account.principalUrl, "."));

          if (options.accountType === 'caldav') {
            prop = {
              name: 'calendar-home-set',
              namespace: ns.CALDAV
            };
          } else if (options.accountType === 'carddav') {
            prop = {
              name: 'addressbook-home-set',
              namespace: ns.CARDDAV
            };
          }

          req = request.propfind({
            props: [prop],
            depth: 0
          });
          _context3.next = 5;
          return options.xhr.send(req, account.principalUrl, {
            sandbox: options.sandbox
          });

        case 5:
          responses = _context3.sent;
          response = responses.find(function (response) {
            return (0, _fuzzy_url_equals["default"])(account.principalUrl, response.href);
          });
          debug("homeUrl parsed response:");
          debug(JSON.stringify(response));
          container = response.props;

          if (options.accountType === 'caldav') {
            debug("Received home: ".concat(container.calendarHomeSet));
            href = container.calendarHomeSet;
          } else if (options.accountType === 'carddav') {
            debug("Received home: ".concat(container.addressbookHomeSet));
            href = container.addressbookHomeSet;
          }

          return _context3.abrupt("return", _url["default"].resolve(account.principalUrl, href));

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
}));
/**
 * @param {dav.Account} account to address set
 */


var addressSet = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee4(account, options) {
  var prop, req, responses, response;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          debug("Fetch address set from principal url ".concat(account.principalUrl, "."));
          prop = {
            name: 'calendar-user-address-set',
            namespace: ns.CALDAV
          };
          req = request.propfind({
            props: [prop],
            depth: 0
          });
          _context4.next = 5;
          return options.xhr.send(req, account.principalUrl, {
            sandbox: options.sandbox
          });

        case 5:
          responses = _context4.sent;
          response = responses.find(function (response) {
            return (0, _fuzzy_url_equals["default"])(account.principalUrl, response.href);
          });
          return _context4.abrupt("return", response.props.calendarUserAddressSet);

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}));
/**
 * Options:
 *
 *   (String) accountType - one of 'caldav' or 'carddav'. Defaults to 'caldav'.
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (Boolean) loadCollections - whether or not to load dav collections.
 *   (Boolean) loadObjects - whether or not to load dav objects.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) server - some url for server (needn't be base url).
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 *
 * @return {Promise} a promise that will resolve with a dav.Account object.
 */


exports.createAccount = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee6(options) {
  var account, key, loadCollections, loadObjects, collections;
  return _regenerator["default"].wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          options = Object.assign({}, defaults, options);

          if (typeof options.loadObjects !== 'boolean') {
            options.loadObjects = options.loadCollections;
          }

          account = new _model.Account({
            server: options.server,
            credentials: options.xhr.credentials
          });

          if (!options.discoveryEnabled) {
            _context6.next = 13;
            break;
          }

          debug("Connecting with autodiscovery from ".concat(options.server));
          _context6.next = 7;
          return serviceDiscovery(account, options);

        case 7:
          account.rootUrl = _context6.sent;
          _context6.next = 10;
          return principalUrl(account, options);

        case 10:
          account.principalUrl = _context6.sent;
          _context6.next = 15;
          break;

        case 13:
          debug("Connecting assuming principal: ".concat(options.server));
          account.principalUrl = options.server;

        case 15:
          _context6.next = 17;
          return homeUrl(account, options);

        case 17:
          account.homeUrl = _context6.sent;

          if (!(options.accountType === 'caldav')) {
            _context6.next = 22;
            break;
          }

          _context6.next = 21;
          return addressSet(account, options);

        case 21:
          account.addresses = _context6.sent;

        case 22:
          if (options.loadCollections) {
            _context6.next = 24;
            break;
          }

          return _context6.abrupt("return", account);

        case 24:
          if (options.accountType === 'caldav') {
            key = 'calendars';
            loadCollections = _calendars.listCalendars;
            loadObjects = _calendars.listCalendarObjects;
          } else if (options.accountType === 'carddav') {
            key = 'addressBooks';
            loadCollections = _contacts.listAddressBooks;
            loadObjects = _contacts.listVCards;
          }

          _context6.next = 27;
          return loadCollections(account, options);

        case 27:
          collections = _context6.sent;
          account[key] = collections;

          if (options.loadObjects) {
            _context6.next = 31;
            break;
          }

          return _context6.abrupt("return", account);

        case 31:
          _context6.next = 33;
          return collections.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee5(collection) {
            return _regenerator["default"].wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.prev = 0;
                    _context5.next = 3;
                    return loadObjects(collection, options);

                  case 3:
                    collection.objects = _context5.sent;
                    _context5.next = 9;
                    break;

                  case 6:
                    _context5.prev = 6;
                    _context5.t0 = _context5["catch"](0);
                    collection.error = _context5.t0;

                  case 9:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5, null, [[0, 6]]);
          })));

        case 33:
          account[key] = account[key].filter(function (collection) {
            return !collection.error;
          });
          return _context6.abrupt("return", account);

        case 35:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
}));

},{"./calendars":3,"./contacts":6,"./debug":7,"./fuzzy_url_equals":8,"./model":10,"./namespace":11,"./request":13,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"@babel/runtime/regenerator":37,"co":38,"url":44}],3:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalendarObject = getCalendarObject;
exports.createCalendarObject = createCalendarObject;
exports.updateCalendarObject = updateCalendarObject;
exports.deleteCalendarObject = deleteCalendarObject;
exports.syncCalendar = syncCalendar;
exports.syncCaldavAccount = exports.multigetSingleCalendarObject = exports.multigetCalendarObjects = exports.listCalendarObjectsEtags = exports.syncCalendarObjects = exports.listCalendarObjects = exports.getCalendar = exports.listCalendars = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _co = _interopRequireDefault(require("co"));

var _url = _interopRequireDefault(require("url"));

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var _model = require("./model");

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

var webdav = _interopRequireWildcard(require("./webdav"));

var debug = require('./debug')["default"]('dav:calendars');

var ICAL_OBJS = new Set(['VEVENT', 'VTODO', 'VJOURNAL', 'VFREEBUSY', 'VTIMEZONE', 'VALARM']);
/**
 * @param {dav.Account} account to fetch calendars for.
 */

var listCalendars = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee2(account, options) {
  var req, responses, cals;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          debug("Fetch calendars from home url ".concat(account.homeUrl));
          req = request.propfind({
            props: [{
              name: 'calendar-description',
              namespace: ns.CALDAV
            }, {
              name: 'calendar-timezone',
              namespace: ns.CALDAV
            }, {
              name: 'displayname',
              namespace: ns.DAV
            }, {
              name: 'getctag',
              namespace: ns.CALENDAR_SERVER
            }, {
              name: 'resourcetype',
              namespace: ns.DAV
            }, {
              name: 'supported-calendar-component-set',
              namespace: ns.CALDAV
            }, {
              name: 'sync-token',
              namespace: ns.DAV
            }, {
              name: 'calendar-color',
              namespace: ns.APPLE
            }, {
              name: 'current-user-privilege-set',
              namespace: ns.DAV
            }],
            depth: 1
          });
          _context2.next = 4;
          return options.xhr.send(req, account.homeUrl, {
            sandbox: options.sandbox
          });

        case 4:
          responses = _context2.sent;
          debug("Found ".concat(responses.length, " calendars."));
          cals = responses.filter(function (res) {
            // We only want the calendar if it contains iCalendar objects.
            var resourcetype = res.props.resourcetype || [];
            return resourcetype.indexOf('calendar') !== -1;
          }).map(function (res) {
            debug("Found calendar ".concat(res.props.displayname, ",\n             props: ").concat(JSON.stringify(res.props)));
            return new _model.Calendar({
              data: res,
              account: account,
              description: res.props.calendarDescription,
              timezone: res.props.calendarTimezone,
              color: res.props.calendarColor,
              url: _url["default"].resolve(account.principalUrl, res.href),
              ctag: res.props.getctag,
              displayName: res.props.displayname,
              components: res.props.supportedCalendarComponentSet,
              resourcetype: res.props.resourcetype,
              syncToken: res.props.syncToken,
              currentUserPrivilegeSet: res.props.currentUserPrivilegeSet
            });
          });
          _context2.next = 9;
          return cals.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee(cal) {
            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return webdav.supportedReportSet(cal, options);

                  case 2:
                    cal.reports = _context.sent;

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          })));

        case 9:
          return _context2.abrupt("return", cals);

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));
/**
 * @param {dav.Account} account to fetch calendars for.
 * @param {string} account to fetch calendars for.
 */


exports.listCalendars = listCalendars;

var getCalendar = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee4(account, calendarUrl, options) {
  var req, responses, cals;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          debug("Fetch calendar ".concat(calendarUrl));
          req = request.propfind({
            props: [{
              name: 'calendar-description',
              namespace: ns.CALDAV
            }, {
              name: 'calendar-timezone',
              namespace: ns.CALDAV
            }, {
              name: 'displayname',
              namespace: ns.DAV
            }, {
              name: 'getctag',
              namespace: ns.CALENDAR_SERVER
            }, {
              name: 'resourcetype',
              namespace: ns.DAV
            }, {
              name: 'supported-calendar-component-set',
              namespace: ns.CALDAV
            }, {
              name: 'sync-token',
              namespace: ns.DAV
            }, {
              name: 'calendar-color',
              namespace: ns.APPLE
            }, {
              name: 'current-user-privilege-set',
              namespace: ns.DAV
            }],
            depth: 0
          });
          _context4.next = 4;
          return options.xhr.send(req, calendarUrl, {
            sandbox: options.sandbox
          });

        case 4:
          responses = _context4.sent;
          debug("Found ".concat(responses.length, " calendars (expect 1)."));
          cals = responses.filter(function (res) {
            // We only want the calendar if it contains iCalendar objects.
            var resourcetype = res.props.resourcetype || [];
            return resourcetype.indexOf('calendar') !== -1;
          }).map(function (res) {
            debug("Found calendar ".concat(res.props.displayname, ",\n             props: ").concat(JSON.stringify(res.props)));
            return new _model.Calendar({
              data: res,
              account: account,
              description: res.props.calendarDescription,
              timezone: res.props.calendarTimezone,
              color: res.props.calendarColor,
              url: _url["default"].resolve(account.principalUrl, res.href),
              ctag: res.props.getctag,
              displayName: res.props.displayname,
              components: res.props.supportedCalendarComponentSet,
              resourcetype: res.props.resourcetype,
              syncToken: res.props.syncToken,
              currentUserPrivilegeSet: res.props.currentUserPrivilegeSet
            });
          });
          _context4.next = 9;
          return cals.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee3(cal) {
            return _regenerator["default"].wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return webdav.supportedReportSet(cal, options);

                  case 2:
                    cal.reports = _context3.sent;

                  case 3:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          })));

        case 9:
          return _context4.abrupt("return", cals.length ? cals[0] : null);

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}));
/**
 * @param {dav.Calendar} calendar the calendar to get the object from.
 * @return {Promise} promise will resolve when the event
 *
 * Options:
 *
 *   (String) href - href of the event to retrieve
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.getCalendar = getCalendar;

function getCalendarObject(calendar, options) {
  if (!options.href) return null;
  options.hrefs = [options.href];
  return multigetSingleCalendarObject(calendar, options);
}
/**
 * @param {dav.Calendar} calendar the calendar to put the object on.
 * @return {Promise} promise will resolve when the calendar has been created.
 *
 * Options:
 *
 *   (String) data - rfc 5545 VCALENDAR object.
 *   (String) filename - name for the calendar ics file.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


function createCalendarObject(calendar, options) {
  var objectUrl = _url["default"].resolve(calendar.url, options.filename);

  options.contentType = 'text/calendar';
  return webdav.createObject(objectUrl, options.data, options);
}
/**
 * @param {dav.CalendarObject} calendarObject updated calendar object.
 * @return {Promise} promise will resolve when the calendar has been updated.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


function updateCalendarObject(calendarObject, options) {
  options.contentType = 'text/calendar';
  return webdav.updateObject(calendarObject.url, calendarObject.calendarData, calendarObject.etag, options);
}
/**
 * @param {dav.CalendarObject} calendarObject target calendar object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


function deleteCalendarObject(calendarObject, options) {
  return webdav.deleteObject(calendarObject.url, calendarObject.etag, options);
}
/**
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


var listCalendarObjects = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee5(calendar, options) {
  var results;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          debug("Listing objects on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username));
          _context5.next = 3;
          return listCalendarObjectsEtags(calendar, options);

        case 3:
          results = _context5.sent;
          options.hrefs = results.filter(function (res) {
            return res.href && res.href.length;
          }).map(function (res) {
            return res.href;
          });
          debug('Got the following etags:');
          debug(options.hrefs); // First query to get list of etags

          _context5.next = 9;
          return multigetCalendarObjects(calendar, options);

        case 9:
          return _context5.abrupt("return", _context5.sent);

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
}));
/**
 * Fetch calendar objects that changed on the remote calendar since
 * the last sync. This includes added, modified and deleted calendar
 * objects. Changes will be recognized by comparing the etags in the
 * `calendar.objects` array with the etags fetched from the remote.
 *
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.listCalendarObjects = listCalendarObjects;

var syncCalendarObjects = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee6(calendar, options) {
  var remoteCalendarObjects, hrefs, localEvents, remoteEvents, calendarObjects;
  return _regenerator["default"].wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          debug("Sync objects on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username)); // First we only fetch the etags and hrefs to figure out what changed locally

          _context6.next = 3;
          return listCalendarObjectsEtags(calendar, options);

        case 3:
          remoteCalendarObjects = _context6.sent;
          // Collect hrefs of all new and modified events
          hrefs = []; // Compare local calendar objects with remote calendar objects

          localEvents = calendar.objects;
          remoteEvents = remoteCalendarObjects.filter(function (obj) {
            return obj.href && obj.href.length;
          });
          remoteEvents.forEach(function (remoteEvent) {
            // Check if remote event already exists locally
            var localEvent = localEvents.find(function (localEvent) {
              return (0, _fuzzy_url_equals["default"])(localEvent.url, remoteEvent.href);
            });

            if (localEvent) {
              localEvent.exists = true;

              if (localEvent.etag !== remoteEvent.etag) {
                // Modified event
                hrefs.push(remoteEvent.href);
              } // If etag matches, event did not change -> don't push them

            } else {
              // New event
              hrefs.push(remoteEvent.href);
            }
          }); // Get the calendar-data and etags of the events that are either new or changed

          options.hrefs = hrefs;
          _context6.next = 11;
          return multigetCalendarObjects(calendar, options);

        case 11:
          calendarObjects = _context6.sent;
          // Push deleted events
          localEvents.forEach(function (event) {
            if (!event.exists) {
              calendarObjects.push(new _model.CalendarObject({
                url: event.url,
                status: 'cancelled'
              }));
            }
          });
          return _context6.abrupt("return", calendarObjects);

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
}));
/**
 * @param {dav.Calendar} calendar the calendar to fetch etags for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.syncCalendarObjects = syncCalendarObjects;

var listCalendarObjectsEtags = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee7(calendar, options) {
  var filters, req, responses;
  return _regenerator["default"].wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          debug("Getting etags on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username));
          filters = options.filters || [{
            type: 'comp-filter',
            attrs: {
              name: 'VCALENDAR'
            },
            children: [{
              type: 'comp-filter',
              attrs: {
                name: 'VEVENT'
              }
            }]
          }]; // First query to get list of etags

          req = request.calendarQuery({
            depth: 1,
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            }],
            filters: filters
          });
          _context7.next = 5;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 5:
          responses = _context7.sent;
          return _context7.abrupt("return", responses.map(function (res) {
            debug("Found calendar object (etag only) with url ".concat(res.href));
            return {
              href: res.href,
              etag: res.props.getetag
            };
          }));

        case 7:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}));
/**
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) hrefs - hrefs of objects to retrieve.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.listCalendarObjectsEtags = listCalendarObjectsEtags;

var multigetCalendarObjects = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee8(calendar, options) {
  var hrefs, req, responses;
  return _regenerator["default"].wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          debug("Doing multiget on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username));
          hrefs = options.hrefs || [];

          if (hrefs.length) {
            _context8.next = 4;
            break;
          }

          return _context8.abrupt("return", []);

        case 4:
          req = request.calendarMultiget({
            depth: 1,
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            }, {
              name: 'calendar-data',
              namespace: ns.CALDAV
            }],
            hrefs: hrefs.map(function (href) {
              return ensureEncodedPath(href);
            })
          });
          _context8.next = 7;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 7:
          responses = _context8.sent;
          return _context8.abrupt("return", responses.map(function (res) {
            //debug(`Found calendar object with url ${res.href}`);
            return new _model.CalendarObject({
              data: res,
              calendar: calendar,
              url: _url["default"].resolve(calendar.account.principalUrl, res.href),
              etag: res.props.getetag,
              calendarData: res.props.calendarData
            });
          }));

        case 9:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8);
}));

exports.multigetCalendarObjects = multigetCalendarObjects;

var multigetSingleCalendarObject = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee9(calendar, options) {
  var events;
  return _regenerator["default"].wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return multigetCalendarObjects(calendar, options);

        case 2:
          events = _context9.sent;
          return _context9.abrupt("return", events.filter(function (event) {
            // Find the response that corresponds to the parameter collection.
            return (0, _fuzzy_url_equals["default"])(options.href, event.url);
          })[0]);

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  }, _callee9);
}));
/**
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 */


exports.multigetSingleCalendarObject = multigetSingleCalendarObject;

function syncCalendar(calendar, options) {
  options.basicSync = basicSync;
  options.webdavSync = webdavSync;
  return webdav.syncCollection(calendar, options);
}
/**
 * @param {dav.Account} account the account to fetch updates for.
 * @return {Promise} promise will resolve with updated account.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


var syncCaldavAccount = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee11(account) {
  var options,
      cals,
      _args11 = arguments;
  return _regenerator["default"].wrap(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          options = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : {};
          options.loadObjects = false;
          if (!account.calendars) account.calendars = [];
          _context11.next = 5;
          return listCalendars(account, options);

        case 5:
          cals = _context11.sent;
          cals.filter(function (cal) {
            // Filter the calendars not previously seen.
            return account.calendars.every(function (prev) {
              return !(0, _fuzzy_url_equals["default"])(prev.url, cal.url);
            });
          }).forEach(function (cal) {
            // Add them to the account's calendar list.
            account.calendars.push(cal);
          });
          options.loadObjects = true;
          _context11.next = 10;
          return account.calendars.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee10(cal, index) {
            return _regenerator["default"].wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.prev = 0;
                    _context10.next = 3;
                    return syncCalendar(cal, options);

                  case 3:
                    _context10.next = 9;
                    break;

                  case 5:
                    _context10.prev = 5;
                    _context10.t0 = _context10["catch"](0);
                    debug("Sync calendar ".concat(cal.displayName, " failed with ").concat(_context10.t0));
                    account.calendars.splice(index, 1);

                  case 9:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10, null, [[0, 5]]);
          })));

        case 10:
          return _context11.abrupt("return", account);

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  }, _callee11);
}));
/**
 * Extract the path from the full spec, if the regexp failed, log
 * warning and return unaltered path.
 */


exports.syncCaldavAccount = syncCaldavAccount;

var extractPathFromSpec = function extractPathFromSpec(aSpec) {
  // The parsed array should look like this:
  // a[0] = full string
  // a[1] = scheme
  // a[2] = everything between the scheme and the start of the path
  // a[3] = extracted path
  var a = aSpec.match('(https?)(://[^/]*)([^#?]*)');

  if (a && a[3]) {
    return a[3];
  }

  debug('CalDAV: Spec could not be parsed, returning as-is: ' + aSpec);
  return aSpec;
};
/**
 * This is called to create an encoded path from a unencoded path OR
 * encoded full url
 *
 * @param aString {string} un-encoded path OR encoded uri spec.
 */


var ensureEncodedPath = function ensureEncodedPath(aString) {
  if (aString.charAt(0) != '/') {
    aString = ensureDecodedPath(aString);
  }

  var uriComponents = aString.split('/');
  uriComponents = uriComponents.map(encodeURIComponent);
  return uriComponents.join('/');
};
/**
 * This is called to get a decoded path from an encoded path or uri spec.
 *
 * @param {string} aString - Represents either a path
 *                           or a full uri that needs to be decoded.
 * @return {string} A decoded path.
 */


var ensureDecodedPath = function ensureDecodedPath(aString) {
  if (aString.charAt(0) != '/') {
    aString = extractPathFromSpec(aString);
  }

  var uriComponents = aString.split('/');

  for (var i = 0; i < uriComponents.length; i++) {
    try {
      uriComponents[i] = decodeURIComponent(uriComponents[i]);
    } catch (e) {
      debug('CalDAV: Exception decoding path ' + aString + ', segment: ' + uriComponents[i]);
    }
  }

  return uriComponents.join('/');
};

var basicSync = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee12(calendar, options) {
  var sync;
  return _regenerator["default"].wrap(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return webdav.isCollectionDirty(calendar, options);

        case 2:
          sync = _context12.sent;

          if (sync) {
            _context12.next = 6;
            break;
          }

          debug('Local ctag matched remote! No need to sync :).');
          return _context12.abrupt("return", calendar);

        case 6:
          debug('ctag changed so we need to fetch stuffs.');
          _context12.next = 9;
          return syncCalendarObjects(calendar, options);

        case 9:
          calendar.objects = _context12.sent;
          return _context12.abrupt("return", calendar);

        case 11:
        case "end":
          return _context12.stop();
      }
    }
  }, _callee12);
}));

var webdavSync = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee13(calendar, options) {
  var req, result, deletedHrefs, newUpdatedHrefs, results;
  return _regenerator["default"].wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          req = request.syncCollection({
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            } //{ name: 'calendar-data', namespace: ns.CALDAV }
            ],
            syncLevel: 1,
            syncToken: calendar.syncToken,
            depth: 1
          });
          _context13.next = 3;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 3:
          result = _context13.sent;
          // Results contains new, modified or deleted objects.
          result.responses.forEach(function (res) {
            // Validate href
            if (res.href && res.href.length) {
              res.href = ensureDecodedPath(res.href);
            } // Validate contenttype


            if ((!res.getcontenttype || res.getcontenttype === 'text/plain') && res.href && res.href.endsWith('.ics')) {
              // If there is no content-type (iCloud) or text/plain was passed
              // (iCal Server) for the resource but its name ends with ".ics"
              // assume the content type to be text/calendar. Apple
              // iCloud/iCal Server interoperability fix.
              res.getcontenttype = 'text/calendar';
            }
          });
          deletedHrefs = result.responses.filter(function (res) {
            return res.href && res.href.length && res.status && res.status.length && res.status.indexOf('404') > -1;
          }).map(function (res) {
            return res.href;
          });
          newUpdatedHrefs = result.responses.filter(function (res) {
            return !res.status || res.status.indexOf('404') === -1;
          }).map(function (res) {
            return res.href;
          }); // Starting from Feb 2020, iCloud sends 500 if hrefs contain the calendar one, despite providing the other data correctly!
          // TODO: Is this supposed to be the standard??

          if (calendar.url.indexOf('icloud.com') > -1) {
            newUpdatedHrefs = newUpdatedHrefs.filter(function (href) {
              return href.indexOf('.ics') > -1;
            });
          }

          req = request.calendarMultiget({
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            }, {
              name: 'calendar-data',
              namespace: ns.CALDAV
            }],
            depth: 1,
            hrefs: newUpdatedHrefs.map(function (href) {
              return ensureEncodedPath(href);
            })
          });
          _context13.next = 11;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 11:
          results = _context13.sent;
          // Calendar objects array will contain all new, modified and deleted events
          calendar.objects = [];
          results.forEach(function (response) {
            if (response.href && response.href.length) {
              response.href = ensureDecodedPath(response.href);
            } else return;

            if (!response.props.calendarData || !response.props.calendarData.length) return; // Push new and modified events

            calendar.objects.push(new _model.CalendarObject({
              data: response,
              calendar: calendar,
              url: _url["default"].resolve(calendar.url, response.href),
              etag: response.props.getetag,
              calendarData: response.props.calendarData
            }));
          }); // Push deleted events

          deletedHrefs.forEach(function (deletedHref) {
            calendar.objects.push(new _model.CalendarObject({
              url: _url["default"].resolve(calendar.url, deletedHref),
              status: 'cancelled'
            }));
          }); // Update token

          calendar.syncToken = result.syncToken;
          return _context13.abrupt("return", calendar);

        case 17:
        case "end":
          return _context13.stop();
      }
    }
  }, _callee13);
}));

},{"./debug":7,"./fuzzy_url_equals":8,"./model":10,"./namespace":11,"./request":13,"./webdav":25,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"@babel/runtime/regenerator":37,"co":38,"url":44}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _url = _interopRequireDefault(require("url"));

var accounts = _interopRequireWildcard(require("./accounts"));

var calendars = _interopRequireWildcard(require("./calendars"));

var contacts = _interopRequireWildcard(require("./contacts"));

/**
 * @param {dav.Transport} xhr - request sender.
 *
 * Options:
 *
 *   (String) baseUrl - root url to resolve relative request urls with.
 */
var Client = /*#__PURE__*/function () {
  function Client(xhr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Client);
    this.xhr = xhr;
    Object.assign(this, options); // Expose internal modules for unit testing

    this._accounts = accounts;
    this._calendars = calendars;
    this._contacts = contacts;
  }
  /**
   * @param {dav.Request} req - dav request.
   * @param {String} uri - where to send request.
   * @return {Promise} a promise that will be resolved with an xhr request
   *     after its readyState is 4 or the result of applying an optional
   *     request `transformResponse` function to the xhr object after its
   *     readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   */


  (0, _createClass2["default"])(Client, [{
    key: "send",
    value: function send(req, uri, options) {
      if (this.baseUrl) {
        var urlObj = _url["default"].parse(uri);

        uri = _url["default"].resolve(this.baseUrl, urlObj.path);
      }

      return this.xhr.send(req, uri, options);
    }
  }, {
    key: "createAccount",
    value: function createAccount() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options.xhr = options.xhr || this.xhr;
      return accounts.createAccount(options);
    }
  }, {
    key: "getCalendar",
    value: function getCalendar(account, calendarUrl) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.getCalendar(account, calendarUrl, options);
    }
  }, {
    key: "createCalendarObject",
    value: function createCalendarObject(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.createCalendarObject(calendar, options);
    }
  }, {
    key: "getCalendarObject",
    value: function getCalendarObject(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.getCalendarObject(calendar, options);
    }
  }, {
    key: "updateCalendarObject",
    value: function updateCalendarObject(calendarObject) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.updateCalendarObject(calendarObject, options);
    }
  }, {
    key: "deleteCalendarObject",
    value: function deleteCalendarObject(calendarObject) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.deleteCalendarObject(calendarObject, options);
    }
  }, {
    key: "syncCalendar",
    value: function syncCalendar(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.syncCalendar(calendar, options);
    }
  }, {
    key: "syncCaldavAccount",
    value: function syncCaldavAccount(account) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.syncCaldavAccount(account, options);
    }
  }, {
    key: "createCard",
    value: function createCard(addressBook) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.createCard(addressBook, options);
    }
  }, {
    key: "updateCard",
    value: function updateCard(card) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.updateCard(card, options);
    }
  }, {
    key: "deleteCard",
    value: function deleteCard(card) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.deleteCard(card, options);
    }
  }, {
    key: "syncAddressBook",
    value: function syncAddressBook(addressBook) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.syncAddressBook(addressBook, options);
    }
  }, {
    key: "syncCarddavAccount",
    value: function syncCarddavAccount(account) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.syncCarddavAccount(account, options);
    }
  }]);
  return Client;
}();

exports.Client = Client;

},{"./accounts":2,"./calendars":3,"./contacts":6,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/createClass":29,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"url":44}],6:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCard = createCard;
exports.updateCard = updateCard;
exports.deleteCard = deleteCard;
exports.syncAddressBook = syncAddressBook;
exports.syncCarddavAccount = exports.listVCards = exports.listAddressBooks = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _co = _interopRequireDefault(require("co"));

var _url = _interopRequireDefault(require("url"));

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var _model = require("./model");

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

var webdav = _interopRequireWildcard(require("./webdav"));

var debug = require('./debug')["default"]('dav:contacts');
/**
 * @param {dav.Account} account to fetch address books for.
 */


var listAddressBooks = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee2(account, options) {
  var req, responses, addressBooks;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          debug("Fetch address books from home url ".concat(account.homeUrl));
          req = request.propfind({
            props: [{
              name: 'displayname',
              namespace: ns.DAV
            }, {
              name: 'getctag',
              namespace: ns.CALENDAR_SERVER
            }, {
              name: 'resourcetype',
              namespace: ns.DAV
            }, {
              name: 'sync-token',
              namespace: ns.DAV
            }],
            depth: 1
          });
          _context2.next = 4;
          return options.xhr.send(req, account.homeUrl, {
            sandbox: options.sandbox
          });

        case 4:
          responses = _context2.sent;
          addressBooks = responses.filter(function (res) {
            return typeof res.props.displayname === 'string';
          }).map(function (res) {
            debug("Found address book named ".concat(res.props.displayname, ",\n             props: ").concat(JSON.stringify(res.props)));
            return new _model.AddressBook({
              data: res,
              account: account,
              url: _url["default"].resolve(account.principalUrl, res.href),
              ctag: res.props.getctag,
              displayName: res.props.displayname,
              resourcetype: res.props.resourcetype,
              syncToken: res.props.syncToken
            });
          });
          _context2.next = 8;
          return addressBooks.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee(addressBook) {
            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return webdav.supportedReportSet(addressBook, options);

                  case 2:
                    addressBook.reports = _context.sent;

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          })));

        case 8:
          return _context2.abrupt("return", addressBooks);

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));
/**
 * @param {dav.AddressBook} addressBook the address book to put the object on.
 * @return {Promise} promise will resolve when the card has been created.
 *
 * Options:
 *
 *   (String) data - vcard object.
 *   (String) filename - name for the address book vcf file.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.listAddressBooks = listAddressBooks;

function createCard(addressBook, options) {
  var objectUrl = _url["default"].resolve(addressBook.url, options.filename);

  return webdav.createObject(objectUrl, options.data, options);
}
/**
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 */


var listVCards = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee3(addressBook, options) {
  var req, responses;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          debug("Doing REPORT on address book ".concat(addressBook.url, " which belongs to\n        ").concat(addressBook.account.credentials.username));
          req = request.addressBookQuery({
            depth: 1,
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            }, {
              name: 'address-data',
              namespace: ns.CARDDAV
            }]
          });
          _context3.next = 4;
          return options.xhr.send(req, addressBook.url, {
            sandbox: options.sandbox
          });

        case 4:
          responses = _context3.sent;
          return _context3.abrupt("return", responses.map(function (res) {
            debug("Found vcard with url ".concat(res.href));
            return new _model.VCard({
              data: res,
              addressBook: addressBook,
              url: _url["default"].resolve(addressBook.account.principalUrl, res.href),
              etag: res.props.getetag,
              addressData: res.props.addressData
            });
          }));

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
}));
/**
 * @param {dav.VCard} card updated vcard object.
 * @return {Promise} promise will resolve when the card has been updated.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.listVCards = listVCards;

function updateCard(card, options) {
  return webdav.updateObject(card.url, card.addressData, card.etag, options);
}
/**
 * @param {dav.VCard} card target vcard object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


function deleteCard(card, options) {
  return webdav.deleteObject(card.url, card.etag, options);
}
/**
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (dav.Transport) xhr - request sender.
 */


function syncAddressBook(addressBook, options) {
  options.basicSync = basicSync;
  options.webdavSync = webdavSync;
  return webdav.syncCollection(addressBook, options);
}
/**
 * @param {dav.Account} account the account to fetch updates for.
 * @return {Promise} promise will resolve with updated account.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


var syncCarddavAccount = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee5(account) {
  var options,
      addressBooks,
      _args5 = arguments;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          options = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
          options.loadObjects = false;

          if (!account.addressBooks) {
            account.addressBooks = [];
          }

          _context5.next = 5;
          return listAddressBooks(account, options);

        case 5:
          addressBooks = _context5.sent;
          addressBooks.filter(function (addressBook) {
            // Filter the address books not previously seen.
            return account.addressBooks.every(function (prev) {
              return !(0, _fuzzy_url_equals["default"])(prev.url, addressBook.url);
            });
          }).forEach(function (addressBook) {
            return account.addressBooks.push(addressBook);
          });
          options.loadObjects = true;
          _context5.next = 10;
          return account.addressBooks.map(_co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee4(addressBook, index) {
            return _regenerator["default"].wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.prev = 0;
                    _context4.next = 3;
                    return syncAddressBook(addressBook, options);

                  case 3:
                    _context4.next = 9;
                    break;

                  case 5:
                    _context4.prev = 5;
                    _context4.t0 = _context4["catch"](0);
                    debug("Syncing ".concat(addressBook.displayName, " failed with ").concat(_context4.t0));
                    account.addressBooks.splice(index, 1);

                  case 9:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, null, [[0, 5]]);
          })));

        case 10:
          return _context5.abrupt("return", account);

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
}));

exports.syncCarddavAccount = syncCarddavAccount;

var basicSync = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee6(addressBook, options) {
  var sync;
  return _regenerator["default"].wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          sync = webdav.isCollectionDirty(addressBook, options);

          if (sync) {
            _context6.next = 4;
            break;
          }

          debug('Local ctag matched remote! No need to sync :).');
          return _context6.abrupt("return", addressBook);

        case 4:
          debug('ctag changed so we need to fetch stuffs.');
          _context6.next = 7;
          return listVCards(addressBook, options);

        case 7:
          addressBook.objects = _context6.sent;
          return _context6.abrupt("return", addressBook);

        case 9:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
}));

var webdavSync = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee7(addressBook, options) {
  var req, result;
  return _regenerator["default"].wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          req = request.syncCollection({
            props: [{
              name: 'getetag',
              namespace: ns.DAV
            }, {
              name: 'address-data',
              namespace: ns.CARDDAV
            }],
            syncLevel: 1,
            syncToken: addressBook.syncToken
          });
          _context7.next = 3;
          return options.xhr.send(req, addressBook.url, {
            sandbox: options.sandbox
          });

        case 3:
          result = _context7.sent;
          // TODO(gareth): Handle creations and deletions.
          result.responses.forEach(function (response) {
            // Find the vcard that this response corresponds with.
            var vcard = addressBook.objects.filter(function (object) {
              return (0, _fuzzy_url_equals["default"])(object.url, response.href);
            })[0];
            if (!vcard) return;
            vcard.etag = response.props.getetag;
            vcard.addressData = response.props.addressData;
          });
          addressBook.syncToken = result.syncToken;
          return _context7.abrupt("return", addressBook);

        case 7:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}));

},{"./debug":7,"./fuzzy_url_equals":8,"./model":10,"./namespace":11,"./request":13,"./webdav":25,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"@babel/runtime/regenerator":37,"co":38,"url":44}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = debug;

function debug(topic) {
  return function (message) {
    if (debug.enabled) {
      console.log("[".concat(topic, "] ").concat(message));
    }

    if (debug.callback) {
      debug.callback(topic, message);
    }
  };
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fuzzyUrlEquals;

function fuzzyUrlEquals(one, other) {
  one = fullyDecodeURI(one);
  other = fullyDecodeURI(other);
  return fuzzyIncludes(one, other) || fuzzyIncludes(other, one);
}

function isEncoded(uri) {
  uri = uri || '';
  return uri !== decodeURIComponent(uri);
}

function fullyDecodeURI(uri) {
  while (isEncoded(uri)) {
    uri = decodeURIComponent(uri);
  }

  return uri;
}

function fuzzyIncludes(one, other) {
  return one.indexOf(other) !== -1 || other.charAt(other.length - 1) === '/' && one.indexOf(other.slice(0, -1)) !== -1;
}

},{}],9:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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
  if (key in exports && exports[key] === _calendars[key]) return;
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
  if (key in exports && exports[key] === _contacts[key]) return;
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
  if (key in exports && exports[key] === _model[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _model[key];
    }
  });
});

var _sandbox = require("./sandbox");

},{"../package":49,"./accounts":2,"./calendars":3,"./client":5,"./contacts":6,"./debug":7,"./model":10,"./namespace":11,"./request":13,"./sandbox":14,"./transport":24,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33}],10:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VCard = exports.CalendarObject = exports.DAVObject = exports.Calendar = exports.AddressBook = exports.DAVCollection = exports.Credentials = exports.Account = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Account = function Account(options) {
  (0, _classCallCheck2["default"])(this, Account);
  Object.assign(this, {
    server: null,
    credentials: null,
    rootUrl: null,
    principalUrl: null,
    homeUrl: null,
    calendars: null,
    addressBooks: null,
    addresses: null
  }, options);
};
/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) clientId - oauth client id.
 *   (String) clientSecret - oauth client secret.
 *   (String) authorizationCode - oauth code.
 *   (String) redirectUrl - oauth redirect url.
 *   (String) tokenUrl - oauth token url.
 *   (String) accessToken - oauth access token.
 *   (String) refreshToken - oauth refresh token.
 *   (Number) expiration - unix time for access token expiration.
 */


exports.Account = Account;

var Credentials = function Credentials(options) {
  (0, _classCallCheck2["default"])(this, Credentials);
  Object.assign(this, {
    username: null,
    password: null,
    clientId: null,
    clientSecret: null,
    authorizationCode: null,
    redirectUrl: null,
    tokenUrl: null,
    accessToken: null,
    refreshToken: null,
    expiration: null
  }, options);
};

exports.Credentials = Credentials;

var DAVCollection = function DAVCollection(options) {
  (0, _classCallCheck2["default"])(this, DAVCollection);
  Object.assign(this, {
    data: null,
    objects: null,
    account: null,
    ctag: null,
    description: null,
    displayName: null,
    reports: null,
    resourcetype: null,
    syncToken: null,
    url: null
  }, options);
};

exports.DAVCollection = DAVCollection;

var AddressBook = /*#__PURE__*/function (_DAVCollection) {
  (0, _inherits2["default"])(AddressBook, _DAVCollection);

  var _super = _createSuper(AddressBook);

  function AddressBook(options) {
    (0, _classCallCheck2["default"])(this, AddressBook);
    return _super.call(this, options);
  }

  return AddressBook;
}(DAVCollection);

exports.AddressBook = AddressBook;

var Calendar = /*#__PURE__*/function (_DAVCollection2) {
  (0, _inherits2["default"])(Calendar, _DAVCollection2);

  var _super2 = _createSuper(Calendar);

  function Calendar(options) {
    var _this;

    (0, _classCallCheck2["default"])(this, Calendar);
    _this = _super2.call(this, options);
    Object.assign((0, _assertThisInitialized2["default"])(_this), {
      components: null,
      timezone: null
    }, options);
    return _this;
  }

  return Calendar;
}(DAVCollection);

exports.Calendar = Calendar;

var DAVObject = function DAVObject(options) {
  (0, _classCallCheck2["default"])(this, DAVObject);
  Object.assign(this, {
    data: null,
    etag: null,
    url: null
  }, options);
};

exports.DAVObject = DAVObject;

var CalendarObject = /*#__PURE__*/function (_DAVObject) {
  (0, _inherits2["default"])(CalendarObject, _DAVObject);

  var _super3 = _createSuper(CalendarObject);

  function CalendarObject(options) {
    var _this2;

    (0, _classCallCheck2["default"])(this, CalendarObject);
    _this2 = _super3.call(this, options);
    Object.assign((0, _assertThisInitialized2["default"])(_this2), {
      calendar: null,
      calendarData: null
    }, options);
    return _this2;
  }

  return CalendarObject;
}(DAVObject);

exports.CalendarObject = CalendarObject;

var VCard = /*#__PURE__*/function (_DAVObject2) {
  (0, _inherits2["default"])(VCard, _DAVObject2);

  var _super4 = _createSuper(VCard);

  function VCard(options) {
    var _this3;

    (0, _classCallCheck2["default"])(this, VCard);
    _this3 = _super4.call(this, options);
    Object.assign((0, _assertThisInitialized2["default"])(_this3), {
      addressBook: null,
      addressData: null
    }, options);
    return _this3;
  }

  return VCard;
}(DAVObject);

exports.VCard = VCard;

},{"@babel/runtime/helpers/assertThisInitialized":26,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/getPrototypeOf":30,"@babel/runtime/helpers/inherits":31,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/possibleConstructorReturn":34}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DAV = exports.CARDDAV = exports.CALDAV = exports.APPLE = exports.CALENDAR_SERVER = void 0;
var CALENDAR_SERVER = 'http://calendarserver.org/ns/';
exports.CALENDAR_SERVER = CALENDAR_SERVER;
var APPLE = 'http://apple.com/ns/ical/';
exports.APPLE = APPLE;
var CALDAV = 'urn:ietf:params:xml:ns:caldav';
exports.CALDAV = CALDAV;
var CARDDAV = 'urn:ietf:params:xml:ns:carddav';
exports.CARDDAV = CARDDAV;
var DAV = 'DAV:';
exports.DAV = DAV;

},{}],12:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.multistatus = multistatus;

var _camelize = _interopRequireDefault(require("./camelize"));

var debug = require('./debug')["default"]('dav:parser');

var DOMParser;

if (typeof self !== 'undefined' && 'DOMParser' in self) {
  // browser main thread
  DOMParser = self.DOMParser;
} else {
  // nodejs or web worker
  DOMParser = require('xmldom').DOMParser;
}

function multistatus(string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/xml');
  var result = traverse.multistatus(child(doc, 'multistatus'));
  debug("input:\n".concat(string, "\noutput:\n").concat(JSON.stringify(result), "\n"));
  return result;
}

var traverse = {
  // { response: [x, y, z] }
  multistatus: function multistatus(node) {
    return complex(node, {
      response: true
    });
  },
  // { propstat: [x, y, z] }
  response: function response(node) {
    return complex(node, {
      propstat: true,
      href: false,
      status: false
    });
  },
  // { prop: x }
  propstat: function propstat(node) {
    return complex(node, {
      prop: false
    });
  },
  // {
  //   resourcetype: x
  //   supportedCalendarComponentSet: y,
  //   supportedReportSet: z
  // }
  prop: function prop(node) {
    return complex(node, {
      resourcetype: false,
      supportedCalendarComponentSet: false,
      currentUserPrivilegeSet: false,
      supportedReportSet: false,
      currentUserPrincipal: false,
      calendarUserAddressSet: false
    });
  },
  resourcetype: function resourcetype(node) {
    return childNodes(node).map(function (childNode) {
      return childNode.localName;
    });
  },
  // [x, y, z]
  supportedCalendarComponentSet: function supportedCalendarComponentSet(node) {
    return complex(node, {
      comp: true
    }, 'comp');
  },
  // [x, y, z]
  currentUserPrivilegeSet: function currentUserPrivilegeSet(node) {
    return complex(node, {
      privilege: true
    }, 'privilege');
  },
  // [x, y, z]
  calendarUserAddressSet: function calendarUserAddressSet(node) {
    return complex(node, {
      href: true
    }, 'href');
  },
  // [x, y, z]
  supportedReportSet: function supportedReportSet(node) {
    return complex(node, {
      supportedReport: true
    }, 'supportedReport');
  },
  comp: function comp(node) {
    return node.getAttribute('name');
  },
  // x
  supportedReport: function supportedReport(node) {
    return complex(node, {
      report: false
    }, 'report');
  },
  report: function report(node) {
    return childNodes(node).map(function (childNode) {
      return childNode.localName;
    });
  },
  privilege: function privilege(node) {
    return childNodes(node).map(function (childNode) {
      return childNode.localName;
    });
  },
  href: function href(node) {
    return decodeURIComponent(childNodes(node)[0].nodeValue);
  },
  status: function status(node) {
    return decodeURIComponent(childNodes(node)[0].nodeValue);
  },
  currentUserPrincipal: function currentUserPrincipal(node) {
    return complex(node, {
      href: false
    }, 'href');
  }
};

function complex(node, childspec, collapse) {
  var result = {};

  for (var key in childspec) {
    if (childspec[key]) {
      // Create array since we're expecting multiple.
      result[key] = [];
    }
  }

  childNodes(node).forEach(function (childNode) {
    return traverseChild(node, childNode, childspec, result);
  });
  return maybeCollapse(result, childspec, collapse);
}
/**
 * Parse child childNode of node with childspec and write outcome to result.
 */


function traverseChild(node, childNode, childspec, result) {
  if (childNode.nodeType === 3 && /^\s+$/.test(childNode.nodeValue)) {
    // Whitespace... nothing to do.
    return;
  }

  var localName = (0, _camelize["default"])(childNode.localName, '-');

  if (!(localName in childspec)) {
    debug('Unexpected node of type ' + localName + ' encountered while ' + 'parsing ' + node.localName + ' node!');
    var value = childNode.textContent;

    if (localName in result) {
      if (!Array.isArray(result[localName])) {
        // Since we've already encountered this node type and we haven't yet
        // made an array for it, make an array now.
        result[localName] = [result[localName]];
      }

      result[localName].push(value);
      return;
    } // First time we're encountering this node.


    result[localName] = value;
    return;
  }

  var traversal = traverse[localName](childNode);

  if (childspec[localName]) {
    // Expect multiple.
    result[localName].push(traversal);
  } else {
    // Expect single.
    result[localName] = traversal;
  }
}

function maybeCollapse(result, childspec, collapse) {
  if (!collapse) {
    return result;
  }

  if (!childspec[collapse]) {
    return result[collapse];
  } // Collapse array.


  return result[collapse].reduce(function (a, b) {
    return a.concat(b);
  }, []);
}

function childNodes(node) {
  var result = node.childNodes;

  if (!Array.isArray(result)) {
    result = Array.prototype.slice.call(result);
  }

  return result;
}

function children(node, localName) {
  return childNodes(node).filter(function (childNode) {
    return childNode.localName === localName;
  });
}

function child(node, localName) {
  return children(node, localName)[0];
}

},{"./camelize":4,"./debug":7,"@babel/runtime/helpers/interopRequireDefault":32,"xmldom":46}],13:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressBookQuery = addressBookQuery;
exports.basic = basic;
exports.calendarQuery = calendarQuery;
exports.calendarMultiget = calendarMultiget;
exports.collectionQuery = collectionQuery;
exports.propfind = propfind;
exports.syncCollection = syncCollection;
exports.mergeProps = mergeProps;
exports.getProps = getProps;
exports.setRequestHeaders = setRequestHeaders;
exports.Request = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _parser = require("./parser");

var template = _interopRequireWildcard(require("./template"));

var debug = require('./debug')["default"]('dav:request');
/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 */


function addressBookQuery(options) {
  return collectionQuery(template.addressBookQuery({
    props: options.props || []
  }), {
    depth: options.depth
  });
}
/**
 * Options:
 *
 *   (String) data - put request body.
 *   (String) method - http method.
 *   (String) etag - cached calendar object etag.
 */


function basic(options) {
  function transformRequest(xhr) {
    setRequestHeaders(xhr, options);
  }

  return new Request({
    method: options.method,
    requestData: options.data,
    transformRequest: transformRequest
  });
}
/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) filters - list of filters to send with request.
 *   (Array.<Object>) props - list of props to request.
 *   (String) timezone - VTIMEZONE calendar object.
 */


function calendarQuery(options) {
  return collectionQuery(template.calendarQuery({
    props: options.props || [],
    filters: options.filters || [],
    timezone: options.timezone
  }), {
    depth: options.depth
  });
}
/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 *   (Array.String) hrefs - list of hrefs to request.
 */


function calendarMultiget(options) {
  return collectionQuery(template.calendarMultiget({
    props: options.props || [],
    hrefs: options.hrefs || []
  }), {
    depth: options.depth
  });
}

function collectionQuery(requestData, options) {
  function transformRequest(xhr) {
    setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    return (0, _parser.multistatus)(xhr.responseText).response.map(function (res) {
      return {
        href: res.href,
        props: getProps(res.propstat),
        status: res.status
      };
    });
  }

  return new Request({
    method: 'REPORT',
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
}
/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 */


function propfind(options) {
  var requestData = template.propfind({
    props: options.props
  });

  function transformRequest(xhr) {
    setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    var responses = (0, _parser.multistatus)(xhr.responseText).response.map(function (res) {
      return {
        href: res.href,
        props: getProps(res.propstat),
        status: res.status
      };
    });

    if (!options.mergeResponses) {
      return responses;
    } // Merge the props.


    var merged = mergeProps(responses.map(function (res) {
      return res.props;
    }));
    var hrefs = responses.map(function (res) {
      return res.href;
    });
    return {
      props: merged,
      hrefs: hrefs
    };
  }

  return new Request({
    method: 'PROPFIND',
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
}
/**
 * Options:
 *
 *   (String) depth - option value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 *   (Number) syncLevel - indicates scope of the sync report request.
 *   (String) syncToken - synchronization token provided by the server.
 */


function syncCollection(options) {
  var requestData = template.syncCollection({
    props: options.props,
    syncLevel: options.syncLevel,
    syncToken: options.syncToken
  });

  function transformRequest(xhr) {
    setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    var object = (0, _parser.multistatus)(xhr.responseText);
    var responses = object.response.map(function (res) {
      return {
        href: res.href,
        props: getProps(res.propstat),
        status: res.status
      };
    });
    return {
      responses: responses,
      syncToken: object.syncToken
    };
  }

  return new Request({
    method: 'REPORT',
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
}

var Request = function Request() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  (0, _classCallCheck2["default"])(this, Request);
  Object.assign(this, {
    method: null,
    requestData: null,
    transformRequest: null,
    transformResponse: null,
    onerror: null
  }, options);
};

exports.Request = Request;

function getProp(propstat) {
  if (/404/g.test(propstat.status)) {
    return null;
  }

  if (/5\d{2}/g.test(propstat.status) || /4\d{2}/g.test(propstat.status)) {
    debug('Warning: bad status on propstat: ' + propstat.status);
  }

  return 'prop' in propstat ? propstat.prop : null;
}

function mergeProps(props) {
  return props.reduce(function (a, b) {
    return Object.assign(a, b);
  }, {});
}
/**
 * Map propstats to props.
 */


function getProps(propstats) {
  return mergeProps(propstats.map(getProp).filter(function (prop) {
    return prop && (0, _typeof2["default"])(prop) === 'object';
  }));
}

function setRequestHeaders(request, options) {
  if ('contentType' in options && options.contentType != null) {
    request.setRequestHeader('Content-Type', options.contentType);
  } else {
    request.setRequestHeader('Content-Type', 'application/xml;charset=utf-8');
  }

  if ('depth' in options && options.depth != null) {
    request.setRequestHeader('Depth', options.depth);
  }

  if ('etag' in options && options.etag != null) {
    request.setRequestHeader('If-Match', options.etag);
  }
}

},{"./debug":7,"./parser":12,"./template":20,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"@babel/runtime/helpers/typeof":36}],14:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSandbox = createSandbox;
exports.Sandbox = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/**
 * @fileoverview Group requests together and then abort as a group.
 *
 * var sandbox = new dav.Sandbox();
 * return Promise.all([
 *   dav.createEvent(event, { sandbox: sandbox }),
 *   dav.deleteEvent(other, { sandbox: sandbox })
 * ])
 * .catch(function() {
 *   // Something went wrong so abort all requests.
 *   sandbox.abort;
 * });
 */
var debug = require('./debug')["default"]('dav:sandbox');

var Sandbox = /*#__PURE__*/function () {
  function Sandbox() {
    (0, _classCallCheck2["default"])(this, Sandbox);
    this.requestList = [];
  }

  (0, _createClass2["default"])(Sandbox, [{
    key: "add",
    value: function add(request) {
      debug('Adding request to sandbox.');
      this.requestList.push(request);
    }
  }, {
    key: "abort",
    value: function abort() {
      debug('Aborting sandboxed requests.');
      this.requestList.forEach(function (request) {
        return request.abort();
      });
    }
  }]);
  return Sandbox;
}();

exports.Sandbox = Sandbox;

function createSandbox() {
  return new Sandbox();
}

},{"./debug":7,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/createClass":29,"@babel/runtime/helpers/interopRequireDefault":32}],15:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = addressBookQuery;

var _prop = _interopRequireDefault(require("./prop"));

function addressBookQuery(object) {
  return "<card:addressbook-query xmlns:card=\"urn:ietf:params:xml:ns:carddav\"\n                          xmlns:d=\"DAV:\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n    <!-- According to http://stackoverflow.com/questions/23742568/google-carddav-api-addressbook-multiget-returns-400-bad-request,\n         Google's CardDAV server requires a filter element. I don't think all addressbook-query calls need a filter in the spec though? -->\n    <card:filter>\n      <card:prop-filter name=\"FN\">\n      </card:prop-filter>\n    </card:filter>\n  </card:addressbook-query>");
}

},{"./prop":21,"@babel/runtime/helpers/interopRequireDefault":32}],16:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calendarMultiget;

var _prop = _interopRequireDefault(require("./prop"));

var _href = _interopRequireDefault(require("./href"));

function calendarMultiget(object) {
  return "<c:calendar-multiget xmlns:d=\"DAV:\"\n                               xmlns:c=\"urn:ietf:params:xml:ns:caldav\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n    ").concat(object.hrefs.map(_href["default"]), "\n  </c:calendar-multiget>");
}

},{"./href":19,"./prop":21,"@babel/runtime/helpers/interopRequireDefault":32}],17:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calendarQuery;

var _filter = _interopRequireDefault(require("./filter"));

var _prop = _interopRequireDefault(require("./prop"));

function calendarQuery(object) {
  return "<c:calendar-query xmlns:c=\"urn:ietf:params:xml:ns:caldav\"\n                    xmlns:cs=\"http://calendarserver.org/ns/\"\n                    xmlns:d=\"DAV:\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n    <c:filter>\n      ").concat(object.filters.map(_filter["default"]), "\n    </c:filter>\n    ").concat(object.timezone ? '<c:timezone>' + object.timezone + '</c:timezone>' : '', "\n  </c:calendar-query>");
}

},{"./filter":18,"./prop":21,"@babel/runtime/helpers/interopRequireDefault":32}],18:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = filter;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function filter(item) {
  if (!item.children || !item.children.length) {
    if (typeof item.value === 'undefined') {
      return "<c:".concat(item.type, " ").concat(formatAttrs(item.attrs), "/>");
    }

    return "<c:".concat(item.type, " ").concat(formatAttrs(item.attrs), ">").concat(item.value, "</c:").concat(item.type, ">");
  }

  var children = item.children.map(filter);
  return "<c:".concat(item.type, " ").concat(formatAttrs(item.attrs), ">\n            ").concat(children, "\n          </c:").concat(item.type, ">");
}

function formatAttrs(attrs) {
  if ((0, _typeof2["default"])(attrs) !== 'object') {
    return '';
  }

  return Object.keys(attrs).map(function (attr) {
    return "".concat(attr, "=\"").concat(attrs[attr], "\"");
  }).join(' ');
}

},{"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/typeof":36}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = href;

function href(item) {
  return "<d:href>".concat(item, "</d:href>");
}

},{}],20:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "propfind", {
  enumerable: true,
  get: function get() {
    return _propfind["default"];
  }
});
Object.defineProperty(exports, "addressBookQuery", {
  enumerable: true,
  get: function get() {
    return _address_book_query["default"];
  }
});
Object.defineProperty(exports, "calendarQuery", {
  enumerable: true,
  get: function get() {
    return _calendar_query["default"];
  }
});
Object.defineProperty(exports, "calendarMultiget", {
  enumerable: true,
  get: function get() {
    return _calendar_multiget["default"];
  }
});
Object.defineProperty(exports, "syncCollection", {
  enumerable: true,
  get: function get() {
    return _sync_collection["default"];
  }
});

var _propfind = _interopRequireDefault(require("./propfind"));

var _address_book_query = _interopRequireDefault(require("./address_book_query"));

var _calendar_query = _interopRequireDefault(require("./calendar_query"));

var _calendar_multiget = _interopRequireDefault(require("./calendar_multiget"));

var _sync_collection = _interopRequireDefault(require("./sync_collection"));

},{"./address_book_query":15,"./calendar_multiget":16,"./calendar_query":17,"./propfind":22,"./sync_collection":23,"@babel/runtime/helpers/interopRequireDefault":32}],21:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = prop;

var ns = _interopRequireWildcard(require("../namespace"));

/**
 * @param {Object} filter looks like
 *
 *     {
 *       type: 'comp-filter',
 *       attrs: {
 *         name: 'VCALENDAR'
 *       }
 *     }
 *
 * Or maybe
 *
 *     {
 *       type: 'time-range',
 *       attrs: {
 *         start: '20060104T000000Z',
 *         end: '20060105T000000Z'
 *       }
 *     }
 *
 * You can nest them like so:
 *
 *     {
 *       type: 'comp-filter',
 *       attrs: { name: 'VCALENDAR' },
 *       children: [{
 *         type: 'comp-filter',
 *         attrs: { name: 'VEVENT' },
 *         children: [{
 *           type: 'time-range',
 *           attrs: { start: '20060104T000000Z', end: '20060105T000000Z' }
 *         }]
 *       }]
 *     }
 */
function prop(item) {
  return "<".concat(xmlnsPrefix(item.namespace), ":").concat(item.name, " />");
}

function xmlnsPrefix(namespace) {
  switch (namespace) {
    case ns.DAV:
      return 'd';

    case ns.CALENDAR_SERVER:
      return 'cs';

    case ns.CALDAV:
      return 'c';

    case ns.CARDDAV:
      return 'card';

    case ns.APPLE:
      return 'x';

    default:
      throw new Error('Unrecognized xmlns ' + namespace);
  }
}

},{"../namespace":11,"@babel/runtime/helpers/interopRequireWildcard":33}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = propfind;

var _prop = _interopRequireDefault(require("./prop"));

function propfind(object) {
  return "<d:propfind xmlns:c=\"urn:ietf:params:xml:ns:caldav\"\n              xmlns:card=\"urn:ietf:params:xml:ns:carddav\"\n              xmlns:cs=\"http://calendarserver.org/ns/\"\n              xmlns:x=\"http://apple.com/ns/ical/\"\n              xmlns:d=\"DAV:\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n  </d:propfind>");
}

},{"./prop":21,"@babel/runtime/helpers/interopRequireDefault":32}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = syncCollection;

var _prop = _interopRequireDefault(require("./prop"));

function syncCollection(object) {
  return "<d:sync-collection xmlns:c=\"urn:ietf:params:xml:ns:caldav\"\n                     xmlns:card=\"urn:ietf:params:xml:ns:carddav\"\n                     xmlns:d=\"DAV:\">\n    <d:sync-level>".concat(object.syncLevel, "</d:sync-level>\n    <d:sync-token>").concat(object.syncToken, "</d:sync-token>\n    <d:prop>\n      ").concat(object.props.map(_prop["default"]), "\n    </d:prop>\n  </d:sync-collection>");
}

},{"./prop":21,"@babel/runtime/helpers/interopRequireDefault":32}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth2 = exports.Basic = exports.Transport = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _co = _interopRequireDefault(require("co"));

var _querystring = _interopRequireDefault(require("querystring"));

var _XMLHttpRequestWrapper = _interopRequireDefault(require("./XMLHttpRequestWrapper"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Transport = /*#__PURE__*/function () {
  /**
   * @param {dav.Credentials} credentials user authorization.
   */
  function Transport(credentials) {
    (0, _classCallCheck2["default"])(this, Transport);
    this.credentials = credentials || null;
  }
  /**
   * @param {dav.Request} request object with request info.
   * @return {Promise} a promise that will be resolved with an xhr request after
   *     its readyState is 4 or the result of applying an optional request
   *     `transformResponse` function to the xhr object after its readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   */


  (0, _createClass2["default"])(Transport, [{
    key: "send",
    value: function send() {}
  }]);
  return Transport;
}();

exports.Transport = Transport;

var Basic = /*#__PURE__*/function (_Transport) {
  (0, _inherits2["default"])(Basic, _Transport);

  var _super = _createSuper(Basic);

  /**
   * @param {dav.Credentials} credentials user authorization.
   */
  function Basic(credentials) {
    (0, _classCallCheck2["default"])(this, Basic);
    return _super.call(this, credentials);
  }

  (0, _createClass2["default"])(Basic, [{
    key: "send",
    value: function send(request, url, options) {
      return (0, _co["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var sandbox, followRedirect, transformRequest, transformResponse, onerror, xhr, result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                sandbox = options && options.sandbox;
                followRedirect = !options || options.followRedirect !== false; // default true

                transformRequest = request.transformRequest;
                transformResponse = request.transformResponse;
                onerror = request.onerror;
                xhr = new _XMLHttpRequestWrapper["default"]();
                if (sandbox) sandbox.add(xhr);
                xhr.open(request.method, url, true
                /* async */
                , this.credentials.username, this.credentials.password, followRedirect);
                if (transformRequest) transformRequest(xhr);
                _context.prev = 9;
                _context.next = 12;
                return xhr.send(request.requestData);

              case 12:
                result = transformResponse ? transformResponse(xhr) : xhr;
                _context.next = 19;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](9);
                if (onerror) onerror(_context.t0);
                throw _context.t0;

              case 19:
                return _context.abrupt("return", result);

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 15]]);
      }).bind(this));
    }
  }]);
  return Basic;
}(Transport);
/**
 * @param {dav.Credentials} credentials user authorization.
 */


exports.Basic = Basic;

var OAuth2 = /*#__PURE__*/function (_Transport2) {
  (0, _inherits2["default"])(OAuth2, _Transport2);

  var _super2 = _createSuper(OAuth2);

  function OAuth2(credentials) {
    (0, _classCallCheck2["default"])(this, OAuth2);
    return _super2.call(this, credentials);
  }

  (0, _createClass2["default"])(OAuth2, [{
    key: "send",
    value: function send(request, url) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return (0, _co["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var sandbox, transformRequest, transformResponse, onerror, result, xhr, token;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                sandbox = options.sandbox;
                transformRequest = request.transformRequest;
                transformResponse = request.transformResponse;
                onerror = request.onerror;
                if (!('retry' in options)) options.retry = true;
                _context2.prev = 5;
                _context2.next = 8;
                return access(this.credentials, options);

              case 8:
                token = _context2.sent;
                xhr = new _XMLHttpRequestWrapper["default"]();
                if (sandbox) sandbox.add(xhr);
                xhr.open(request.method, url, true
                /* async */
                );
                xhr.setRequestHeader('Authorization', "Bearer ".concat(token));
                if (transformRequest) transformRequest(xhr);
                _context2.next = 16;
                return xhr.send(request.requestData);

              case 16:
                result = transformResponse ? transformResponse(xhr) : xhr;
                _context2.next = 27;
                break;

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2["catch"](5);

                if (!(options.retry && xhr.status === 401)) {
                  _context2.next = 25;
                  break;
                }

                // Force expiration.
                this.credentials.expiration = 0; // Retry once at most.

                options.retry = false;
                return _context2.abrupt("return", this.send(request, url, options));

              case 25:
                if (onerror) onerror(_context2.t0);
                throw _context2.t0;

              case 27:
                return _context2.abrupt("return", result);

              case 28:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 19]]);
      }).bind(this));
    }
  }]);
  return OAuth2;
}(Transport);
/**
 * @return {Promise} promise that will resolve with access token.
 */


exports.OAuth2 = OAuth2;

function access(credentials, options) {
  if (!credentials.accessToken) {
    return getAccessToken(credentials, options);
  }

  if (credentials.refreshToken && isExpired(credentials)) {
    return refreshAccessToken(credentials, options);
  }

  return Promise.resolve(credentials.accessToken);
}

function isExpired(credentials) {
  return typeof credentials.expiration === 'number' && Date.now() > credentials.expiration;
}

var getAccessToken = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee3(credentials, options) {
  var sandbox, xhr, data, now, response;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          sandbox = options.sandbox;
          xhr = new _XMLHttpRequestWrapper["default"]();
          if (sandbox) sandbox.add(xhr);
          xhr.open('POST', credentials.tokenUrl, true
          /* async */
          );
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          data = _querystring["default"].stringify({
            code: credentials.authorizationCode,
            redirect_uri: credentials.redirectUrl,
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            grant_type: 'authorization_code'
          });
          now = Date.now();
          _context3.next = 9;
          return xhr.send(data);

        case 9:
          response = JSON.parse(xhr.responseText);
          credentials.accessToken = response.access_token;
          credentials.refreshToken = 'refresh_token' in response ? response.refresh_token : null;
          credentials.expiration = 'expires_in' in response ? now + response.expires_in : null;
          return _context3.abrupt("return", response.access_token);

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
}));

var refreshAccessToken = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee4(credentials, options) {
  var sandbox, xhr, data, now, response;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          sandbox = options.sandbox;
          xhr = new _XMLHttpRequestWrapper["default"]();
          if (sandbox) sandbox.add(xhr);
          xhr.open('POST', credentials.tokenUrl, true
          /* async */
          );
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          data = _querystring["default"].stringify({
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            refresh_token: credentials.refreshToken,
            grant_type: 'refresh_token'
          });
          now = Date.now();
          _context4.next = 9;
          return xhr.send(data);

        case 9:
          response = JSON.parse(xhr.responseText);
          credentials.accessToken = response.access_token;
          credentials.expiration = 'expires_in' in response ? now + response.expires_in : null;
          return _context4.abrupt("return", response.access_token);

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}));

},{"./XMLHttpRequestWrapper":1,"@babel/runtime/helpers/classCallCheck":28,"@babel/runtime/helpers/createClass":29,"@babel/runtime/helpers/getPrototypeOf":30,"@babel/runtime/helpers/inherits":31,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/regenerator":37,"co":38,"querystring":42}],25:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createObject = createObject;
exports.updateObject = updateObject;
exports.deleteObject = deleteObject;
exports.syncCollection = syncCollection;
exports.isCollectionDirty = exports.supportedReportSet = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _co = _interopRequireDefault(require("co"));

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

var debug = require('./debug')["default"]('dav:webdav');
/**
 * @param {String} objectUrl url for webdav object.
 * @param {String} objectData webdav object data.
 */


function createObject(objectUrl, objectData, options) {
  var req = request.basic({
    method: 'PUT',
    contentType: options.contentType,
    data: objectData
  });
  return options.xhr.send(req, objectUrl, {
    sandbox: options.sandbox
  });
}

function updateObject(objectUrl, objectData, etag, options) {
  var req = request.basic({
    method: 'PUT',
    contentType: options.contentType,
    data: objectData,
    etag: etag
  });
  return options.xhr.send(req, objectUrl, {
    sandbox: options.sandbox
  });
}

function deleteObject(objectUrl, etag, options) {
  var req = request.basic({
    method: 'DELETE',
    etag: etag
  });
  return options.xhr.send(req, objectUrl, {
    sandbox: options.sandbox
  });
}

function syncCollection(collection, options) {
  var syncMethod;

  if ('syncMethod' in options) {
    syncMethod = options.syncMethod;
  } else if (collection.reports && collection.reports.indexOf('sync-collection') !== -1) {
    syncMethod = 'webdav';
  } else {
    syncMethod = 'basic';
  }

  if (syncMethod === 'webdav') {
    debug('rfc 6578 sync.');
    return options.webdavSync(collection, options);
  } else {
    debug('basic sync.');
    return options.basicSync(collection, options);
  }
}
/**
 * @param {dav.DAVCollection} collection to fetch report set for.
 */


var supportedReportSet = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee(collection, options) {
  var req, response;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          debug('Checking supported report set for collection at ' + collection.url);
          req = request.propfind({
            props: [{
              name: 'supported-report-set',
              namespace: ns.DAV
            }],
            depth: 0,
            mergeResponses: true
          });
          _context.next = 4;
          return options.xhr.send(req, collection.url, {
            sandbox: options.sandbox
          });

        case 4:
          response = _context.sent;
          return _context.abrupt("return", response.props.supportedReportSet);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

exports.supportedReportSet = supportedReportSet;

var isCollectionDirty = _co["default"].wrap( /*#__PURE__*/_regenerator["default"].mark(function _callee2(collection, options) {
  var req, responses, response;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (collection.ctag) {
            _context2.next = 3;
            break;
          }

          debug('Missing ctag.');
          return _context2.abrupt("return", true);

        case 3:
          debug('Fetch remote getctag prop.');
          req = request.propfind({
            props: [{
              name: 'getctag',
              namespace: ns.CALENDAR_SERVER
            }],
            depth: 0
          });
          _context2.next = 7;
          return options.xhr.send(req, collection.url, {
            sandbox: options.sandbox
          });

        case 7:
          responses = _context2.sent;
          response = responses.filter(function (response) {
            // Find the response that corresponds to the parameter collection.
            return (0, _fuzzy_url_equals["default"])(collection.url, response.href);
          })[0];

          if (response) {
            _context2.next = 11;
            break;
          }

          throw new Error('Could not find collection on remote. Was it deleted?');

        case 11:
          debug('Check whether cached ctag matches remote.');
          return _context2.abrupt("return", collection.ctag !== response.props.getctag);

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));

exports.isCollectionDirty = isCollectionDirty;

},{"./debug":7,"./fuzzy_url_equals":8,"./namespace":11,"./request":13,"@babel/runtime/helpers/interopRequireDefault":32,"@babel/runtime/helpers/interopRequireWildcard":33,"@babel/runtime/regenerator":37,"co":38}],26:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],27:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],28:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],29:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],30:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],31:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
},{"./setPrototypeOf":35}],32:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],33:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof");

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;
},{"@babel/runtime/helpers/typeof":36}],34:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"./assertThisInitialized":26,"@babel/runtime/helpers/typeof":36}],35:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],36:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],37:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":43}],38:[function(require,module,exports){

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1)

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

},{}],39:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],41:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],42:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":40,"./encode":41}],43:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],44:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":45,"punycode":39,"querystring":42}],45:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],46:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":47,"./sax":48}],47:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],48:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],49:[function(require,module,exports){
module.exports={
  "name": "dav",
  "version": "1.7.9",
  "author": "Gareth Aye [:gaye] <gaye@mozilla.com>",
  "description": "WebDAV, CalDAV, and CardDAV client for nodejs and the browser",
  "license": "MPL-2.0",
  "main": "dav.js",
  "repository": "https://github.com/gaye/dav",
  "typings": "./index.d.ts",
  "keywords": [
    "address book",
    "calendar",
    "contacts",
    "dav",
    "caldav",
    "carddav",
    "webdav",
    "ical",
    "vcard",
    "sync",
    "rfc 4791",
    "rfc 6352",
    "rfc 6578"
  ],
  "dependencies": {
    "co": "^4.6.0",
    "request": "git+https://github.com/marcoancona/request.git#01b7b6ef318fd2f08c9e56ab3f9b9526ce32024d",
    "xmldom": "^0.1.19"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.4",
    "@babel/core": "^7.9.0",
    "@babel/plugin-proposal-class-properties": "^7.0.0",
    "@babel/plugin-proposal-decorators": "^7.0.0",
    "@babel/plugin-proposal-do-expressions": "^7.0.0",
    "@babel/plugin-proposal-export-default-from": "^7.0.0",
    "@babel/plugin-proposal-export-namespace-from": "^7.0.0",
    "@babel/plugin-proposal-function-bind": "^7.0.0",
    "@babel/plugin-proposal-function-sent": "^7.0.0",
    "@babel/plugin-proposal-json-strings": "^7.0.0",
    "@babel/plugin-proposal-logical-assignment-operators": "^7.0.0",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.0.0",
    "@babel/plugin-proposal-numeric-separator": "^7.0.0",
    "@babel/plugin-proposal-optional-chaining": "^7.0.0",
    "@babel/plugin-proposal-pipeline-operator": "^7.0.0",
    "@babel/plugin-proposal-throw-expressions": "^7.0.0",
    "@babel/plugin-syntax-async-generators": "^7.0.0",
    "@babel/plugin-syntax-dynamic-import": "^7.0.0",
    "@babel/plugin-syntax-import-meta": "^7.0.0",
    "@babel/plugin-transform-classes": "^7.9.2",
    "@babel/plugin-transform-flow-strip-types": "^7.0.0",
    "@babel/plugin-transform-runtime": "^7.12.1",
    "@babel/preset-env": "^7.9.0",
    "@babel/register": "^7.0.0",
    "@types/chai": "^4.2.14",
    "@types/mocha": "^8.0.3",
    "babelify": "^10.0.0",
    "browserify": "^16.5.0",
    "chai": "^4.2.0",
    "doctoc": "^0.15.0",
    "mocha": "^8.2.1",
    "nock": "^9.1.6",
    "prettier": "^2.0.5",
    "sinon": "^1.16.1",
    "tcp-port-used": "^0.1.2",
    "tinyify": "^2.5.2",
    "uglify-js": "^2.4.24"
  },
  "scripts": {
    "test": "make test",
    "build": "make",
    "format": "prettier --config ./.prettierrc --write ."
  }
}

},{}]},{},[9])(9)
});
