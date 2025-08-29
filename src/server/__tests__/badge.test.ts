import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateBadgeData,
  generateErrorBadge,
  updateDeploymentStatus,
} from "../badge.js";
import type { Env } from "../../types.js";

// Mock the github utils
vi.mock("../../utils/github.js", () => ({
  validateRepository: vi.fn(),
  validateParams: vi.fn(),
}));

import { validateRepository, validateParams } from "../../utils/github.js";

describe("Badge Generation", () => {
  let mockEnv: Env;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEnv = {
      BADGE_KV: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
      },
    } as any;

    // Default: public repository and valid params
    (validateRepository as any).mockResolvedValue({
      exists: true,
      isPublic: true,
    });
    (validateParams as any).mockReturnValue(true);
  });

  describe("generateBadgeData", () => {
    it("should generate success badge for deployment status", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("success");

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "deployed",
        color: "brightgreen",
      });
    });

    it("should generate building badge for in-progress deployment", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("building");

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "deploying",
        color: "yellow",
      });
    });

    it("should generate failed badge for failed deployment", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("failed");

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "failed",
        color: "red",
      });
    });

    it("should generate error badge for error status", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("error");

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "error",
        color: "lightgrey",
      });
    });

    it("should generate unknown badge when no status in KV", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue(null);

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "unknown",
        color: "lightgrey",
      });
    });

    it("should use correct KV key format", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("success");

      await generateBadgeData("testuser", "testrepo", "vercel", mockEnv);

      expect(mockEnv.BADGE_KV.get).toHaveBeenCalledWith(
        "testuser/testrepo/vercel",
        "text"
      );
    });

    it("should return error badge for private repositories", async () => {
      (validateRepository as any).mockResolvedValue({
        exists: true,
        isPublic: false,
      });

      const result = await generateBadgeData(
        "user",
        "private-repo",
        "vercel",
        mockEnv
      );

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "Repository not found or private",
        color: "lightgrey",
      });
    });

    it("should return error badge for non-existent repositories", async () => {
      (validateRepository as any).mockResolvedValue({
        exists: false,
        isPublic: false,
      });

      const result = await generateBadgeData(
        "user",
        "nonexistent",
        "vercel",
        mockEnv
      );

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "Repository not found or private",
        color: "lightgrey",
      });
    });

    it("should handle different platforms correctly", async () => {
      (mockEnv.BADGE_KV.get as any).mockResolvedValue("success");

      const netlifyResult = await generateBadgeData(
        "user",
        "repo",
        "netlify",
        mockEnv
      );
      const cloudflarePagesResult = await generateBadgeData(
        "user",
        "repo",
        "cloudflare-pages",
        mockEnv
      );

      expect(netlifyResult.label).toBe("Netlify");
      expect(cloudflarePagesResult.label).toBe("Cloudflare Pages");
    });

    it("should handle KV storage errors gracefully", async () => {
      (mockEnv.BADGE_KV.get as any).mockRejectedValue(new Error("KV error"));

      const result = await generateBadgeData("user", "repo", "vercel", mockEnv);

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "error",
        color: "lightgrey",
      });
    });

    it("should handle missing BADGE_KV binding", async () => {
      const envWithoutKV = {} as Env;

      const result = await generateBadgeData(
        "user",
        "repo",
        "vercel",
        envWithoutKV
      );

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "unknown",
        color: "lightgrey",
      });
    });
  });

  describe("generateErrorBadge", () => {
    it("should generate error badge with custom message", () => {
      const result = generateErrorBadge("vercel", "Custom error message");

      expect(result).toEqual({
        schemaVersion: 1,
        label: "Vercel",
        message: "Custom error message",
        color: "lightgrey",
      });
    });

    it("should generate error badge for different platforms", () => {
      const netlifyResult = generateErrorBadge("netlify", "Error");
      const cloudflarePagesResult = generateErrorBadge(
        "cloudflare-pages",
        "Error"
      );

      expect(netlifyResult.label).toBe("Netlify");
      expect(cloudflarePagesResult.label).toBe("Cloudflare Pages");
    });
  });

  describe("updateDeploymentStatus", () => {
    it("should update KV storage with deployment status", async () => {
      await updateDeploymentStatus(
        "user",
        "repo",
        "vercel",
        "success",
        mockEnv
      );

      expect(mockEnv.BADGE_KV.put).toHaveBeenCalledWith(
        "user/repo/vercel",
        "success",
        {
          expirationTtl: 86400 * 30,
        }
      );
    });

    it("should handle different status values", async () => {
      const statuses = [
        "success",
        "failed",
        "building",
        "error",
        "unknown",
      ] as const;

      for (const status of statuses) {
        await updateDeploymentStatus("user", "repo", "vercel", status, mockEnv);
        expect(mockEnv.BADGE_KV.put).toHaveBeenCalledWith(
          "user/repo/vercel",
          status,
          {
            expirationTtl: 86400 * 30,
          }
        );
      }

      expect(mockEnv.BADGE_KV.put).toHaveBeenCalledTimes(5);
    });

    it("should handle different platforms", async () => {
      await updateDeploymentStatus(
        "user",
        "repo",
        "netlify",
        "success",
        mockEnv
      );
      await updateDeploymentStatus(
        "user",
        "repo",
        "cloudflare-pages",
        "building",
        mockEnv
      );

      expect(mockEnv.BADGE_KV.put).toHaveBeenCalledWith(
        "user/repo/netlify",
        "success",
        {
          expirationTtl: 86400 * 30,
        }
      );
      expect(mockEnv.BADGE_KV.put).toHaveBeenCalledWith(
        "user/repo/cloudflare-pages",
        "building",
        {
          expirationTtl: 86400 * 30,
        }
      );
    });

    it("should throw error when BADGE_KV is not available", async () => {
      const envWithoutKV = {} as Env;

      await expect(
        updateDeploymentStatus(
          "user",
          "repo",
          "vercel",
          "success",
          envWithoutKV
        )
      ).rejects.toThrow("KV storage not configured");
    });

    it("should handle KV put errors", async () => {
      (mockEnv.BADGE_KV.put as any).mockRejectedValue(
        new Error("KV put failed")
      );

      await expect(
        updateDeploymentStatus("user", "repo", "vercel", "success", mockEnv)
      ).rejects.toThrow("KV put failed");
    });
  });
});
