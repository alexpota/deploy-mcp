import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeploymentIntelligence } from "../deployment-intelligence.js";
import { VercelAdapter } from "../../adapters/vercel/index.js";

vi.mock("../../adapters/vercel/index.js");

describe("DeploymentIntelligence", () => {
  let intelligence: DeploymentIntelligence;
  let mockAdapter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdapter = {
      getDeploymentById: vi.fn(),
      getRecentDeployments: vi.fn(),
      getDeploymentLogs: vi.fn(),
    };
    (VercelAdapter as any).mockImplementation(function () {
      return mockAdapter;
    });
    intelligence = new DeploymentIntelligence("vercel");
  });

  describe("watchDeployment", () => {
    it("should watch deployment until ready", async () => {
      const deploymentStates = [
        { readyState: "INITIALIZING", uid: "dep123" },
        { readyState: "BUILDING", uid: "dep123" },
        {
          readyState: "READY",
          uid: "dep123",
          url: "test.vercel.app",
          buildingAt: 1000,
          ready: 2000,
        },
      ];

      let callCount = 0;
      mockAdapter.getRecentDeployments.mockResolvedValue([{ uid: "dep123" }]);
      mockAdapter.getDeploymentById.mockImplementation(() => {
        return Promise.resolve(deploymentStates[callCount++]);
      });

      const events = [];
      const generator = intelligence.watchDeployment({
        platform: "vercel",
        project: "test-project",
        token: "test-token",
      });

      for await (const event of generator) {
        events.push(event);
      }

      expect(events).toHaveLength(4);
      expect(events[0].type).toBe("progress");
      expect(events[0].message).toContain("Starting to watch");
      expect(events[1].message).toContain("Initializing");
      expect(events[2].message).toContain("Building");
      expect(events[3].type).toBe("success");
      expect(events[3].details?.url).toBe("test.vercel.app");
    }, 10000); // Increase timeout to 10 seconds for dynamic polling

    it("should handle deployment errors", async () => {
      mockAdapter.getRecentDeployments.mockResolvedValue([{ uid: "dep123" }]);
      mockAdapter.getDeploymentById.mockResolvedValue({
        readyState: "ERROR",
        uid: "dep123",
      });
      mockAdapter.getDeploymentLogs.mockResolvedValue(
        "Build failed: Cannot find module 'react'"
      );

      const events = [];
      const generator = intelligence.watchDeployment({
        platform: "vercel",
        project: "test-project",
        token: "test-token",
      });

      for await (const event of generator) {
        events.push(event);
      }

      const errorEvent = events.find(e => e.type === "error");
      expect(errorEvent).toBeDefined();
      expect(errorEvent?.message).toContain("Deployment failed");
      expect(errorEvent?.details?.suggestion).toBeDefined();
      expect(errorEvent?.details?.suggestion).toContain("See full logs");
    });

    it("should handle missing token", async () => {
      const events = [];
      const generator = intelligence.watchDeployment({
        platform: "vercel",
        project: "test-project",
      });

      for await (const event of generator) {
        events.push(event);
      }

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("error");
      expect(events[0].message).toContain("No token provided");
    });
  });

  describe("compareDeployments", () => {
    it("should compare two deployments", async () => {
      mockAdapter.getRecentDeployments.mockResolvedValue([
        {
          uid: "dep2",
          buildingAt: 1000,
          ready: 3000,
          createdAt: Date.now() - 3600000,
          state: "READY",
          url: "test2.vercel.app",
        },
        {
          uid: "dep1",
          buildingAt: 1000,
          ready: 2000,
          createdAt: Date.now() - 7200000,
          state: "READY",
          url: "test1.vercel.app",
        },
      ]);

      const comparison = await intelligence.compareDeployments({
        platform: "vercel",
        project: "test-project",
        mode: "last_vs_previous",
        token: "test-token",
      });

      expect(comparison).toBeDefined();
      expect(comparison?.deployments.current.id).toBe("dep2");
      expect(comparison?.deployments.previous.id).toBe("dep1");
      expect(comparison?.performance.buildTime.current).toBe(2);
      expect(comparison?.performance.buildTime.previous).toBe(1);
      expect(comparison?.performance.buildTime.delta).toBe(1);
      expect(comparison?.performance.buildTime.percentage).toBe(100);
      expect(comparison?.risk).toBe("HIGH");
    });

    it("should return null when not enough deployments", async () => {
      mockAdapter.getRecentDeployments.mockResolvedValue([{ uid: "dep1" }]);

      const comparison = await intelligence.compareDeployments({
        platform: "vercel",
        project: "test-project",
        mode: "last_vs_previous",
        token: "test-token",
      });

      expect(comparison).toBeNull();
    });
  });

  describe("getDeploymentLogs", () => {
    it("should get and analyze deployment logs", async () => {
      const logs = `Building application...
Error: Build failed
TypeScript compilation error`;
      mockAdapter.getDeploymentLogs.mockResolvedValue(logs);

      const result = await intelligence.getDeploymentLogs({
        platform: "vercel",
        deploymentId: "dep123",
        filter: "error",
        token: "test-token",
      });

      // When filter is "error", only lines with "error" are returned
      expect(result.logs).toContain("Error: Build failed");
      expect(result.logs).toContain("error");
      expect(result.analysis).toBeDefined();
      expect(result.analysis?.type).toBe("BUILD");
      expect(result.analysis?.message).toBeTruthy();
    });

    it("should filter logs by type", async () => {
      const logs = `Info: Starting build
Error: Module not found
Warning: Deprecated API
Error: Build failed`;
      mockAdapter.getDeploymentLogs.mockResolvedValue(logs);

      const result = await intelligence.getDeploymentLogs({
        platform: "vercel",
        deploymentId: "dep123",
        token: "test-token",
        filter: "error",
      });

      expect(result.logs).toContain("Error: Module not found");
      expect(result.logs).toContain("Error: Build failed");
      expect(result.logs).not.toContain("Info: Starting");
      expect(result.logs).not.toContain("Warning:");
    });
  });
});
