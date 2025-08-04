import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleWebhook } from "../webhook.js";
import type { Env } from "../../types.js";

// Mock the badge module
vi.mock("../badge.js", () => ({
  updateDeploymentStatus: vi.fn().mockResolvedValue(undefined),
}));

// Mock the github utils
vi.mock("../../utils/github.js", () => ({
  validateRepository: vi.fn(),
  validateParams: vi.fn(),
}));

import { updateDeploymentStatus } from "../badge.js";
import { validateRepository, validateParams } from "../../utils/github.js";

// Helper function to generate valid HMAC SHA-256 signature (only used for signature tests)
async function generateSignature(
  body: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, bodyData);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `sha256=${signature}`;
}

describe("handleWebhook", () => {
  let mockEnv: Env;
  let mockRequest: Request;

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

    // Default mock implementations
    (validateParams as any).mockReturnValue(true);
    (validateRepository as any).mockResolvedValue({
      exists: true,
      isPublic: true,
    });
  });

  describe("parameter validation", () => {
    it("should reject invalid parameters", async () => {
      (validateParams as any).mockReturnValue(false);

      mockRequest = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const result = await handleWebhook(
        mockRequest,
        "invalid-user!",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid parameters");
    });

    it("should accept valid parameters", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.ready",
          deployment: { id: "test", state: "READY" },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "validuser",
        "validrepo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(validateParams).toHaveBeenCalledWith(
        "validuser",
        "validrepo",
        "vercel"
      );
    });
  });

  describe("repository validation", () => {
    it("should reject non-existent repositories", async () => {
      (validateRepository as any).mockResolvedValue({
        exists: false,
        isPublic: false,
      });

      mockRequest = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "nonexistent",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Repository not found");
    });

    it("should reject private repositories", async () => {
      (validateRepository as any).mockResolvedValue({
        exists: true,
        isPublic: false,
      });

      mockRequest = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "private-repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Private repository");
      expect(result.error).toBe(
        "Badge updates are only supported for public repositories"
      );
    });

    it("should accept public repositories", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.ready",
          deployment: { id: "test", state: "READY" },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "public-repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(validateRepository).toHaveBeenCalledWith("user", "public-repo");
    });
  });

  describe("Vercel webhook payload processing", () => {
    beforeEach(() => {
      (updateDeploymentStatus as any).mockResolvedValue(undefined);
    });

    it("should map READY state to success", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.ready",
          deployment: {
            id: "dpl_123",
            state: "READY",
            url: "test.vercel.app",
          },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(updateDeploymentStatus).toHaveBeenCalledWith(
        "user",
        "repo",
        "vercel",
        "success",
        mockEnv
      );
    });

    it("should map BUILDING state to building", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.created",
          deployment: {
            id: "dpl_456",
            state: "BUILDING",
            url: "test.vercel.app",
          },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(updateDeploymentStatus).toHaveBeenCalledWith(
        "user",
        "repo",
        "vercel",
        "building",
        mockEnv
      );
    });

    it("should map ERROR state to failed", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.error",
          deployment: {
            id: "dpl_789",
            state: "ERROR",
            url: "test.vercel.app",
          },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(updateDeploymentStatus).toHaveBeenCalledWith(
        "user",
        "repo",
        "vercel",
        "failed",
        mockEnv
      );
    });

    it("should map CANCELED state to failed", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.canceled",
          deployment: {
            id: "dpl_abc",
            state: "CANCELED",
            url: "test.vercel.app",
          },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(updateDeploymentStatus).toHaveBeenCalledWith(
        "user",
        "repo",
        "vercel",
        "failed",
        mockEnv
      );
    });

    it("should handle unknown state as unknown", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.unknown",
          deployment: {
            id: "dpl_xyz",
            state: "UNKNOWN_STATE",
            url: "test.vercel.app",
          },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(true);
      expect(updateDeploymentStatus).toHaveBeenCalledWith(
        "user",
        "repo",
        "vercel",
        "unknown",
        mockEnv
      );
    });
  });

  describe("error handling", () => {
    it("should handle invalid JSON payload", async () => {
      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: "invalid-json",
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid JSON payload");
    });

    it("should handle KV storage errors", async () => {
      (updateDeploymentStatus as any).mockRejectedValue(new Error("KV error"));

      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.ready",
          deployment: { id: "test", state: "READY" },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        mockEnv
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to update deployment status");
      expect(result.error).toBe("KV error");
    });
  });

  describe("signature validation (optional)", () => {
    it("should validate signature when secret is configured", async () => {
      // Reset the mock to resolve successfully
      (updateDeploymentStatus as any).mockResolvedValue(undefined);

      const envWithSecret = {
        ...mockEnv,
        VERCEL_WEBHOOK_SECRET: "test-secret-key",
      };
      const body = JSON.stringify({
        type: "deployment.ready",
        deployment: { id: "test", state: "READY" },
      });
      const signature = await generateSignature(body, "test-secret-key");

      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": signature },
        body,
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        envWithSecret
      );

      expect(result.success).toBe(true);
    });

    it("should reject invalid signature when secret is configured", async () => {
      const envWithSecret = {
        ...mockEnv,
        VERCEL_WEBHOOK_SECRET: "test-secret-key",
      };
      const body = JSON.stringify({ test: "data" });

      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=invalid-signature" },
        body,
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        envWithSecret
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid webhook");
    });

    it("should accept webhook when no secret configured (public repos)", async () => {
      // Reset the mock to resolve successfully
      (updateDeploymentStatus as any).mockResolvedValue(undefined);

      const envWithoutSecret = { ...mockEnv, VERCEL_WEBHOOK_SECRET: undefined };

      mockRequest = new Request("http://localhost", {
        method: "POST",
        headers: { "x-vercel-signature": "sha256=test" },
        body: JSON.stringify({
          type: "deployment.ready",
          deployment: { id: "test", state: "READY" },
        }),
      });

      const result = await handleWebhook(
        mockRequest,
        "user",
        "repo",
        "vercel",
        envWithoutSecret
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain("Deployment status updated");
    });
  });
});
