const fuzzyUrlEquals = require('../lib/fuzzy_url_equals').default;

describe('fuzzyUrlEquals', function () {
  test('should return true for equal URLs', function () {
    expect(fuzzyUrlEquals('http://example.com', 'http://example.com')).toBe(
      true
    );

    expect(fuzzyUrlEquals('http://example.com', 'http://example.com/')).toBe(
      true
    );

    expect(
      fuzzyUrlEquals(
        'http://example.com/test@morgen.so',
        'http://example.com/test%40morgen.so'
      )
    ).toBe(true);
  });
});
