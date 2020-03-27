"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = syncCollection;

var _prop = _interopRequireDefault(require("./prop"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function syncCollection(object) {
  return "<d:sync-collection xmlns:c=\"urn:ietf:params:xml:ns:caldav\"\n                     xmlns:card=\"urn:ietf:params:xml:ns:carddav\"\n                     xmlns:d=\"DAV:\">\n    <d:sync-level>".concat(object.syncLevel, "</d:sync-level>\n    <d:sync-token>").concat(object.syncToken, "</d:sync-token>\n    <d:prop>\n      ").concat(object.props.map(_prop["default"]), "\n    </d:prop>\n  </d:sync-collection>");
}