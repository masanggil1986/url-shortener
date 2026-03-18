import { shorten, findByCode } from "../src/services/url.service";
import { prisma } from "../src/lib/prisma";

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    url: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "test-code-123"),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("TEST shorten", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("URL이 빈 문자열이면 'URL is required' 에러를 던진다", async () => {
    await expect(shorten("")).rejects.toThrow("URL is required");
  });

  test("유효하지 않은 URL이면 'Invalid URL' 에러를 던진다", async () => {
    await expect(shorten("not-a-url")).rejects.toThrow("Invalid URL");
  });

  test("http: 프로토콜이 아닌 경우 'Invalid URL' 에러를 던진다", async () => {
    await expect(shorten("ftp://example.com")).rejects.toThrow("Invalid URL");
  });

  test("유효한 URL이면 prisma.url.create를 호출하고 code를 반환한다", async () => {
    (mockPrisma.url.create as jest.Mock).mockResolvedValue({});

    const code = await shorten("https://example.com");

    expect(mockPrisma.url.create).toHaveBeenCalledWith({
      data: { code: "test-code-123", original: "https://example.com" },
    });
    expect(code).toBe("test-code-123");
  });
});

describe("TEST findByCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("존재하는 code면 original URL을 반환한다", async () => {
    (mockPrisma.url.findUnique as jest.Mock).mockResolvedValue({
      code: "test-code-123",
      original: "https://example.com",
    });

    const original = await findByCode("test-code-123");

    expect(mockPrisma.url.findUnique).toHaveBeenCalledWith({
      where: { code: "test-code-123" },
    });
    expect(original).toBe("https://example.com");
  });

  test("존재하지 않는 code면 'URL not found' 에러를 던진다", async () => {
    (mockPrisma.url.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(findByCode("nonexistent")).rejects.toThrow("URL not found");
  });
});
