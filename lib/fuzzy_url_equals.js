'use strict';
export default function fuzzyUrlEquals(one, other) {
  if (one === other) return true;
  try {
    one = fullyDecodeURI(one);
    other = fullyDecodeURI(other);
    return fuzzyIncludes(one, other) || fuzzyIncludes(other, one);
  }
  catch (e) {
    console.log(`Could not decode URLs ${one} or ${other}`)
    return false;
  }
}

function isEncoded(uri) {
  uri = uri || '';
  try {
    return uri !== decodeURIComponent(uri);
  }
  catch (e) {
    // If the URL cannot be decoded, it is probably not encoded
    // For example if the URL is 'http://example.com/%ZZ'
    // decodeURIComponent throws an error
    return false;
  }
}

function fullyDecodeURI(uri) {
  while (isEncoded(uri)) {
    uri = decodeURIComponent(uri);
  }

  return uri;
}

function fuzzyIncludes(one, other) {
  return (
    one.indexOf(other) !== -1 ||
    (other.charAt(other.length - 1) === '/' &&
      one.indexOf(other.slice(0, -1)) !== -1)
  );
}
