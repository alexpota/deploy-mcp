/**
 * Netlify adapter for deployment tracking
 * Docs: https://docs.netlify.com/api/get-started/
 */

import { BaseAdapter } from "../base/adapter.js";
import { DeploymentStatus } from "../../types.js";
import { NetlifyAPI } from "./api.js";
import { NetlifyDeploy, NetlifyDeployState } from "./types.js";
import { AdapterException } from "../base/types.js";
import { PLATFORM } from "../../core/constants.js";

export class NetlifyAdapter extends BaseAdapter {
  name = PLATFORM.NETLIFY;
  private api: NetlifyAPI;

  constructor() {
    super();
    this.api = new NetlifyAPI();
  }

  /**
   * Map Netlify deploy states to our standard states
   * Source: https://github.com/netlify/open-api/blob/master/swagger.yml
   */
  private mapState(state: NetlifyDeployState): DeploymentStatus["status"] {
    switch (state) {
      case "ready":
      case "processed":
        return "success";

      case "error":
      case "rejected":
        return "failed";

      case "new":
      case "pending_review":
      case "accepted":
      case "enqueued":
      case "building":
      case "uploading":
      case "uploaded":
      case "preparing":
      case "prepared":
      case "processing":
      case "retrying":
        return "building";

      default:
        return "unknown";
    }
  }

  /**
   * Transform Netlify deploy to our standard format
   */
  private transformDeploy(deploy: NetlifyDeploy): DeploymentStatus {
    const status = this.mapState(deploy.state);

    // Calculate duration if available
    let duration: number | undefined;
    if (deploy.created_at && deploy.published_at) {
      duration = this.calculateDuration(deploy.created_at, deploy.published_at);
    } else if (deploy.deploy_time) {
      duration = Math.round(deploy.deploy_time / 1000); // Convert ms to seconds
    }

    return {
      id: deploy.id,
      status,
      url:
        deploy.ssl_url ||
        deploy.url ||
        deploy.deploy_ssl_url ||
        deploy.deploy_url,
      projectName: deploy.name || deploy.site_id,
      platform: "netlify",
      timestamp: this.formatTimestamp(deploy.created_at),
      duration,
      environment: deploy.context || "production",
      commit: deploy.commit_ref
        ? {
            sha: deploy.commit_ref,
            message: deploy.title,
          }
        : undefined,
    };
  }

  async getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus> {
    const apiToken = token || process.env.NETLIFY_TOKEN;

    if (!apiToken) {
      throw new AdapterException(
        "UNAUTHORIZED",
        "Netlify token required. Set NETLIFY_TOKEN environment variable or pass token parameter."
      );
    }

    try {
      const deploys = await this.api.listDeploys(project, apiToken, 1);

      if (!deploys || deploys.length === 0) {
        throw new AdapterException(
          "NOT_FOUND",
          `No deployments found for site: ${project}`
        );
      }

      return this.transformDeploy(deploys[0]);
    } catch (error) {
      if (error instanceof AdapterException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("Site not found")) {
        throw new AdapterException(
          "NOT_FOUND",
          `Site not found: ${project}. Make sure the site name is correct.`
        );
      }

      if (message.includes("401") || message.includes("Unauthorized")) {
        throw new AdapterException(
          "UNAUTHORIZED",
          "Invalid Netlify token. Check your NETLIFY_TOKEN."
        );
      }

      throw new AdapterException("UNKNOWN", `Netlify API error: ${message}`);
    }
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const user = await this.api.getUser(token);
      return !!user.id;
    } catch {
      return false;
    }
  }

  async getDeploymentById(
    deploymentId: string,
    token: string
  ): Promise<NetlifyDeploy> {
    try {
      return await this.api.getDeploy(deploymentId, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new AdapterException(
        "NOT_FOUND",
        `Deployment not found: ${deploymentId}. ${message}`
      );
    }
  }

  async getRecentDeployments(
    project: string,
    token: string,
    limit = 10
  ): Promise<NetlifyDeploy[]> {
    try {
      return await this.api.listDeploys(project, token, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("Site not found")) {
        throw new AdapterException("NOT_FOUND", `Site not found: ${project}`);
      }

      throw new AdapterException(
        "UNKNOWN",
        `Failed to fetch deployments: ${message}`
      );
    }
  }

  async getDeploymentLogs(
    deploymentId: string,
    token: string
  ): Promise<string> {
    try {
      return await this.api.getDeployLog(deploymentId, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("not available")) {
        return "Deploy logs not available for this deployment.";
      }

      throw new AdapterException(
        "UNKNOWN",
        `Failed to fetch deployment logs: ${message}`
      );
    }
  }

  async listProjects(
    token: string,
    limit = 20
  ): Promise<Array<{ id: string; name: string; url?: string }>> {
    const sites = await this.api.listSites(token, limit);

    return sites.map(site => ({
      id: site.id,
      name: site.name,
      url: site.ssl_url || site.url || undefined,
    }));
  }
}
