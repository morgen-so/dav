const debug = require('./debug')('dav:xmlhttprequest');
const request = require('request');

/**
 * @fileoverview Promise wrapper around native xhr api.
 */
export default class XMLHttpRequestWrapper {
  constructor() {
		this.sandbox = null;
		this._options = null;
		this._request = null;
		this._response = null;
		this._responseText = null;
		this._defaultTimeout = 15000;
	}

  get status() {
		return this._response ? this._response.statusCode : null;
  }

	get responseText() {
		return this._responseText;
	}

	get response() {
		throw new Error("Not implemented")
	}

	get timeout() {
  	return this._defaultTimeout;
	}

	set timeout(ms) {
		if (this._options) this._options.timeout = ms;
	}

	get responseType() {
  	return this.getResponseHeader("Content-Type")
	}

	get readyState() {
  	if (!this._options) return 0; // UNSENT
  	else if (this._response) return 4; // DONE
  	else return 1; // OPENED
	}

  abort() {
    if (this._request) this._request.abort();
  }

  getResponseHeader(headerName) {
    return this._response ? this._response.headers[headerName.toLowerCase()] : null;
  }

	setRequestHeader(header, value) {
		if (!this._options) throw new Error("Request must be initialized with open() before setting headers");
		if (!this._options.headers) this._options.headers = {};
		this._options.headers[header] = value;
	}

  open(method, url, async, user, password) {
    this._responseText = null;
    this._response = null;
    this._request = null;
    this._options = {
      method: method,
      url: url,
			auth: user ? {
				user: user,
				pass: password,
				sendImmediately: false
			} : undefined,
			timeout: this._defaultTimeout
    };
  }



  send(data) {
    debug(`Sending request data: ${data}`);
    if (this.sandbox) this.sandbox.add(this);
    if (data) this._options.body = data;
    return new Promise((resolve, reject) => {
      this._request = request(this._options, (error, response, body) => {
				this._response = response;
				if (error) return reject(error);
				if (response.statusCode < 200 || response.statusCode >= 400) {
					let error = new Error(`Bad status ${response.statusCode}: ${body}`);
					error.code = response.statusCode;
					return reject(error);
				}
				// Ok
        this._responseText = body;
				return resolve(body);
      });
    });
  }
}
