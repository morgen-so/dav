"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = propfind;

var _prop = _interopRequireDefault(require("./prop"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function propfind(object) {
  return "<d:propfind xmlns:c=\"urn:ietf:params:xml:ns:caldav\"\n              xmlns:card=\"urn:ietf:params:xml:ns:carddav\"\n              xmlns:cs=\"http://calendarserver.org/ns/\"\n              xmlns:x=\"http://apple.com/ns/ical/\"\n              xmlns:d=\"DAV:\">\n    <d:prop>\n      ".concat(object.props.map(_prop["default"]), "\n    </d:prop>\n  </d:propfind>");
}