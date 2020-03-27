"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _co = _interopRequireDefault(require("co"));

var _url = _interopRequireDefault(require("url"));

var _calendars = require("./calendars");

var _contacts = require("./contacts");

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var _model = require("./model");

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var debug = require('./debug')('dav:accounts');

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

var serviceDiscovery = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee(account, options) {
  var endpoint, uri, req, xhr, location;
  return regeneratorRuntime.wrap(function _callee$(_context) {
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
            sandbox: options.sandbox
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
          return _context.abrupt("return", _url["default"].format({
            protocol: endpoint.protocol,
            host: endpoint.host,
            pathname: location
          }));

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


var principalUrl = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(account, options) {
  var req, res, container;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          debug("Fetch principal url from context path ".concat(account.rootUrl, "."));
          req = request.propfind({
            props: [{
              name: 'current-user-principal',
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
          debug("Received principal: ".concat(container.currentUserPrincipal));
          return _context2.abrupt("return", _url["default"].resolve(account.rootUrl, container.currentUserPrincipal));

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));
/**
 * @param {dav.Account} account to get home url for.
 */


var homeUrl = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(account, options) {
  var prop, req, responses, response, container, href;
  return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
          container = response.props;

          if (options.accountType === 'caldav') {
            debug("Received home: ".concat(container.calendarHomeSet));
            href = container.calendarHomeSet;
          } else if (options.accountType === 'carddav') {
            debug("Received home: ".concat(container.addressbookHomeSet));
            href = container.addressbookHomeSet;
          }

          return _context3.abrupt("return", _url["default"].resolve(account.rootUrl, href));

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
}));
/**
 * @param {dav.Account} account to address set
 */


var addressSet = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(account, options) {
  var prop, req, responses, response;
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
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


exports.createAccount = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(options) {
  var account, key, loadCollections, loadObjects, collections;
  return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
          _context6.next = 5;
          return serviceDiscovery(account, options);

        case 5:
          account.rootUrl = _context6.sent;
          _context6.next = 8;
          return principalUrl(account, options);

        case 8:
          account.principalUrl = _context6.sent;
          _context6.next = 11;
          return homeUrl(account, options);

        case 11:
          account.homeUrl = _context6.sent;

          if (!(options.accountType === 'caldav')) {
            _context6.next = 16;
            break;
          }

          _context6.next = 15;
          return addressSet(account, options);

        case 15:
          account.addresses = _context6.sent;

        case 16:
          if (options.loadCollections) {
            _context6.next = 18;
            break;
          }

          return _context6.abrupt("return", account);

        case 18:
          if (options.accountType === 'caldav') {
            key = 'calendars';
            loadCollections = _calendars.listCalendars;
            loadObjects = _calendars.listCalendarObjects;
          } else if (options.accountType === 'carddav') {
            key = 'addressBooks';
            loadCollections = _contacts.listAddressBooks;
            loadObjects = _contacts.listVCards;
          }

          _context6.next = 21;
          return loadCollections(account, options);

        case 21:
          collections = _context6.sent;
          account[key] = collections;

          if (options.loadObjects) {
            _context6.next = 25;
            break;
          }

          return _context6.abrupt("return", account);

        case 25:
          _context6.next = 27;
          return collections.map(_co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(collection) {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
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

        case 27:
          account[key] = account[key].filter(function (collection) {
            return !collection.error;
          });
          return _context6.abrupt("return", account);

        case 29:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
}));