import prop from './prop';

export default function syncCollection(object) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <d:sync-collection xmlns:c="urn:ietf:params:xml:ns:caldav"
                     xmlns:card="urn:ietf:params:xml:ns:carddav"
                     xmlns:d="DAV:">
    <d:sync-level>${object.syncLevel}</d:sync-level>
    <d:sync-token>${object.syncToken}</d:sync-token>
    <d:prop>
      ${object.props.map(prop).join('')}
    </d:prop>
  </d:sync-collection>`;
}
