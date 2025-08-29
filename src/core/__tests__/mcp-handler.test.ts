import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MCPHandler } from "../mcp-handler.js";
import { BaseAdapter } from "../../adapters/base/index.js";

class MockAdapter extends BaseAdapter {
  name = "vercel";
  getLatestDeployment = vi.fn();
  authenticate = vi.fn();
  getDeploymentById = vi.fn();
  getRecentDeployments = vi.fn();
  getDeploymentLogs = vi.fn();
  listProjects = vi.fn();
}

describe("MCPHandler", () => {
  let handler: MCPHandler;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdapter = new MockAdapter();
    const adapters = new Map([["vercel", mockAdapter]]);
    handler = new MCPHandler(adapters);
    process.env.VERCEL_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.VERCEL_TOKEN;
    delete process.env.CLOUDFLARE_TOKEN;
  });

  describe("handleToolCall", () => {
    it("should handle check_deployment_status", async () => {
      mockAdapter.getLatestDeployment.mockResolvedValue({
        status: "success",
        platform: "vercel",
        projectName: "test-project",
        timestamp: new Date().toISOString(),
      });

      const result = await handler.handleToolCall("check_deployment_status", {
        platform: "vercel",
        project: "test-project",
        token: "test-token",
      });

      expect(result.version).toBe("1.0");
      expect(result.tool).toBe("check_deployment_status");
      expect(result.display).toContain("✅ Success");
      expect(result.data.status).toBe("success");
      expect(mockAdapter.getLatestDeployment).toHaveBeenCalledWith(
        "test-project",
        "test-token"
      );
    });

    it("should throw error for unknown tool", async () => {
      await expect(handler.handleToolCall("unknown_tool", {})).rejects.toThrow(
        "Unknown tool: unknown_tool"
      );
    });

    it("should handle list_projects", async () => {
      mockAdapter.listProjects.mockResolvedValue([
        { id: "proj1", name: "Project 1", url: "https://proj1.vercel.app" },
        { id: "proj2", name: "Project 2", url: "https://proj2.vercel.app" },
      ]);

      const result = await handler.handleToolCall("list_projects", {
        platform: "vercel",
        limit: 10,
      });

      expect(result.version).toBe("1.0");
      expect(result.tool).toBe("list_projects");
      expect(result.display).toContain("Projects on vercel");
      expect(result.display).toContain("Project 1");
      expect(result.display).toContain("Project 2");
      expect(result.data.count).toBe(2);
      expect(result.data.projects).toHaveLength(2);
      expect(mockAdapter.listProjects).toHaveBeenCalledWith("test-token", 10);
    });

    it("should handle check_deployment_status with history limit", async () => {
      const mockDeployments = [
        {
          uid: "dep1",
          state: "READY",
          url: "test1.vercel.app",
          name: "test-project",
          createdAt: Date.now() - 3600000,
          ready: Date.now() - 3000000,
          target: "production",
        },
        {
          uid: "dep2",
          state: "ERROR",
          url: "test2.vercel.app",
          name: "test-project",
          createdAt: Date.now() - 7200000,
          ready: Date.now() - 6600000,
          target: "preview",
        },
      ];

      mockAdapter.getRecentDeployments.mockResolvedValue(mockDeployments);

      const result = await handler.handleToolCall("check_deployment_status", {
        platform: "vercel",
        project: "test-project",
        limit: 5,
      });

      expect(result.version).toBe("1.0");
      expect(result.tool).toBe("check_deployment_status");
      expect(result.display).toContain("Deployment History");
      expect(result.display).toContain("Recent Deployments (2)");
      expect(result.data.count).toBe(2);
      expect(result.data.deployments).toHaveLength(2);
      expect(mockAdapter.getRecentDeployments).toHaveBeenCalledWith(
        "test-project",
        "test-token",
        5
      );
    });

    it("should handle Cloudflare Pages with CLOUDFLARE_TOKEN", async () => {
      const cloudflareAdapter = new MockAdapter();
      cloudflareAdapter.name = "cloudflare-pages";
      const adapters = new Map([["cloudflare-pages", cloudflareAdapter]]);
      const cfHandler = new MCPHandler(adapters);

      // Set the environment variable with correct token name
      process.env.CLOUDFLARE_TOKEN = "cf-test-token";

      cloudflareAdapter.listProjects.mockResolvedValue([
        {
          id: "cf-proj1",
          name: "CF Project 1",
          url: "https://cf-proj1.pages.dev",
        },
      ]);

      const result = await cfHandler.handleToolCall("list_projects", {
        platform: "cloudflare-pages",
        limit: 10,
      });

      expect(result.version).toBe("1.0");
      expect(result.tool).toBe("list_projects");
      expect(result.display).toContain("Projects on cloudflare-pages");
      expect(result.display).toContain("CF Project 1");
      expect(cloudflareAdapter.listProjects).toHaveBeenCalledWith(
        "cf-test-token",
        10
      );
    });

    it("should use fallback CLOUDFLARE_TOKEN for Cloudflare Pages", async () => {
      const cloudflareAdapter = new MockAdapter();
      cloudflareAdapter.name = "cloudflare-pages";
      const adapters = new Map([["cloudflare-pages", cloudflareAdapter]]);
      const cfHandler = new MCPHandler(adapters);

      // Set the general Cloudflare token (fallback)
      process.env.CLOUDFLARE_TOKEN = "general-cf-token";

      cloudflareAdapter.listProjects.mockResolvedValue([
        {
          id: "cf-proj1",
          name: "CF Project 1",
          url: "https://cf-proj1.pages.dev",
        },
      ]);

      const result = await cfHandler.handleToolCall("list_projects", {
        platform: "cloudflare-pages",
        limit: 10,
      });

      expect(result.version).toBe("1.0");
      expect(result.tool).toBe("list_projects");
      expect(cloudflareAdapter.listProjects).toHaveBeenCalledWith(
        "general-cf-token",
        10
      );
    });
  });

  describe("handleRequest", () => {
    it("should handle tools/list request", async () => {
      const result = await handler.handleRequest({
        method: "tools/list",
      });

      expect(result.tools).toBeDefined();
      expect(result.tools).toHaveLength(5);
      expect(result.tools[0].name).toBe("check_deployment_status");
      expect(result.tools[1].name).toBe("watch_deployment");
      expect(result.tools[2].name).toBe("compare_deployments");
      expect(result.tools[3].name).toBe("get_deployment_logs");
      expect(result.tools[4].name).toBe("list_projects");
    });

    it("should handle tools/call request", async () => {
      mockAdapter.getLatestDeployment.mockResolvedValue({
        status: "success",
        platform: "vercel",
        projectName: "test-project",
      });

      const result = await handler.handleRequest({
        method: "tools/call",
        params: {
          name: "check_deployment_status",
          arguments: {
            platform: "vercel",
            project: "test-project",
            token: "test-token",
          },
        },
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("✅ Success");
      expect(result.content[0].text).toContain("## Deployment Status");
    });

    it("should throw error for unknown method", async () => {
      await expect(
        handler.handleRequest({ method: "unknown/method" })
      ).rejects.toThrow("Unknown method: unknown/method");
    });
  });
});
