const fs = require('fs');
const { multistatus, beautifyXML } = require('../lib/parser');
const { getProps, mergeProps } = require('../lib/request');

describe('Parser', function () {
  test('beautifyXML should not destroy or add information', async function () {
    // Read xml from file
    let xml = fs.readFileSync('./test/unit/data/generic_xml.xml', 'utf8');
    const clean = beautifyXML(xml);
    expect(clean).toEqual(xml);
  });

  test('beautifyXML should not destroy or add information (2)', async function () {
    // Read xml from file
    let xml = fs.readFileSync('./test/unit/data/generic_xml_b.xml', 'utf8');
    const clean = beautifyXML(xml);
    expect(clean).toEqual(xml);
  });

  test('should parse a proxies response from SoGO', async function () {
    // Read xml from file
    let xml = fs.readFileSync(
      './test/unit/data/propfind_proxies_sogo.xml',
      'utf8'
    );

    // The code below reproduces what is happening once the response is received.
    // Unfortunately it is not easy to test the code directly.
    let responses = multistatus(xml).response.map((res) => {
      return {
        href: res.href,
        props: getProps(res.propstat),
        status: res.status,
      };
    });

    // Merge the props.
    let props = mergeProps(responses.map((res) => res.props));
    const propNames = ['calendarProxyReadFor', 'calendarProxyWriteFor'];
    const userProxies = [];
    propNames.forEach((prop) => {
      if (props[prop]) {
        props[prop]
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length)
          .map((s) => userProxies.push(String(s)));
      }
    });
    expect(userProxies.length).toEqual(9);
  });
});
