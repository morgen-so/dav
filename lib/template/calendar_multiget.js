import prop from './prop';
import href from './href';

export default function calendarMultiget(object) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <c:calendar-multiget xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:prop>
      ${object.props.map(prop).join('')}
    </d:prop>
    ${object.hrefs.map(href).join('')}
  </c:calendar-multiget>`;
}
