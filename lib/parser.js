import camelize from './camelize';
import xmlFormat from 'xml-formatter';

let debug = require('./debug').default('dav:parser');

let DOMParser;
if (typeof self !== 'undefined' && 'DOMParser' in self) {
  // browser main thread
  console.log('Using browser DOMParser');
  DOMParser = self.DOMParser;
} else {
  // nodejs or web worker
  console.log('Using xmldom DOMParser');
  DOMParser = require('@xmldom/xmldom').DOMParser;
}

/**
 * Add beautify stage to XML parsing to fix an issue with DOMParser.
 * See https://github.com/morgen-so/minetime/issues/2539
 * @param xml
 * @returns {*}
 */
export function beautifyXML(xml) {
  try {
    const clean = xmlFormat(xml, {
      indentation: '  ',
      lineSeparator: '\n',
      collapseContent: true,
    });
    debug(`beautify input:\n${xml}\noutput:\n${clean}\n`);
    return clean;
  } catch (e) {
    debug(`Error parsing XML: ${e}`);
    return xml;
  }
}

export function multistatus(string) {
  let parser = new DOMParser();
  let xmlClean = beautifyXML(string);
  let doc = parser.parseFromString(xmlClean, 'text/xml');
  let result = traverse.multistatus(child(doc, 'multistatus'));
  debug(`input:\n${string}\noutput:\n${JSON.stringify(result)}\n`);
  return result;
}

let traverse = {
  // { response: [x, y, z] }
  multistatus: (node) => complex(node, { response: true }),

  // { propstat: [x, y, z] }
  response: (node) =>
    complex(node, { propstat: true, href: false, status: false }),

  // { prop: x }
  propstat: (node) => complex(node, { prop: false }),

  // {
  //   resourcetype: x
  //   supportedCalendarComponentSet: y,
  //   supportedReportSet: z
  // }
  prop: (node) => {
    return complex(node, {
      resourcetype: false,
      supportedCalendarComponentSet: false,
      currentUserPrivilegeSet: false,
      supportedReportSet: false,
      currentUserPrincipal: false,
      calendarUserAddressSet: false,
    });
  },

  resourcetype: (node) => {
    return childNodes(node).map((childNode) => childNode.localName);
  },

  // [x, y, z]
  supportedCalendarComponentSet: (node) =>
    complex(node, { comp: true }, 'comp'),

  // [x, y, z]
  currentUserPrivilegeSet: (node) => {
    return complex(node, { privilege: true }, 'privilege');
  },

  // [x, y, z]
  calendarUserAddressSet: (node) => complex(node, { href: true }, 'href'),

  // [x, y, z]
  supportedReportSet: (node) => {
    return complex(node, { supportedReport: true }, 'supportedReport');
  },

  comp: (node) => node.getAttribute('name'),

  // x
  supportedReport: (node) => complex(node, { report: false }, 'report'),

  report: (node) => {
    return childNodes(node).map((childNode) => childNode.localName);
  },

  privilege: (node) => {
    return childNodes(node).map((childNode) => childNode.localName);
  },

  href: (node) => {
    return decodeURIComponent(childNodes(node)[0].nodeValue);
  },

  status: (node) => {
    return decodeURIComponent(childNodes(node)[0].nodeValue);
  },

  currentUserPrincipal: (node) => {
    return complex(node, { href: false }, 'href');
  },
};

function complex(node, childspec, collapse) {
  let result = {};
  for (let key in childspec) {
    if (childspec[key]) {
      // Create array since we're expecting multiple.
      result[key] = [];
    }
  }

  childNodes(node).forEach((childNode) =>
    traverseChild(node, childNode, childspec, result)
  );

  return maybeCollapse(result, childspec, collapse);
}

/**
 * Parse child childNode of node with childspec and write outcome to result.
 */
function traverseChild(node, childNode, childspec, result) {
  if (childNode.nodeType === 3 && /^\s+$/.test(childNode.nodeValue)) {
    // Whitespace... nothing to do.
    return;
  }

  let localName = camelize(childNode.localName, '-');
  if (!(localName in childspec)) {
    debug(
      'Unexpected node of type ' +
        localName +
        ' encountered while ' +
        'parsing ' +
        node.localName +
        ' node!'
    );
    let value = childNode.textContent;
    if (localName in result) {
      if (!Array.isArray(result[localName])) {
        // Since we've already encountered this node type and we haven't yet
        // made an array for it, make an array now.
        result[localName] = [result[localName]];
      }

      result[localName].push(value);
      return;
    }

    // First time we're encountering this node.
    result[localName] = value;
    return;
  }

  let traversal = traverse[localName](childNode);
  if (childspec[localName]) {
    // Expect multiple.
    result[localName].push(traversal);
  } else {
    // Expect single.
    result[localName] = traversal;
  }
}

function maybeCollapse(result, childspec, collapse) {
  if (!collapse) {
    return result;
  }

  if (!childspec[collapse]) {
    return result[collapse];
  }

  // Collapse array.
  return result[collapse].reduce((a, b) => a.concat(b), []);
}

function childNodes(node) {
  let result = node.childNodes;
  if (!Array.isArray(result)) {
    result = Array.prototype.slice.call(result);
  }

  return result;
}

function children(node, localName) {
  return childNodes(node).filter(
    (childNode) => childNode.localName === localName
  );
}

function child(node, localName) {
  return children(node, localName)[0];
}

/**
 * Special utility methods
 */

export function getPreferredEmail(xmlStr) {
  let preferredEmail;
  const NodeDOMParser_ = require('@xmldom/xmldom').DOMParser;
  const parser = new NodeDOMParser_();
  const xmlClean = beautifyXML(xmlStr);
  let doc = parser.parseFromString(xmlClean, 'text/xml');
  const rootElement = child(doc, 'multistatus');
  Object.entries(rootElement._nsMap).findIndex(([key, value]) => {
    const el = key?.length
      ? rootElement.getElementsByTagNameNS(value, 'calendar-user-address-set')
      : rootElement.getElementsByTagName('calendar-user-address-set');
    if (el.length > 0) {
      // Find Node Element with attribute `preferred="1"`
      Array.from(el[0].childNodes).findIndex((node) => {
        if (node.attributes && node.attributes.getNamedItem('preferred')) {
          debug(`Found preferred email: ${node.textContent}`);
          preferredEmail = node.textContent;
          return true;
        }
      });
    }
    return el.length > 0;
  });
  return preferredEmail;
}
