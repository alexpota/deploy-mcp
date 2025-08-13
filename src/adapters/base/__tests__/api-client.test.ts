import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BaseAPIClient, HTTPError } from "../api-client.js";

class TestAPIClient extends BaseAPIClient {
  protected endpoints = {
    test: {
      path: "test",
      method: "GET" as const,
      docsUrl: "https://example.com/docs",
      description: "Test endpoint",
    },
    post: {
      path: "test/post",
      method: "POST" as const,
      docsUrl: "https://example.com/docs/post",
      description: "POST endpoint",
    },
  };

  async testRequest() {
    return this.request(this.endpoints.test);
  }

  async testRequestWithOptions(options: any) {
    return this.request(this.endpoints.test, options);
  }

  async testPostRequest(body: any) {
    return this.request(this.endpoints.post, { body });
  }
}

describe("BaseAPIClient", () => {
  let client: TestAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    client = new TestAPIClient({
      baseUrl: "https://api.example.com",
      timeout: 5000,
      retry: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make successful API request", async () => {
    const mockResponse = { data: "test" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockResponse),
    });

    const result = await client.testRequest();

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalled();
  });

  it("should pass headers and options", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    });

    await client.testRequestWithOptions({
      headers: {
        Authorization: "Bearer token123",
      },
      searchParams: {
        limit: 10,
      },
    });

    expect(fetch).toHaveBeenCalled();
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url.toString()).toContain("limit=10");
    expect(options.headers.get("Authorization")).toBe("Bearer token123");
  });

  it("should handle HTTP errors properly", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "",
    });

    try {
      await client.testRequest();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("API request failed for test");
      expect(error.message).toContain("See docs: https://example.com/docs");
      expect(error.cause).toBeInstanceOf(HTTPError);
    }
  });

  it("should retry on network errors", async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        throw new Error("Network error");
      }
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify({ retried: true }),
      });
    });

    const result = await client.testRequest();
    expect(result).toEqual({ retried: true });
    expect(callCount).toBe(3);
  });

  it("should not retry on 4xx errors", async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "",
      });
    });

    try {
      await client.testRequest();
      expect.fail("Should have thrown an error");
    } catch {
      expect(callCount).toBe(1);
    }
  });

  it("should handle request deduplication for GET requests", async () => {
    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation(() => {
      fetchCallCount++;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            text: async () => JSON.stringify({ count: fetchCallCount }),
          });
        }, 10);
      });
    });

    const [result1, result2] = await Promise.all([
      client.testRequest(),
      client.testRequest(),
    ]);

    expect(result1).toEqual(result2);
    expect(fetchCallCount).toBe(1);
  });

  it("should not deduplicate POST requests", async () => {
    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation(() => {
      fetchCallCount++;
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify({ count: fetchCallCount }),
      });
    });

    await Promise.all([
      client.testPostRequest({ data: 1 }),
      client.testPostRequest({ data: 2 }),
    ]);

    expect(fetchCallCount).toBe(2);
  });

  it("should handle empty responses", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => "",
    });

    const result = await client.testRequest();
    expect(result).toEqual({});
  });

  it("should handle invalid JSON responses", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => "not json",
    });

    try {
      await client.testRequest();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // The error is now wrapped with enhanced message
      expect(error.message).toContain("API request failed for test");
      // The actual error message includes the invalid JSON parsing error
      expect(error.message).toContain("Invalid JSON response");
    }
  });
});
