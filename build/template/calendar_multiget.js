'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = calendarMultiget;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _prop = require('./prop');

var _prop2 = _interopRequireDefault(_prop);

var _href = require('./href');

var _href2 = _interopRequireDefault(_href);

function calendarMultiget(object) {
  return '<c:calendar-multiget xmlns:d="DAV:"\n                               xmlns:c="urn:ietf:params:xml:ns:caldav">\n    <d:prop>\n      ' + object.props.map(_prop2['default']) + '\n    </d:prop>\n    ' + object.hrefs.map(_href2['default']) + '\n  </c:calendar-multiget>';
}

module.exports = exports['default'];