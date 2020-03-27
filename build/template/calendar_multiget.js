"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calendarMultiget;

var _prop = _interopRequireDefault(require("./prop"));

var _href = _interopRequireDefault(require("./href"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function calendarMultiget(object) {
  return "<c:calendar-multiget xmlns:d=\"DAV:\"\n                               xmlns:c=\"urn:ietf:params:xml:ns:caldav\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n    ").concat(object.hrefs.map(_href["default"]), "\n  </c:calendar-multiget>");
}