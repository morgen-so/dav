import {Base64} from "js-base64"
const debug = require('./debug').default('dav:xmlhttprequest');

const DEFAULT_TIMEOUT = 45000;

/**
 * @fileoverview Promise wrapper around native xhr api.
 */
export default class XMLHttpRequestWrapper {
  constructor() {
    this.sandbox = null;
    this._url = null;
    this._options = null;
    this._response = null;
    this._responseText = null;
    this._timeout = DEFAULT_TIMEOUT;
    this._abortController = new AbortController();
  }

  get status() {
    return this._response ? this._response.status : null;
  }

  get responseText() {
    return this._responseText;
  }

  get response() {
    return this._response;
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(ms) {
    this._timeout = ms;
  }

  get responseType() {
    return this.getResponseHeader('Content-Type');
  }

  get readyState() {
    if (!this._options) return 0;
    // UNSENT
    else if (this._response) return 4;
    // DONE
    else return 1; // OPENED
  }

  abort() {
    this._abortController.abort();
  }

  getResponseHeader(headerName) {
    return this._response
      ? this._response.headers[headerName.toLowerCase()]
      : null;
  }

  setRequestHeader(header, value) {
    if (!this._options)
      throw new Error(
        'Request must be initialized with open() before setting headers'
      );
    if (!this._options.headers) this._options.headers = {};
    this._options.headers[header] = value;
  }

  open(method, url, async, user, password, followRedirect = true) {
    this._responseText = null;
    this._response = null;
    this._url = url;
    this._options = {
      method,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'minetime/request',
      },
      redirect: followRedirect ? 'follow' : 'manual',
      credentials: 'omit',
      signal: this._abortController.signal,
    };

    // Set Authorization request header
    if (user) {
      const credentialsStr = user + ':' + (password || '');
      const authHeader = `Basic ${Base64.encode(credentialsStr)}`;
      this.setRequestHeader('Authorization', authHeader);
    }
  }

  send(data) {
    debug(
      `Sending request (${this._options.method}) to ${this._url} with data: ${data}`
    );
    if (this.sandbox) this.sandbox.add(this);
    if (data) this._options.body = data;
    return new Promise(async (resolve, reject) => {
      // Abort request after timer expires
      const timeoutId = setTimeout(() => this.abort(), this._timeout);
      try {
        // Invoke Fetch API
        const response = await fetch(this._url, this._options);
        this._response = response;
        clearTimeout(timeoutId);

        // Get response body
        const blob = await response.blob();
        const responseText = await blob.text();

        // Check status
        if (response.status < 200 || response.status >= 400) {
          let error = new Error(
            `Bad status ${response.status}: ${responseText}`
          );
          error.code = response.status;
          return reject(error);
        }
        // Ok
        this._responseText = responseText;
        return resolve(responseText);
      } catch (err) {
        clearTimeout(timeoutId);
        return reject(err);
      }
    });
  }
}
