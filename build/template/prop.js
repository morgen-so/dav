"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = prop;

var ns = _interopRequireWildcard(require("../namespace"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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