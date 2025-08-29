import { BaseAdapter } from "../base/index.js";
import { DeploymentStatus } from "../../types.js";
import { CloudflarePagesAPI } from "./api.js";
import {
  CloudflarePagesDeployment,
  CloudflarePagesDeploymentStageStatus,
} from "./types.js";

export class CloudflarePagesAdapter extends BaseAdapter {
  name = "cloudflare-pages";
  private api: CloudflarePagesAPI | null = null;

  private getAPI(token: string): CloudflarePagesAPI {
    // Parse the token to extract account ID and API token
    // Format: "accountId:apiToken" or just "apiToken" (with account ID in env)
    let accountId: string;
    let apiToken: string;

    if (token.includes(":")) {
      [accountId, apiToken] = token.split(":", 2);
    } else {
      // Check if account ID is in environment variable
      accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
      apiToken = token;
    }

    if (!accountId) {
      throw new Error(
        "Cloudflare account ID is required. Provide it as 'accountId:apiToken' or set CLOUDFLARE_ACCOUNT_ID environment variable"
      );
    }

    // Create new API instance or reuse existing one
    if (!this.api || this.api["accountId"] !== accountId) {
      this.api = new CloudflarePagesAPI(accountId, apiToken);
    }

    return this.api;
  }

  async getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus> {
    const apiToken =
      token || process.env.CLOUDFLARE_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
    if (!apiToken) {
      throw new Error("Cloudflare API token is required");
    }

    try {
      const api = this.getAPI(apiToken);
      const deployment = await api.getLatestDeployment(project);

      if (!deployment) {
        return {
          status: "unknown",
          projectName: project,
          platform: "cloudflare-pages",
        };
      }

      return this.transformDeployment(deployment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch deployment: ${error}`);
    }
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const api = this.getAPI(token);
      // Try to list projects to verify authentication
      await api.listProjects({ perPage: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async getDeploymentById(
    deploymentId: string,
    token: string
  ): Promise<CloudflarePagesDeployment> {
    // Cloudflare Pages requires project name to get deployment
    // The deploymentId should be in format "projectName:deploymentId"
    if (!deploymentId.includes(":")) {
      throw new Error(
        "Deployment ID must be in format 'projectName:deploymentId' for Cloudflare Pages"
      );
    }

    const [projectName, actualDeploymentId] = deploymentId.split(":", 2);
    const api = this.getAPI(token);
    return api.getDeployment(projectName, actualDeploymentId);
  }

  async getRecentDeployments(
    project: string,
    token: string,
    _limit: number = 10
  ): Promise<CloudflarePagesDeployment[]> {
    const api = this.getAPI(token);
    return api.listDeployments(project);
  }

  async getDeploymentLogs(
    deploymentId: string,
    token: string
  ): Promise<string> {
    // Parse composite deployment ID
    if (!deploymentId.includes(":")) {
      throw new Error(
        "Deployment ID must be in format 'projectName:deploymentId' for Cloudflare Pages"
      );
    }

    const [projectName, actualDeploymentId] = deploymentId.split(":", 2);
    const api = this.getAPI(token);
    const response = await api.getDeploymentLogs(
      projectName,
      actualDeploymentId
    );

    // Format logs as string
    if (!response.result?.data || response.result.data.length === 0) {
      return "No logs available";
    }

    return response.result.data
      .map(
        log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
      )
      .join("\n");
  }

  async listProjects(
    token: string,
    _limit: number = 20
  ): Promise<Array<{ id: string; name: string; url?: string }>> {
    const api = this.getAPI(token);
    const projects = await api.listProjects();

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      url: project.domains?.[0]
        ? `https://${project.domains[0]}`
        : `https://${project.subdomain}.pages.dev`,
    }));
  }

  private transformDeployment(
    deployment: CloudflarePagesDeployment
  ): DeploymentStatus {
    const status = this.mapStageStatus(deployment.latest_stage?.status);

    return {
      id: deployment.id,
      status,
      url: deployment.url,
      projectName: deployment.project_name,
      platform: "cloudflare-pages",
      timestamp: this.formatTimestamp(deployment.created_on),
      duration: deployment.latest_stage
        ? this.calculateDuration(
            deployment.latest_stage.started_on || deployment.created_on,
            deployment.latest_stage.ended_on || undefined
          )
        : undefined,
      environment: deployment.environment,
      commit: deployment.source?.config
        ? {
            sha: deployment.source.config.commit_hash,
            message: deployment.source.config.commit_message,
            author: undefined, // Cloudflare Pages doesn't provide author in API
          }
        : undefined,
    };
  }

  private mapStageStatus(
    status?: CloudflarePagesDeploymentStageStatus
  ): DeploymentStatus["status"] {
    if (!status) {
      return "unknown";
    }

    switch (status) {
      case "success":
        return "success";
      case "failed":
      case "canceled":
        return "failed";
      case "active":
        return "building";
      case "skipped":
        return "unknown";
      default:
        return "unknown";
    }
  }

  // Helper method to get deployment status
  async getDeploymentStatus(
    project: string,
    token: string
  ): Promise<DeploymentStatus> {
    return this.getLatestDeployment(project, token);
  }

  // Helper method to trigger a new deployment
  async triggerDeployment(
    project: string,
    token: string,
    branch?: string
  ): Promise<CloudflarePagesDeployment> {
    const api = this.getAPI(token);
    return api.createDeployment(project, branch);
  }

  // Helper method to retry a failed deployment
  async retryDeployment(
    projectName: string,
    deploymentId: string,
    token: string
  ): Promise<CloudflarePagesDeployment> {
    const api = this.getAPI(token);
    return api.retryDeployment(projectName, deploymentId);
  }
}
