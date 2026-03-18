import { shorten, resolve } from "../src/services/url.service";

describe("shorten", () => {
  describe("유효한 URL", () => {
    test("http URL을 허용한다", () => {
      expect(() => shorten("http://example.com")).not.toThrow();
    });

    test("https URL을 허용한다", () => {
      expect(() => shorten("https://example.com")).not.toThrow();
    });

    test("경로가 있는 URL을 허용한다", () => {
      expect(() => shorten("https://example.com/path/to/page")).not.toThrow();
    });

    test("쿼리스트링이 있는 URL을 허용한다", () => {
      expect(() => shorten("https://example.com?foo=bar")).not.toThrow();
    });
  });

  describe("유효하지 않은 URL", () => {
    test("프로토콜이 없으면 'Invalid URL' 에러를 던진다", () => {
      expect(() => shorten("example.com")).toThrow("Invalid URL");
    });

    test("빈 문자열이면 'Invalid URL' 에러를 던진다", () => {
      expect(() => shorten("")).toThrow("Invalid URL");
    });

    test("ftp:// 프로토콜은 'Invalid URL' 에러를 던진다", () => {
      expect(() => shorten("ftp://example.com")).toThrow("Invalid URL");
    });

    test("형식이 잘못된 URL은 'Invalid URL' 에러를 던진다", () => {
      expect(() => shorten("not a url")).toThrow("Invalid URL");
    });
  });

  describe("반환값", () => {
    test("단축 코드 문자열을 반환한다", () => {
      const code = shorten("https://example.com/return-value");
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    });

    test("단축 코드는 6자리 영숫자로 구성된다", () => {
      const code = shorten("https://example.com/format-test");
      expect(code).toMatch(/^[a-zA-Z0-9]{6}$/);
    });

    test("같은 URL을 여러 번 단축하면 항상 같은 코드를 반환한다", () => {
      const url = "https://example.com/idempotent-test";
      expect(shorten(url)).toBe(shorten(url));
    });

    test("다른 URL은 다른 코드를 반환한다", () => {
      const code1 = shorten("https://example.com/url-a");
      const code2 = shorten("https://example.com/url-b");
      expect(code1).not.toBe(code2);
    });
  });
});

describe("resolve", () => {
  test("단축 코드로 원래 URL을 반환한다", () => {
    const url = "https://example.com/resolve-test";
    const code = shorten(url);
    expect(resolve(code)).toBe(url);
  });

  test("존재하지 않는 코드는 null을 반환한다", () => {
    expect(resolve("unknown")).toBeNull();
  });
});
