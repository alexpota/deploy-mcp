import { BaseAdapter } from "../base/index.js";
import { DeploymentStatus } from "../../types.js";
import { VercelAPI } from "./api.js";
import type { VercelDeployment, VercelConfig } from "./types.js";

export class VercelAdapter extends BaseAdapter {
  name = "vercel";
  private api: VercelAPI;

  constructor(config?: Partial<VercelConfig>) {
    super();

    const defaultConfig: VercelConfig = {
      baseUrl: "https://api.vercel.com",
      timeout: 10000,
      retryAttempts: 3,
    };

    this.api = new VercelAPI({ ...defaultConfig, ...config });
  }

  async getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus> {
    const apiToken = token || process.env.VERCEL_TOKEN;
    if (!apiToken) {
      throw new Error(
        "Vercel token required. Set VERCEL_TOKEN environment variable or pass token parameter."
      );
    }

    try {
      const data = await this.api.getDeployments(project, apiToken, 1);

      if (!data.deployments || data.deployments.length === 0) {
        return {
          status: "unknown",
          projectName: project,
          platform: "vercel",
        };
      }

      return this.transformDeployment(data.deployments[0]);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch deployment status from Vercel");
    }
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      await this.api.getUser(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Transform Vercel deployment to standard format
   */
  private transformDeployment(deployment: VercelDeployment): DeploymentStatus {
    const status = this.mapState(deployment.state);

    return {
      id: deployment.uid,
      status,
      url: deployment.url ? `https://${deployment.url}` : undefined,
      projectName: deployment.name,
      platform: "vercel",
      timestamp: this.formatTimestamp(deployment.createdAt),
      duration: deployment.ready
        ? this.calculateDuration(deployment.createdAt, deployment.ready)
        : undefined,
      environment: deployment.target || "production",
      commit: deployment.meta
        ? {
            sha: deployment.meta.githubCommitSha,
            message: deployment.meta.githubCommitMessage,
            author: deployment.meta.githubCommitAuthorName,
          }
        : undefined,
    };
  }

  /**
   * Map Vercel states to standard deployment status
   */
  private mapState(
    state: VercelDeployment["state"]
  ): DeploymentStatus["status"] {
    switch (state) {
      case "READY":
        return "success";
      case "ERROR":
      case "CANCELED":
        return "failed";
      case "BUILDING":
      case "INITIALIZING":
      case "QUEUED":
        return "building";
      default:
        return "unknown";
    }
  }
}

// Re-export types for convenience
export type { VercelDeployment, VercelConfig } from "./types.js";
