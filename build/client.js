"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;

var _url = _interopRequireDefault(require("url"));

var accounts = _interopRequireWildcard(require("./accounts"));

var calendars = _interopRequireWildcard(require("./calendars"));

var contacts = _interopRequireWildcard(require("./contacts"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @param {dav.Transport} xhr - request sender.
 *
 * Options:
 *
 *   (String) baseUrl - root url to resolve relative request urls with.
 */
var Client = /*#__PURE__*/function () {
  function Client(xhr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Client);

    this.xhr = xhr;
    Object.assign(this, options); // Expose internal modules for unit testing

    this._accounts = accounts;
    this._calendars = calendars;
    this._contacts = contacts;
  }
  /**
   * @param {dav.Request} req - dav request.
   * @param {String} uri - where to send request.
   * @return {Promise} a promise that will be resolved with an xhr request
   *     after its readyState is 4 or the result of applying an optional
   *     request `transformResponse` function to the xhr object after its
   *     readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   */


  _createClass(Client, [{
    key: "send",
    value: function send(req, uri, options) {
      if (this.baseUrl) {
        var urlObj = _url["default"].parse(uri);

        uri = _url["default"].resolve(this.baseUrl, urlObj.path);
      }

      return this.xhr.send(req, uri, options);
    }
  }, {
    key: "createAccount",
    value: function createAccount() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options.xhr = options.xhr || this.xhr;
      return accounts.createAccount(options);
    }
  }, {
    key: "getCalendar",
    value: function getCalendar(account, calendarUrl) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.getCalendar(account, calendarUrl, options);
    }
  }, {
    key: "createCalendarObject",
    value: function createCalendarObject(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.createCalendarObject(calendar, options);
    }
  }, {
    key: "getCalendarObject",
    value: function getCalendarObject(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.getCalendarObject(calendar, options);
    }
  }, {
    key: "updateCalendarObject",
    value: function updateCalendarObject(calendarObject) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.updateCalendarObject(calendarObject, options);
    }
  }, {
    key: "deleteCalendarObject",
    value: function deleteCalendarObject(calendarObject) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.deleteCalendarObject(calendarObject, options);
    }
  }, {
    key: "syncCalendar",
    value: function syncCalendar(calendar) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.syncCalendar(calendar, options);
    }
  }, {
    key: "syncCaldavAccount",
    value: function syncCaldavAccount(account) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return calendars.syncCaldavAccount(account, options);
    }
  }, {
    key: "createCard",
    value: function createCard(addressBook) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.createCard(addressBook, options);
    }
  }, {
    key: "updateCard",
    value: function updateCard(card) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.updateCard(card, options);
    }
  }, {
    key: "deleteCard",
    value: function deleteCard(card) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.deleteCard(card, options);
    }
  }, {
    key: "syncAddressBook",
    value: function syncAddressBook(addressBook) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.syncAddressBook(addressBook, options);
    }
  }, {
    key: "syncCarddavAccount",
    value: function syncCarddavAccount(account) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options.xhr = options.xhr || this.xhr;
      return contacts.syncCarddavAccount(account, options);
    }
  }]);

  return Client;
}();

exports.Client = Client;