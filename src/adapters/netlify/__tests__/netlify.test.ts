import { describe, it, expect, vi, beforeEach } from "vitest";
import { NetlifyAdapter } from "../index.js";
import { NetlifyDeploy } from "../types.js";
import { AdapterException } from "../../base/types.js";

vi.mock("../api.js");

describe("NetlifyAdapter", () => {
  let adapter: NetlifyAdapter;
  let mockAPI: any;

  const mockDeploy: NetlifyDeploy = {
    id: "deploy123",
    site_id: "site123",
    state: "ready",
    name: "test-project",
    url: "https://test-project.netlify.app",
    ssl_url: "https://test-project.netlify.app",
    deploy_url: "https://deploy123--test-project.netlify.app",
    deploy_ssl_url: "https://deploy123--test-project.netlify.app",
    created_at: "2024-01-01T10:00:00Z",
    published_at: "2024-01-01T10:05:00Z",
    deploy_time: 300000, // 5 minutes in ms
    context: "production",
    commit_ref: "abc123",
    commit_url: "https://github.com/user/repo/commit/abc123",
    title: "feat: add new feature",
    branch: "main",
    review_id: null,
    log_access_attributes: {
      type: "firebase",
      url: "https://logs.netlify.com/deploy123",
      endpoint: "https://api.netlify.com/logs/deploy123",
      path: "/logs/deploy123",
      token: "log-token",
    },
  };

  beforeEach(() => {
    adapter = new NetlifyAdapter();
    mockAPI = adapter["api"];
  });

  describe("getLatestDeployment", () => {
    it("should get latest deployment successfully", async () => {
      mockAPI.listDeploys = vi.fn().mockResolvedValue([mockDeploy]);

      const result = await adapter.getLatestDeployment(
        "test-project",
        "token123"
      );

      expect(mockAPI.listDeploys).toHaveBeenCalledWith(
        "test-project",
        "token123",
        1
      );
      expect(result).toEqual({
        id: "deploy123",
        status: "success",
        url: "https://test-project.netlify.app",
        projectName: "test-project",
        platform: "netlify",
        timestamp: expect.stringMatching(/\d{4}-\d{2}-\d{2}T/),
        duration: 300, // 5 minutes in seconds
        environment: "production",
        commit: {
          sha: "abc123",
          message: "feat: add new feature",
        },
      });
    });

    it("should throw error when no token provided", async () => {
      await expect(adapter.getLatestDeployment("test-project")).rejects.toThrow(
        AdapterException
      );
    });

    it("should throw error when no deployments found", async () => {
      mockAPI.listDeploys = vi.fn().mockResolvedValue([]);

      await expect(
        adapter.getLatestDeployment("test-project", "token123")
      ).rejects.toThrow("No deployments found");
    });

    it("should handle site not found error", async () => {
      mockAPI.listDeploys = vi
        .fn()
        .mockRejectedValue(new Error("Site not found"));

      await expect(
        adapter.getLatestDeployment("test-project", "token123")
      ).rejects.toThrow(AdapterException);
    });
  });

  describe("authenticate", () => {
    it("should return true for valid token", async () => {
      mockAPI.getUser = vi.fn().mockResolvedValue({ id: "user123" });

      const result = await adapter.authenticate("valid-token");

      expect(result).toBe(true);
      expect(mockAPI.getUser).toHaveBeenCalledWith("valid-token");
    });

    it("should return false for invalid token", async () => {
      mockAPI.getUser = vi.fn().mockRejectedValue(new Error("Unauthorized"));

      const result = await adapter.authenticate("invalid-token");

      expect(result).toBe(false);
    });
  });

  describe("getDeploymentById", () => {
    it("should get deployment by ID", async () => {
      mockAPI.getDeploy = vi.fn().mockResolvedValue(mockDeploy);

      const result = await adapter.getDeploymentById("deploy123", "token123");

      expect(result).toEqual(mockDeploy);
      expect(mockAPI.getDeploy).toHaveBeenCalledWith("deploy123", "token123");
    });

    it("should throw error when deployment not found", async () => {
      mockAPI.getDeploy = vi.fn().mockRejectedValue(new Error("Not found"));

      await expect(
        adapter.getDeploymentById("deploy123", "token123")
      ).rejects.toThrow(AdapterException);
    });
  });

  describe("getRecentDeployments", () => {
    it("should get recent deployments", async () => {
      const mockDeploys = [mockDeploy, { ...mockDeploy, id: "deploy456" }];
      mockAPI.listDeploys = vi.fn().mockResolvedValue(mockDeploys);

      const result = await adapter.getRecentDeployments(
        "test-project",
        "token123",
        5
      );

      expect(result).toEqual(mockDeploys);
      expect(mockAPI.listDeploys).toHaveBeenCalledWith(
        "test-project",
        "token123",
        5
      );
    });
  });

  describe("getDeploymentLogs", () => {
    it("should get deployment logs", async () => {
      const mockLogs = "Building...\nDeploying...\nSuccess!";
      mockAPI.getDeployLog = vi.fn().mockResolvedValue(mockLogs);

      const result = await adapter.getDeploymentLogs("deploy123", "token123");

      expect(result).toBe(mockLogs);
      expect(mockAPI.getDeployLog).toHaveBeenCalledWith(
        "deploy123",
        "token123"
      );
    });

    it("should handle logs not available", async () => {
      mockAPI.getDeployLog = vi
        .fn()
        .mockRejectedValue(new Error("Deploy logs not available"));

      const result = await adapter.getDeploymentLogs("deploy123", "token123");

      expect(result).toBe("Deploy logs not available for this deployment.");
    });
  });

  describe("state mapping", () => {
    const testCases: Array<[NetlifyDeploy["state"], string]> = [
      ["ready", "success"],
      ["processed", "success"],
      ["error", "failed"],
      ["rejected", "failed"],
      ["new", "building"],
      ["pending_review", "building"],
      ["accepted", "building"],
      ["enqueued", "building"],
      ["building", "building"],
      ["uploading", "building"],
      ["uploaded", "building"],
      ["preparing", "building"],
      ["prepared", "building"],
      ["processing", "building"],
      ["retrying", "building"],
    ];

    testCases.forEach(([netlifyState, expectedStatus]) => {
      it(`should map ${netlifyState} to ${expectedStatus}`, async () => {
        const deploy = { ...mockDeploy, state: netlifyState };
        mockAPI.listDeploys = vi.fn().mockResolvedValue([deploy]);

        const result = await adapter.getLatestDeployment(
          "test-project",
          "token123"
        );

        expect(result.status).toBe(expectedStatus);
      });
    });
  });
});
