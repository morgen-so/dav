/**
 * Encoding/decoding of URLs was removed cause there is no way to
 * make sure encode(decode(url)) === url for each of the following URLs.
 * This is necessary to ensure that we use the same exact href as originally
 * provided by the server when querying for data.
 *
 * This test file is empty but is left here as a reminder that the encoding/decoding
 * of URLs is not a good idea. If encoding/decoding is added back, it should
 * pass the test encode(decode(url)) === url for each of the following URLs.
 */

const testHrefs = [
  // https://linear.app/morgen/issue/MOR-1642/icloud-400-error
  '/17363831/calendars/ADE37349-97D2-462F-B2F9-894D7706401D/wwwgartnercom-en-webinarscommId%3D539334%26channelId%3D17810%26srcId%3D1-4582955171%26ref%3Dbtem%26.ics',
  '/299087925/calendars/1E40C9BC-56BA-4A00-8C90-376BD88D5D51/https%3A%252Fwww.gartner.com%252Fen%252Fwebinars%3FcommId%3D539334%26channelId%3D17810%26srcId%3D1-4582955171%26ref%3Dbtem%26.ics',
  // https://linear.app/morgen/issue/MOR-1607/error-connecting-to-daylite
  '/calendars/1000/calendar_category_47001/20180601T093710Z-523642597%40fe800008f4aefffe9bd1%25eth0.ics',
  // Custom test (@ in the component)
  '/299087925/calendars/1E40C9BC-56BA-4A00-8C90-376BD88D5D51/webinars%252Fancona%40test.com%252F123.ics',
  // https://linear.app/morgen/issue/MOR-1009/caldav-href-encoding-issue
  '/caldav/121DQxz7QtyAZvrLLL6V2g==/events/333159b5684440478e4e8fc8881d4827%40zoho.com.ics',
];
