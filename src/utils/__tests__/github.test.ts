import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateRepository, validateParams } from "../github.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("GitHub Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateRepository", () => {
    it("should return exists: true, isPublic: true for public repository", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "test-repo",
          full_name: "user/test-repo",
          private: false,
        }),
      });

      const result = await validateRepository("user", "test-repo");

      expect(result).toEqual({
        exists: true,
        isPublic: true,
        name: "test-repo",
        fullName: "user/test-repo",
      });
      expect(fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/user/test-repo",
        {
          headers: {
            "User-Agent": "deploy-mcp/1.0",
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
    });

    it("should return exists: true, isPublic: false for private repository", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "private-repo",
          full_name: "user/private-repo",
          private: true,
        }),
      });

      const result = await validateRepository("user", "private-repo");

      expect(result).toEqual({
        exists: true,
        isPublic: false,
        name: "private-repo",
        fullName: "user/private-repo",
      });
    });

    it("should return exists: false for non-existent repository", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await validateRepository("user", "nonexistent");

      expect(result).toEqual({
        exists: false,
        isPublic: false,
      });
    });

    it("should handle network errors gracefully", async () => {
      (fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const result = await validateRepository("user", "test-repo");

      expect(result).toEqual({
        exists: false,
        isPublic: false,
      });
    });

    it("should handle GitHub API rate limiting", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const result = await validateRepository("user", "test-repo");

      expect(result).toEqual({
        exists: false,
        isPublic: false,
      });
    });

    it("should handle malformed GitHub API response", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await validateRepository("user", "test-repo");

      expect(result).toEqual({
        exists: false,
        isPublic: false,
      });
    });
  });

  describe("validateParams", () => {
    it("should return true for valid parameters", () => {
      expect(validateParams("validuser", "validrepo", "vercel")).toBe(true);
      expect(validateParams("user123", "repo-name", "netlify")).toBe(true);
      expect(validateParams("user.name", "repo_name", "railway")).toBe(true);
    });

    it("should return false for invalid user names", () => {
      expect(validateParams("user@domain", "repo", "vercel")).toBe(false);
      expect(validateParams("user space", "repo", "vercel")).toBe(false);
      expect(validateParams("user#hash", "repo", "vercel")).toBe(false);
      expect(validateParams("", "repo", "vercel")).toBe(false);
    });

    it("should return false for invalid repository names", () => {
      expect(validateParams("user", "repo@domain", "vercel")).toBe(false);
      expect(validateParams("user", "repo space", "vercel")).toBe(false);
      expect(validateParams("user", "repo#hash", "vercel")).toBe(false);
      expect(validateParams("user", "", "vercel")).toBe(false);
    });

    it("should return false for invalid platforms", () => {
      expect(validateParams("user", "repo", "invalid")).toBe(false);
      expect(validateParams("user", "repo", "heroku")).toBe(false);
      expect(validateParams("user", "repo", "")).toBe(false);
    });

    it("should accept all supported platforms", () => {
      expect(validateParams("user", "repo", "vercel")).toBe(true);
      expect(validateParams("user", "repo", "netlify")).toBe(true);
      expect(validateParams("user", "repo", "railway")).toBe(true);
    });

    it("should handle edge cases", () => {
      // Valid characters at boundaries
      expect(validateParams("user-", "repo_", "vercel")).toBe(true);
      expect(validateParams("user.", "repo.", "vercel")).toBe(true);

      // Single character names (should be valid)
      expect(validateParams("a", "b", "vercel")).toBe(true);

      // Mixed valid characters
      expect(validateParams("user123._-", "repo123._-", "vercel")).toBe(true);
    });
  });
});
