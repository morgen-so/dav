"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalendarObject = getCalendarObject;
exports.createCalendarObject = createCalendarObject;
exports.updateCalendarObject = updateCalendarObject;
exports.deleteCalendarObject = deleteCalendarObject;
exports.syncCalendar = syncCalendar;
exports.syncCaldavAccount = exports.multigetSingleCalendarObject = exports.multigetCalendarObjects = exports.listCalendarObjectsEtags = exports.listCalendarObjects = exports.getCalendar = exports.listCalendars = void 0;

var _co = _interopRequireDefault(require("co"));

var _url = _interopRequireDefault(require("url"));

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var _model = require("./model");

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

var webdav = _interopRequireWildcard(require("./webdav"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var debug = require('./debug')('dav:calendars');

var ICAL_OBJS = new Set(['VEVENT', 'VTODO', 'VJOURNAL', 'VFREEBUSY', 'VTIMEZONE', 'VALARM']);
/**
 * @param {dav.Account} account to fetch calendars for.
 */

var listCalendars = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(account, options) {
  var req, responses, cals;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
              url: _url["default"].resolve(account.rootUrl, res.href),
              ctag: res.props.getctag,
              displayName: res.props.displayname,
              components: res.props.supportedCalendarComponentSet,
              resourcetype: res.props.resourcetype,
              syncToken: res.props.syncToken,
              currentUserPrivilegeSet: res.props.currentUserPrivilegeSet
            });
          });
          _context2.next = 9;
          return cals.map(_co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cal) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
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

var getCalendar = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(account, calendarUrl, options) {
  var req, responses, cals;
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
              url: _url["default"].resolve(account.rootUrl, res.href),
              ctag: res.props.getctag,
              displayName: res.props.displayname,
              components: res.props.supportedCalendarComponentSet,
              resourcetype: res.props.resourcetype,
              syncToken: res.props.syncToken,
              currentUserPrivilegeSet: res.props.currentUserPrivilegeSet
            });
          });
          _context4.next = 9;
          return cals.map(_co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(cal) {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
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

;
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


var listCalendarObjects = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(calendar, options) {
  var results;
  return regeneratorRuntime.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          debug("Listing objects on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username));
          _context5.next = 3;
          return listCalendarObjectsEtags(calendar, options);

        case 3:
          results = _context5.sent;
          options.hrefs = results.map(function (res) {
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
 * @param {dav.Calendar} calendar the calendar to fetch etags for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */


exports.listCalendarObjects = listCalendarObjects;

var listCalendarObjectsEtags = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(calendar, options) {
  var filters, req, responses;
  return regeneratorRuntime.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
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
          _context6.next = 5;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 5:
          responses = _context6.sent;
          return _context6.abrupt("return", responses.map(function (res) {
            debug("Found calendar object (etag only) with url ".concat(res.href));
            return {
              href: res.href,
              etag: res.props.getetag
            };
          }));

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
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

var multigetCalendarObjects = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(calendar, options) {
  var hrefs, req, responses;
  return regeneratorRuntime.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          debug("Doing multiget on calendar ".concat(calendar.url, " which belongs to\n         ").concat(calendar.account.credentials.username));
          hrefs = options.hrefs || [];

          if (hrefs.length) {
            _context7.next = 4;
            break;
          }

          return _context7.abrupt("return", []);

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
            hrefs: hrefs
          });
          _context7.next = 7;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 7:
          responses = _context7.sent;
          return _context7.abrupt("return", responses.map(function (res) {
            //debug(`Found calendar object with url ${res.href}`);
            return new _model.CalendarObject({
              data: res,
              calendar: calendar,
              url: _url["default"].resolve(calendar.account.rootUrl, res.href),
              etag: res.props.getetag,
              calendarData: res.props.calendarData
            });
          }));

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}));

exports.multigetCalendarObjects = multigetCalendarObjects;

var multigetSingleCalendarObject = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(calendar, options) {
  var events;
  return regeneratorRuntime.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return multigetCalendarObjects(calendar, options);

        case 2:
          events = _context8.sent;
          return _context8.abrupt("return", events.filter(function (event) {
            // Find the response that corresponds to the parameter collection.
            return (0, _fuzzy_url_equals["default"])(options.href, event.url);
          })[0]);

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8);
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


var syncCaldavAccount = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(account) {
  var options,
      cals,
      _args10 = arguments;
  return regeneratorRuntime.wrap(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          options = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : {};
          options.loadObjects = false;
          if (!account.calendars) account.calendars = [];
          _context10.next = 5;
          return listCalendars(account, options);

        case 5:
          cals = _context10.sent;
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
          _context10.next = 10;
          return account.calendars.map(_co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(cal, index) {
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    _context9.prev = 0;
                    _context9.next = 3;
                    return syncCalendar(cal, options);

                  case 3:
                    _context9.next = 9;
                    break;

                  case 5:
                    _context9.prev = 5;
                    _context9.t0 = _context9["catch"](0);
                    debug("Sync calendar ".concat(cal.displayName, " failed with ").concat(_context9.t0));
                    account.calendars.splice(index, 1);

                  case 9:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9, null, [[0, 5]]);
          })));

        case 10:
          return _context10.abrupt("return", account);

        case 11:
        case "end":
          return _context10.stop();
      }
    }
  }, _callee10);
}));

exports.syncCaldavAccount = syncCaldavAccount;

var basicSync = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(calendar, options) {
  var sync;
  return regeneratorRuntime.wrap(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return webdav.isCollectionDirty(calendar, options);

        case 2:
          sync = _context11.sent;

          if (sync) {
            _context11.next = 6;
            break;
          }

          debug('Local ctag matched remote! No need to sync :).');
          return _context11.abrupt("return", calendar);

        case 6:
          debug('ctag changed so we need to fetch stuffs.');
          _context11.next = 9;
          return listCalendarObjects(calendar, options);

        case 9:
          calendar.objects = _context11.sent;
          return _context11.abrupt("return", calendar);

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  }, _callee11);
}));

var webdavSync = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(calendar, options) {
  var req, result, deletedHrefs, newUpdatedHrefs, results;
  return regeneratorRuntime.wrap(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
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
          _context12.next = 3;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 3:
          result = _context12.sent;
          // Results contains new, modified or deleted objects.
          // Detect deleted objects as objects with 'null' calendarData.
          deletedHrefs = result.responses.filter(function (res) {
            return res.status && res.status.indexOf('404') > -1;
          }).map(function (res) {
            return res.href;
          });
          newUpdatedHrefs = result.responses.filter(function (res) {
            return !res.status || res.status.indexOf('404') === -1;
          }).map(function (res) {
            return res.href;
          }); // Starting from Feb 2020, iCloud sends 500 if hrefs contain the calendar one, despite providing the other data correctly!
          // TODO: Is this supposed to be the standard??

          if (calendar.url.indexOf("icloud.com") > -1) {
            newUpdatedHrefs = newUpdatedHrefs.filter(function (href) {
              return href.indexOf(".ics") > -1;
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
            hrefs: newUpdatedHrefs
          });
          _context12.next = 10;
          return options.xhr.send(req, calendar.url, {
            sandbox: options.sandbox
          });

        case 10:
          results = _context12.sent;
          results.forEach(function (response) {
            // Find the calendar object that this response corresponds with.
            var calendarObject = calendar.objects.filter(function (object) {
              return (0, _fuzzy_url_equals["default"])(object.url, response.href);
            })[0];

            if (!calendarObject) {
              // New
              calendar.objects.push(new _model.CalendarObject({
                data: response,
                calendar: calendar,
                url: _url["default"].resolve(calendar.account.rootUrl, response.href),
                etag: response.props.getetag,
                calendarData: response.props.calendarData
              }));
            } else {
              // Update (perform in place)
              calendarObject.etag = response.props.getetag;
              calendarObject.calendarData = response.props.calendarData;
            }
          }); // Apply deleted

          calendar.objects = calendar.objects.filter(function (object) {
            return !deletedHrefs.some(function (del) {
              return (0, _fuzzy_url_equals["default"])(object.url, del);
            });
          }); // Update token

          calendar.syncToken = result.syncToken;
          return _context12.abrupt("return", calendar);

        case 15:
        case "end":
          return _context12.stop();
      }
    }
  }, _callee12);
}));