"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createObject = createObject;
exports.updateObject = updateObject;
exports.deleteObject = deleteObject;
exports.syncCollection = syncCollection;
exports.isCollectionDirty = exports.supportedReportSet = void 0;

var _co = _interopRequireDefault(require("co"));

var _fuzzy_url_equals = _interopRequireDefault(require("./fuzzy_url_equals"));

var ns = _interopRequireWildcard(require("./namespace"));

var request = _interopRequireWildcard(require("./request"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var debug = require('./debug')('dav:webdav');
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


var supportedReportSet = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee(collection, options) {
  var req, response;
  return regeneratorRuntime.wrap(function _callee$(_context) {
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

var isCollectionDirty = _co["default"].wrap( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(collection, options) {
  var req, responses, response;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
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