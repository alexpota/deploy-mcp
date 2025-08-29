import { describe, it, expect, vi, beforeEach } from "vitest";
import { CloudflarePagesAdapter } from "../index.js";
import { CloudflarePagesAPI } from "../api.js";
import type { CloudflarePagesDeployment } from "../types.js";

// Mock the API
vi.mock("../api.js");

describe("CloudflarePagesAdapter", () => {
  let adapter: CloudflarePagesAdapter;
  let mockAPI: any;

  beforeEach(() => {
    adapter = new CloudflarePagesAdapter();
    mockAPI = {
      getLatestDeployment: vi.fn(),
      listProjects: vi.fn(),
      getDeployment: vi.fn(),
      listDeployments: vi.fn(),
      getDeploymentLogs: vi.fn(),
      createDeployment: vi.fn(),
      retryDeployment: vi.fn(),
    };

    // Mock the API constructor
    vi.mocked(CloudflarePagesAPI).mockImplementation(() => mockAPI);
  });

  describe("constructor", () => {
    it("should set the correct adapter name", () => {
      expect(adapter.name).toBe("cloudflare-pages");
    });
  });

  describe("getLatestDeployment", () => {
    it("should return deployment status for successful deployment", async () => {
      const mockDeployment: CloudflarePagesDeployment = {
        id: "deployment-123",
        project_id: "proj-123",
        project_name: "test-project",
        environment: "production",
        url: "https://test-project.pages.dev",
        created_on: "2023-01-01T00:00:00Z",
        modified_on: "2023-01-01T00:05:00Z",
        latest_stage: {
          name: "deploy",
          started_on: "2023-01-01T00:00:00Z",
          ended_on: "2023-01-01T00:05:00Z",
          status: "success",
        },
        source: {
          type: "github",
          config: {
            commit_hash: "abc123",
            commit_message: "Test commit",
          },
        },
      };

      mockAPI.getLatestDeployment.mockResolvedValue(mockDeployment);

      const result = await adapter.getLatestDeployment(
        "test-project",
        "account123:token456"
      );

      expect(result).toEqual({
        id: "deployment-123",
        status: "success",
        url: "https://test-project.pages.dev",
        projectName: "test-project",
        platform: "cloudflare-pages",
        timestamp: "2023-01-01T00:00:00.000Z",
        duration: 300, // 5 minutes
        environment: "production",
        commit: {
          sha: "abc123",
          message: "Test commit",
          author: undefined,
        },
      });
    });

    it("should return unknown status when no deployment found", async () => {
      mockAPI.getLatestDeployment.mockResolvedValue(null);

      const result = await adapter.getLatestDeployment(
        "test-project",
        "account123:token456"
      );

      expect(result).toEqual({
        status: "unknown",
        projectName: "test-project",
        platform: "cloudflare-pages",
      });
    });

    it("should handle failed deployment", async () => {
      const mockDeployment: CloudflarePagesDeployment = {
        id: "deployment-456",
        project_id: "proj-123",
        project_name: "test-project",
        environment: "production",
        url: "https://test-project.pages.dev",
        created_on: "2023-01-01T00:00:00Z",
        modified_on: "2023-01-01T00:02:00Z",
        latest_stage: {
          name: "deploy",
          started_on: "2023-01-01T00:00:00Z",
          ended_on: "2023-01-01T00:02:00Z",
          status: "failed",
        },
      };

      mockAPI.getLatestDeployment.mockResolvedValue(mockDeployment);

      const result = await adapter.getLatestDeployment(
        "test-project",
        "account123:token456"
      );

      expect(result.status).toBe("failed");
    });

    it("should throw error when missing account ID", async () => {
      await expect(
        adapter.getLatestDeployment("test-project", "invalid-token")
      ).rejects.toThrow("Cloudflare account ID is required");
    });
  });

  describe("authenticate", () => {
    it("should return true for valid credentials", async () => {
      mockAPI.listProjects.mockResolvedValue([]);

      const result = await adapter.authenticate("account123:token456");

      expect(result).toBe(true);
      expect(mockAPI.listProjects).toHaveBeenCalledWith({ perPage: 1 });
    });

    it("should return false for invalid credentials", async () => {
      mockAPI.listProjects.mockRejectedValue(new Error("Unauthorized"));

      const result = await adapter.authenticate("account123:invalid-token");

      expect(result).toBe(false);
    });
  });

  describe("listProjects", () => {
    it("should return formatted project list", async () => {
      const mockProjects = [
        {
          id: "proj-1",
          name: "project-1",
          subdomain: "project-1",
          domains: ["project1.example.com"],
          created_on: "2023-01-01T00:00:00Z",
          modified_on: "2023-01-01T00:00:00Z",
          production_branch: "main",
        },
        {
          id: "proj-2",
          name: "project-2",
          subdomain: "project-2",
          domains: [],
          created_on: "2023-01-01T00:00:00Z",
          modified_on: "2023-01-01T00:00:00Z",
          production_branch: "main",
        },
      ];

      mockAPI.listProjects.mockResolvedValue(mockProjects);

      const result = await adapter.listProjects("account123:token456", 10);

      expect(result).toEqual([
        {
          id: "proj-1",
          name: "project-1",
          url: "https://project1.example.com",
        },
        {
          id: "proj-2",
          name: "project-2",
          url: "https://project-2.pages.dev",
        },
      ]);
    });
  });

  describe("getDeploymentLogs", () => {
    it("should return formatted logs", async () => {
      const mockLogsResponse = {
        success: true,
        errors: [],
        messages: [],
        result: {
          data: [
            {
              id: "log-1",
              timestamp: "2023-01-01T00:00:00Z",
              level: "info" as const,
              message: "Starting deployment",
            },
            {
              id: "log-2",
              timestamp: "2023-01-01T00:00:01Z",
              level: "error" as const,
              message: "Build failed",
            },
          ],
          includes_container_logs: false,
          total: 2,
        },
      };

      mockAPI.getDeploymentLogs.mockResolvedValue(mockLogsResponse);

      const result = await adapter.getDeploymentLogs(
        "test-project:deployment-123",
        "account123:token456"
      );

      expect(result).toBe(`[2023-01-01T00:00:00Z] INFO: Starting deployment
[2023-01-01T00:00:01Z] ERROR: Build failed`);
    });

    it("should return message when no logs available", async () => {
      const mockLogsResponse = {
        success: true,
        errors: [],
        messages: [],
        result: {
          data: [],
          includes_container_logs: false,
          total: 0,
        },
      };

      mockAPI.getDeploymentLogs.mockResolvedValue(mockLogsResponse);

      const result = await adapter.getDeploymentLogs(
        "test-project:deployment-123",
        "account123:token456"
      );

      expect(result).toBe("No logs available");
    });

    it("should throw error for invalid deployment ID format", async () => {
      await expect(
        adapter.getDeploymentLogs("invalid-id", "account123:token456")
      ).rejects.toThrow(
        "Deployment ID must be in format 'projectName:deploymentId'"
      );
    });
  });

  describe("state mapping", () => {
    it("should map Cloudflare states correctly", async () => {
      const states = [
        { cfState: "success", expectedStatus: "success" },
        { cfState: "failed", expectedStatus: "failed" },
        { cfState: "canceled", expectedStatus: "failed" },
        { cfState: "active", expectedStatus: "building" },
        { cfState: "skipped", expectedStatus: "unknown" },
        { cfState: "unknown", expectedStatus: "unknown" },
      ];

      for (const { cfState, expectedStatus } of states) {
        const mockDeployment: CloudflarePagesDeployment = {
          id: "deployment-123",
          project_id: "proj-123",
          project_name: "test-project",
          environment: "production",
          url: "https://test-project.pages.dev",
          created_on: "2023-01-01T00:00:00Z",
          modified_on: "2023-01-01T00:00:00Z",
          latest_stage: {
            name: "deploy",
            started_on: "2023-01-01T00:00:00Z",
            ended_on: null,
            status: cfState as any,
          },
        };

        mockAPI.getLatestDeployment.mockResolvedValue(mockDeployment);

        const result = await adapter.getLatestDeployment(
          "test-project",
          "account123:token456"
        );
        expect(result.status).toBe(expectedStatus);
      }
    });
  });
});
