/**
 * Porting of https://github.com/devfans/digest-fetch by Stefan Liu
 * Adapted by Morgen AG. Original licence below.
 *
 *
 * MIT License
 *
 * Copyright (c) 2018 Stefan Liu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const canRequire = typeof require == 'function';
if (typeof fetch !== 'function' && canRequire)
  var fetch = require('node-fetch');
const md5 = require('md5');
const base64 = require('js-base64');
const { use } = require('chai');

const supported_algorithms = ['MD5', 'MD5-sess'];

const parse = (raw, field, trim = true) => {
  const regex = new RegExp(`${field}=("[^"]*"|[^,]*)`, 'i');
  const match = regex.exec(raw);
  if (match) return trim ? match[1].replace(/[\s"]/g, '') : match[1];
  return null;
};

class DigestClient {
  constructor(user, password, options = {}) {
    this.user = user;
    this.password = password;
    this.nonceRaw = 'abcdef0123456789';
    this.logger = options.logger;
    this.precomputedHash = options.precomputedHash;
    this.mechanism = options.mechanism;

    let algorithm = options.algorithm || 'MD5';
    if (!supported_algorithms.includes(algorithm)) {
      if (this.logger)
        this.logger.warn(
          `Unsupported algorithm ${algorithm}, will try with MD5`
        );
      algorithm = 'MD5';
    }
    this.digest = { nc: 0, algorithm, realm: '' };
    this.hasAuth = false;
    const _cnonceSize = parseInt(options.cnonceSize);
    this.cnonceSize = isNaN(_cnonceSize) ? 32 : _cnonceSize; // cnonce length 32 as default

    // Custom authentication failure code for avoiding browser prompt:
    // https://stackoverflow.com/questions/9859627/how-to-prevent-browser-to-invoke-basic-auth-popup-and-handle-401-error-using-jqu
    this.statusCode = options.statusCode;
  }

  async fetch(url, options = {}) {
    const mechanism = this.mechanism;
    if (mechanism) console.log(`Using ${mechanism} auth for ${url}.`);
    else console.log(`No mechanism specified for ${url}. Using basic auth.`);
    const resp = await fetch(
      url,
      mechanism === 'digest'
        ? this.addAuth(url, options)
        : this.addBasicAuth(options) // basic is the default, when no mechanism is provided
    );
    if (
      resp.status === 401 ||
      (resp.status === this.statusCode && this.statusCode)
    ) {
      if (!mechanism) {
        // If `mechanism` is not specific, we are using basic auth,
        // so we can fallback and try digest.
        this.mechanism = 'digest';
        return this.fetch(url, options);
      } else if (mechanism === 'basic') {
        // Notice that we don't try digest if "basic" is explicitly requested.
        return resp;
      }
      // Else, if we are already using digest, we might need to respond to www-authenticate
      this.hasAuth = false;
      await this.parseAuth(resp.headers.get('www-authenticate'));
      if (this.hasAuth) {
        const respFinal = await fetch(url, this.addAuth(url, options));
        if (respFinal.status === 401 || respFinal.status === this.statusCode) {
          this.hasAuth = false;
        } else {
          this.digest.nc++;
        }
        return respFinal;
      }
    } else this.digest.nc++;
    return resp;
  }

  addBasicAuth(options = {}) {
    let _options = {};
    if (typeof options.factory == 'function') {
      _options = options.factory();
    } else {
      _options = options;
    }

    const auth = 'Basic ' + base64.encode(this.user + ':' + this.password);
    _options.headers = _options.headers || {};
    _options.headers.Authorization = auth;
    if (typeof _options.headers.set == 'function') {
      _options.headers.set('Authorization', auth);
    }

    if (this.logger) this.logger.debug(options);
    return _options;
  }

  static computeHash(user, realm, password) {
    return md5(`${user}:${realm}:${password}`);
  }

  addAuth(url, options) {
    if (typeof options.factory == 'function') options = options.factory();
    if (!this.hasAuth) return options;
    if (this.logger) this.logger.info(`requesting with auth carried`);

    const isRequest = typeof url === 'object' && typeof url.url === 'string';
    const urlStr = isRequest ? url.url : url;
    const _url = urlStr.replace('//', '');
    const uri = _url.indexOf('/') === -1 ? '/' : _url.slice(_url.indexOf('/'));
    const method = options.method ? options.method.toUpperCase() : 'GET';

    let ha1 = this.precomputedHash
      ? this.password
      : DigestClient.computeHash(this.user, this.digest.realm, this.password);
    if (this.digest.algorithm === 'MD5-sess') {
      ha1 = md5(`${ha1}:${this.digest.nonce}:${this.digest.cnonce}`);
    }

    // optional MD5(entityBody) for 'auth-int'
    let _ha2 = '';
    if (this.digest.qop === 'auth-int') {
      // not implemented for auth-int
      if (this.logger)
        this.logger.warn('Sorry, auth-int is not implemented in this plugin');
      // const entityBody = xxx
      // _ha2 = ':' + md5(entityBody)
    }
    const ha2 = md5(`${method}:${uri}${_ha2}`);

    const ncString = ('00000000' + this.digest.nc).slice(-8);

    let _response = `${ha1}:${this.digest.nonce}:${ncString}:${this.digest.cnonce}:${this.digest.qop}:${ha2}`;
    if (!this.digest.qop) _response = `${ha1}:${this.digest.nonce}:${ha2}`;
    const response = md5(_response);

    const opaqueString =
      this.digest.opaque !== null ? `opaque="${this.digest.opaque}",` : '';
    const qopString = this.digest.qop ? `qop="${this.digest.qop}",` : '';
    const digest = `${this.digest.scheme} username="${this.user}",realm="${this.digest.realm}",\
nonce="${this.digest.nonce}",uri="${uri}",${opaqueString}${qopString}\
algorithm="${this.digest.algorithm}",response="${response}",nc=${ncString},cnonce="${this.digest.cnonce}"`;
    options.headers = options.headers || {};
    options.headers.Authorization = digest;
    if (typeof options.headers.set == 'function') {
      options.headers.set('Authorization', digest);
    }

    if (this.logger) this.logger.debug(options);

    // const {factory, ..._options} = options
    const _options = {};
    Object.assign(_options, options);
    delete _options.factory;
    return _options;
  }

  async parseAuth(h) {
    this.lastAuth = h;

    if (!h || h.length < 5) {
      this.hasAuth = false;
      return;
    }

    this.hasAuth = true;

    this.digest.scheme = h.split(/\s/)[0];

    this.digest.realm = (parse(h, 'realm', false) || '').replace(/["]/g, '');

    this.digest.qop = this.parseQop(h);

    this.digest.opaque = parse(h, 'opaque');

    this.digest.nonce = parse(h, 'nonce') || '';

    this.digest.cnonce = this.makeNonce();
    this.digest.nc++;
  }

  parseQop(rawAuth) {
    // Following https://en.wikipedia.org/wiki/Digest_access_authentication
    // to parse valid qop
    // Samples
    // : qop="auth,auth-init",realm=
    // : qop=auth,realm=
    const _qop = parse(rawAuth, 'qop');

    if (_qop !== null) {
      const qops = _qop.split(',');
      if (qops.includes('auth')) return 'auth';
      else if (qops.includes('auth-int')) return 'auth-int';
    }
    // when not specified
    return null;
  }

  makeNonce() {
    let uid = '';
    for (let i = 0; i < this.cnonceSize; ++i) {
      uid += this.nonceRaw[Math.floor(Math.random() * this.nonceRaw.length)];
    }
    return uid;
  }

  static parse(...args) {
    return parse(...args);
  }
}

if (typeof window === 'object') window.DigestFetch = DigestClient;
module.exports = DigestClient;
