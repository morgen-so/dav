"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSandbox = createSandbox;
exports.Sandbox = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var debug = require('./debug')('dav:sandbox');

var Sandbox = /*#__PURE__*/function () {
  function Sandbox() {
    _classCallCheck(this, Sandbox);

    this.requestList = [];
  }

  _createClass(Sandbox, [{
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