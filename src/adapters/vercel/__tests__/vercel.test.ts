import { describe, it, expect, beforeEach, vi } from "vitest";
import { VercelAdapter } from "../index.js";
import type { VercelDeployment } from "../types.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("VercelAdapter", () => {
  let adapter: VercelAdapter;

  beforeEach(() => {
    adapter = new VercelAdapter();
    vi.clearAllMocks();
  });

  describe("getLatestDeployment", () => {
    it("should return deployment status for successful deployment", async () => {
      const mockDeployment: VercelDeployment = {
        uid: "test-deployment-id",
        name: "test-project",
        url: "test-project.vercel.app",
        state: "READY",
        ready: 1640995200000,
        createdAt: 1640995100000,
        buildingAt: 1640995150000,
        creator: {
          uid: "user-id",
          username: "testuser",
        },
        target: "production",
        meta: {
          githubCommitSha: "abc123",
          githubCommitMessage: "Test commit",
          githubCommitAuthorName: "Test Author",
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ deployments: [mockDeployment] }),
        json: async () => ({ deployments: [mockDeployment] }),
      });

      const result = await adapter.getLatestDeployment(
        "test-project",
        "test-token"
      );

      expect(result).toEqual({
        id: "test-deployment-id",
        status: "success",
        url: "https://test-project.vercel.app",
        projectName: "test-project",
        platform: "vercel",
        timestamp: new Date(1640995100000).toISOString(),
        duration: 100,
        environment: "production",
        commit: {
          sha: "abc123",
          message: "Test commit",
          author: "Test Author",
        },
      });
    });

    it("should throw error when no token provided", async () => {
      process.env.VERCEL_TOKEN = "";

      await expect(adapter.getLatestDeployment("test-project")).rejects.toThrow(
        "Vercel token required"
      );
    });

    it("should handle API errors gracefully", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Not Found",
      });

      await expect(
        adapter.getLatestDeployment("test-project", "test-token")
      ).rejects.toThrow();
    });
  });

  describe("authenticate", () => {
    it("should return true for valid token", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ user: { uid: "test-user" } }),
        json: async () => ({ user: { uid: "test-user" } }),
      });

      const result = await adapter.authenticate("valid-token");
      expect(result).toBe(true);
    });

    it("should return false for invalid token", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Unauthorized",
      });

      const result = await adapter.authenticate("invalid-token");
      expect(result).toBe(false);
    });
  });

  describe("state mapping", () => {
    it("should map READY state to success", async () => {
      const mockDeployment: VercelDeployment = {
        uid: "test-id",
        name: "test-project",
        url: "test.vercel.app",
        state: "READY",
        ready: Date.now(),
        createdAt: Date.now(),
        buildingAt: Date.now(),
        creator: { uid: "user", username: "user" },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ deployments: [mockDeployment] }),
        json: async () => ({ deployments: [mockDeployment] }),
      });

      const result = await adapter.getLatestDeployment(
        "test-project",
        "test-token"
      );
      expect(result.status).toBe("success");
    });

    it("should map ERROR state to failed", async () => {
      const mockDeployment: VercelDeployment = {
        uid: "test-id",
        name: "test-project",
        url: "test.vercel.app",
        state: "ERROR",
        ready: Date.now(),
        createdAt: Date.now(),
        buildingAt: Date.now(),
        creator: { uid: "user", username: "user" },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ deployments: [mockDeployment] }),
        json: async () => ({ deployments: [mockDeployment] }),
      });

      const result = await adapter.getLatestDeployment(
        "test-project",
        "test-token"
      );
      expect(result.status).toBe("failed");
    });

    it("should map BUILDING state to building", async () => {
      const mockDeployment: VercelDeployment = {
        uid: "test-id",
        name: "test-project",
        url: "test.vercel.app",
        state: "BUILDING",
        ready: Date.now(),
        createdAt: Date.now(),
        buildingAt: Date.now(),
        creator: { uid: "user", username: "user" },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => JSON.stringify({ deployments: [mockDeployment] }),
        json: async () => ({ deployments: [mockDeployment] }),
      });

      const result = await adapter.getLatestDeployment(
        "test-project",
        "test-token"
      );
      expect(result.status).toBe("building");
    });
  });
});
