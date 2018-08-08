'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getCalendarObject = getCalendarObject;
exports.createCalendarObject = createCalendarObject;
exports.updateCalendarObject = updateCalendarObject;
exports.deleteCalendarObject = deleteCalendarObject;
exports.syncCalendar = syncCalendar;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _fuzzy_url_equals = require('./fuzzy_url_equals');

var _fuzzy_url_equals2 = _interopRequireDefault(_fuzzy_url_equals);

var _model = require('./model');

var _namespace = require('./namespace');

var ns = _interopRequireWildcard(_namespace);

var _request = require('./request');

var request = _interopRequireWildcard(_request);

var _webdav = require('./webdav');

var webdav = _interopRequireWildcard(_webdav);

var debug = require('./debug')('dav:calendars');

var ICAL_OBJS = new Set(['VEVENT', 'VTODO', 'VJOURNAL', 'VFREEBUSY', 'VTIMEZONE', 'VALARM']);

/**
 * @param {dav.Account} account to fetch calendars for.
 */
var listCalendars = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(account, options) {
  var req, responses, cals;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('Fetch calendars from home url ' + account.homeUrl);
        req = request.propfind({
          props: [{ name: 'calendar-description', namespace: ns.CALDAV }, { name: 'calendar-timezone', namespace: ns.CALDAV }, { name: 'displayname', namespace: ns.DAV }, { name: 'getctag', namespace: ns.CALENDAR_SERVER }, { name: 'resourcetype', namespace: ns.DAV }, { name: 'supported-calendar-component-set', namespace: ns.CALDAV }, { name: 'sync-token', namespace: ns.DAV }],
          depth: 1
        });
        context$1$0.next = 4;
        return options.xhr.send(req, account.homeUrl, {
          sandbox: options.sandbox
        });

      case 4:
        responses = context$1$0.sent;

        debug('Found ' + responses.length + ' calendars.');
        cals = responses.filter(function (res) {
          // We only want the calendar if it contains iCalendar objects.
          var resourcetype = res.props.resourcetype || [];
          return resourcetype.indexOf('calendar') !== -1;
        }).map(function (res) {
          debug('Found calendar ' + res.props.displayname + ',\n             props: ' + JSON.stringify(res.props));
          return new _model.Calendar({
            data: res,
            account: account,
            description: res.props.calendarDescription,
            timezone: res.props.calendarTimezone,
            url: _url2['default'].resolve(account.rootUrl, res.href),
            ctag: res.props.getctag,
            displayName: res.props.displayname,
            components: res.props.supportedCalendarComponentSet,
            resourcetype: res.props.resourcetype,
            syncToken: res.props.syncToken
          });
        });
        context$1$0.next = 9;
        return cals.map(_co2['default'].wrap(regeneratorRuntime.mark(function callee$1$0(cal) {
          return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return webdav.supportedReportSet(cal, options);

              case 2:
                cal.reports = context$2$0.sent;

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, callee$1$0, this);
        })));

      case 9:
        return context$1$0.abrupt('return', cals);

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.listCalendars = listCalendars;
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
  var objectUrl = _url2['default'].resolve(calendar.url, options.filename);
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
var listCalendarObjects = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var results;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('Listing objects on calendar ' + calendar.url + ' which belongs to\n         ' + calendar.account.credentials.username);

        context$1$0.next = 3;
        return listCalendarObjectsEtags(calendar, options);

      case 3:
        results = context$1$0.sent;

        options.hrefs = results.map(function (res) {
          return res.href;
        });

        debug('Got the following etags:');
        debug(options.hrefs);

        // First query to get list of etags
        context$1$0.next = 9;
        return multigetCalendarObjects(calendar, options);

      case 9:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.listCalendarObjects = listCalendarObjects;
/**
 * @param {dav.Calendar} calendar the calendar to fetch etags for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
var listCalendarObjectsEtags = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var filters, req, responses;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('Getting etags on calendar ' + calendar.url + ' which belongs to\n         ' + calendar.account.credentials.username);

        filters = options.filters || [{
          type: 'comp-filter',
          attrs: { name: 'VCALENDAR' },
          children: [{
            type: 'comp-filter',
            attrs: { name: 'VEVENT' }
          }]
        }];
        req = request.calendarQuery({
          depth: 1,
          props: [{ name: 'getetag', namespace: ns.DAV }],
          filters: filters
        });
        context$1$0.next = 5;
        return options.xhr.send(req, calendar.url, {
          sandbox: options.sandbox
        });

      case 5:
        responses = context$1$0.sent;
        return context$1$0.abrupt('return', responses.map(function (res) {
          debug('Found calendar object (etag only) with url ' + res.href);
          return { href: res.href, etag: res.props.getetag };
        }));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.listCalendarObjectsEtags = listCalendarObjectsEtags;
/**
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) hrefs - hrefs of objects to retrieve.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
var multigetCalendarObjects = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var hrefs, req, responses;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('Doing multiget on calendar ' + calendar.url + ' which belongs to\n         ' + calendar.account.credentials.username);

        hrefs = options.hrefs || [];

        if (hrefs.length) {
          context$1$0.next = 4;
          break;
        }

        return context$1$0.abrupt('return', []);

      case 4:
        req = request.calendarMultiget({
          depth: 1,
          props: [{ name: 'getetag', namespace: ns.DAV }, { name: 'calendar-data', namespace: ns.CALDAV }],
          hrefs: hrefs
        });
        context$1$0.next = 7;
        return options.xhr.send(req, calendar.url, {
          sandbox: options.sandbox
        });

      case 7:
        responses = context$1$0.sent;
        return context$1$0.abrupt('return', responses.map(function (res) {
          //debug(`Found calendar object with url ${res.href}`);
          return new _model.CalendarObject({
            data: res,
            calendar: calendar,
            url: _url2['default'].resolve(calendar.account.rootUrl, res.href),
            etag: res.props.getetag,
            calendarData: res.props.calendarData
          });
        }));

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.multigetCalendarObjects = multigetCalendarObjects;
var multigetSingleCalendarObject = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var events;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return multigetCalendarObjects(calendar, options);

      case 2:
        events = context$1$0.sent;
        return context$1$0.abrupt('return', events.filter(function (event) {
          // Find the response that corresponds to the parameter collection.
          return (0, _fuzzy_url_equals2['default'])(options.href, event.url);
        })[0]);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.multigetSingleCalendarObject = multigetSingleCalendarObject;
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
var syncCaldavAccount = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(account) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var cals;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        options.loadObjects = false;
        if (!account.calendars) account.calendars = [];

        context$1$0.next = 4;
        return listCalendars(account, options);

      case 4:
        cals = context$1$0.sent;

        cals.filter(function (cal) {
          // Filter the calendars not previously seen.
          return account.calendars.every(function (prev) {
            return !(0, _fuzzy_url_equals2['default'])(prev.url, cal.url);
          });
        }).forEach(function (cal) {
          // Add them to the account's calendar list.
          account.calendars.push(cal);
        });

        options.loadObjects = true;
        context$1$0.next = 9;
        return account.calendars.map(_co2['default'].wrap(regeneratorRuntime.mark(function callee$1$0(cal, index) {
          return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.prev = 0;
                context$2$0.next = 3;
                return syncCalendar(cal, options);

              case 3:
                context$2$0.next = 9;
                break;

              case 5:
                context$2$0.prev = 5;
                context$2$0.t0 = context$2$0['catch'](0);

                debug('Sync calendar ' + cal.displayName + ' failed with ' + context$2$0.t0);
                account.calendars.splice(index, 1);

              case 9:
              case 'end':
                return context$2$0.stop();
            }
          }, callee$1$0, this, [[0, 5]]);
        })));

      case 9:
        return context$1$0.abrupt('return', account);

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

exports.syncCaldavAccount = syncCaldavAccount;
var basicSync = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var sync;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return webdav.isCollectionDirty(calendar, options);

      case 2:
        sync = context$1$0.sent;

        if (sync) {
          context$1$0.next = 6;
          break;
        }

        debug('Local ctag matched remote! No need to sync :).');
        return context$1$0.abrupt('return', calendar);

      case 6:

        debug('ctag changed so we need to fetch stuffs.');
        context$1$0.next = 9;
        return listCalendarObjects(calendar, options);

      case 9:
        calendar.objects = context$1$0.sent;
        return context$1$0.abrupt('return', calendar);

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

var webdavSync = _co2['default'].wrap(regeneratorRuntime.mark(function callee$0$0(calendar, options) {
  var req, result, deletedHrefs, newUpdatedHrefs, results;
  return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        req = request.syncCollection({
          props: [{ name: 'getetag', namespace: ns.DAV }],

          //{ name: 'calendar-data', namespace: ns.CALDAV }
          syncLevel: 1,
          syncToken: calendar.syncToken,
          depth: 1
        });
        context$1$0.next = 3;
        return options.xhr.send(req, calendar.url, {
          sandbox: options.sandbox
        });

      case 3:
        result = context$1$0.sent;
        deletedHrefs = result.responses.filter(function (res) {
          return res.status && res.status.indexOf('404') > -1;
        }).map(function (res) {
          return res.href;
        });
        newUpdatedHrefs = result.responses.filter(function (res) {
          return !res.status || res.status.indexOf('404') === -1;
        }).map(function (res) {
          return res.href;
        });

        req = request.calendarMultiget({
          props: [{ name: 'getetag', namespace: ns.DAV }, { name: 'calendar-data', namespace: ns.CALDAV }],
          depth: 1,
          hrefs: newUpdatedHrefs
        });

        context$1$0.next = 9;
        return options.xhr.send(req, calendar.url, {
          sandbox: options.sandbox
        });

      case 9:
        results = context$1$0.sent;

        results.forEach(function (response) {
          // Find the calendar object that this response corresponds with.
          var calendarObject = calendar.objects.filter(function (object) {
            return (0, _fuzzy_url_equals2['default'])(object.url, response.href);
          })[0];

          if (!calendarObject) {
            // New
            calendar.objects.push(new _model.CalendarObject({
              data: response,
              calendar: calendar,
              url: _url2['default'].resolve(calendar.account.rootUrl, response.href),
              etag: response.props.getetag,
              calendarData: response.props.calendarData
            }));
          } else {
            // Update (perform in place)
            calendarObject.etag = response.props.getetag;
            calendarObject.calendarData = response.props.calendarData;
          }
        });

        // Apply deleted
        calendar.objects = calendar.objects.filter(function (object) {
          return !deletedHrefs.some(function (del) {
            return (0, _fuzzy_url_equals2['default'])(object.url, del);
          });
        });

        // Update token
        calendar.syncToken = result.syncToken;
        return context$1$0.abrupt('return', calendar);

      case 14:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}));

// First query to get list of etags

// Results contains new, modified or deleted objects.
// Detect deleted objects as objects with 'null' calendarData.