import filter from './filter';
import prop from './prop';

export default function calendarQuery(object) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <c:calendar-query xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:d="DAV:">
    <d:prop>
      ${object.props.map(prop).join('')}
    </d:prop>
    <c:filter>
      ${object.filters.map(filter).join('')}
    </c:filter>
    ${object.timezone ? '<c:timezone>' + object.timezone + '</c:timezone>' : ''}
  </c:calendar-query>`;
}
