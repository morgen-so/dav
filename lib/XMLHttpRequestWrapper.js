import DigestFetch from './digestFetch';
const debug = require('./debug').default('dav:xmlhttprequest');

const canRequire = typeof require == 'function';
if (typeof fetch !== 'function' && canRequire)
  var fetch = require('node-fetch');

const DEFAULT_TIMEOUT = 5 * 60 * 1000;

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
    this._digestFetch = null;
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

  open(method, url, async, user, password, options) {
    this._responseText = null;
    this._response = null;
    this._url = url;
    const { mechanism, userAgent, followRedirect = true } = options || {};
    this._options = {
      method,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': userAgent ?? 'minetime/request',
      },
      redirect: followRedirect ? 'follow' : 'manual',
      credentials: 'omit',
      signal: this._abortController.signal,
    };
    if (user) {
      // This is always the case for basic/digest auth
      this._digestFetch = new DigestFetch(user, password, { mechanism });
    } else {
      // OAuth
      this._digestFetch = { fetch: (...args) => fetch(...args) };
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
        const response = await this._digestFetch.fetch(
          this._url,
          this._options
        );
        this._response = response;
        clearTimeout(timeoutId);

        // Get response body
        const blob = await response.blob();
        const responseText = await blob.text();

        // Check status
        if (response.status < 200 || response.status >= 400) {
          // Construct error object
          let hostnameStr = '';
          try {
            hostnameStr = new URL(this._url).hostname;
          } catch (err) {
            console.error('Error parsing hostname', err);
            hostnameStr = 'unknown';
          }
          const error = new Error(
            `CalDAV request failed (status code: ${response.status}, status text: ${response.statusText}, provider: ${hostnameStr})`
          );
          error.code = response.status;

          // Debug logs
          console.log('Request body of failed request:\n', data);
          console.log(
            'Request headers of failed request:\n',
            this._options?.headers
          );
          console.log(
            'Response body of failed request:\n',
            responseText ? responseText : 'empty'
          );

          // Reject promise
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
