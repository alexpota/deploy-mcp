import { BaseAdapter } from "../base/index.js";
import { DeploymentStatus } from "../../types.js";
import { VercelAPI } from "./api.js";
import {
  API_CONFIG,
  PLATFORM,
  ENVIRONMENT_TYPES,
  VERCEL_STATES,
  ADAPTER_ERRORS,
} from "../../core/constants.js";
import type { VercelDeployment, VercelConfig } from "./types.js";

export class VercelAdapter extends BaseAdapter {
  name = PLATFORM.VERCEL;
  private api: VercelAPI;

  constructor(config?: Partial<VercelConfig>) {
    super();

    const defaultConfig: VercelConfig = {
      baseUrl: API_CONFIG.VERCEL_BASE_URL,
      timeout: API_CONFIG.DEFAULT_TIMEOUT_MS,
      retryAttempts: API_CONFIG.DEFAULT_RETRY_ATTEMPTS,
    };

    this.api = new VercelAPI({ ...defaultConfig, ...config });
  }

  async getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus> {
    const apiToken = token || process.env.VERCEL_TOKEN;
    if (!apiToken) {
      throw new Error(ADAPTER_ERRORS.VERCEL_TOKEN_REQUIRED);
    }

    try {
      const data = await this.api.getDeployments(
        project,
        apiToken,
        API_CONFIG.SINGLE_DEPLOYMENT_LIMIT
      );

      if (!data.deployments || data.deployments.length === 0) {
        return {
          status: ADAPTER_ERRORS.UNKNOWN_STATUS as "unknown",
          projectName: project,
          platform: PLATFORM.VERCEL,
        };
      }

      return this.transformDeployment(data.deployments[0]);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ADAPTER_ERRORS.FETCH_DEPLOYMENT_FAILED);
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

  private transformDeployment(deployment: VercelDeployment): DeploymentStatus {
    const status = this.mapState(deployment.state);

    return {
      id: deployment.uid,
      status,
      url: deployment.url ? `https://${deployment.url}` : undefined,
      projectName: deployment.name,
      platform: PLATFORM.VERCEL,
      timestamp: this.formatTimestamp(deployment.createdAt),
      duration: deployment.ready
        ? this.calculateDuration(deployment.createdAt, deployment.ready)
        : undefined,
      environment: deployment.target || ENVIRONMENT_TYPES.PRODUCTION,
      commit: deployment.meta
        ? {
            sha: deployment.meta.githubCommitSha,
            message: deployment.meta.githubCommitMessage,
            author: deployment.meta.githubCommitAuthorName,
          }
        : undefined,
    };
  }

  private mapState(
    state: VercelDeployment["state"]
  ): DeploymentStatus["status"] {
    switch (state) {
      case VERCEL_STATES.READY:
        return "success";
      case VERCEL_STATES.ERROR:
      case VERCEL_STATES.CANCELED:
        return "failed";
      case VERCEL_STATES.BUILDING:
      case VERCEL_STATES.INITIALIZING:
      case VERCEL_STATES.QUEUED:
        return "building";
      default:
        return ADAPTER_ERRORS.UNKNOWN_STATUS as "unknown";
    }
  }

  async getDeploymentById(
    deploymentId: string,
    token: string
  ): Promise<VercelDeployment> {
    return this.api.getDeploymentById(deploymentId, token);
  }

  async getRecentDeployments(
    project: string,
    token: string,
    limit: number = API_CONFIG.DEFAULT_DEPLOYMENT_LIMIT
  ): Promise<VercelDeployment[]> {
    const data = await this.api.getDeployments(project, token, limit);
    return data.deployments || [];
  }

  async getDeploymentLogs(
    deploymentId: string,
    token: string
  ): Promise<string> {
    return this.api.getDeploymentLogs(deploymentId, token);
  }

  async getDeploymentStatus(
    project: string,
    token: string
  ): Promise<DeploymentStatus> {
    return this.getLatestDeployment(project, token);
  }

  async listProjects(
    token: string,
    limit = 20
  ): Promise<Array<{ id: string; name: string; url?: string }>> {
    const response = await this.api.listProjects(token, limit);

    return response.projects.map(project => ({
      id: project.id,
      name: project.name,
      url: project.latestDeployments?.[0]?.url
        ? `https://${project.latestDeployments[0].url}`
        : undefined,
    }));
  }
}

export type { VercelDeployment, VercelConfig, VercelProject } from "./types.js";
