/**
 * Netlify API client
 * Docs: https://docs.netlify.com/api/get-started/
 * OpenAPI Spec: https://open-api.netlify.com/
 */

import { BaseAPIClient, RequestOptions } from "../base/api-client.js";
import { NetlifyEndpoints } from "./endpoints.js";
import {
  NetlifyConfig,
  NetlifyDeploy,
  NetlifySite,
  NetlifyUser,
} from "./types.js";
import { API_CONFIG } from "../../core/constants.js";

export class NetlifyAPI extends BaseAPIClient {
  protected endpoints = NetlifyEndpoints;
  private config: NetlifyConfig;
  private siteCache = new Map<string, string>(); // name -> id cache

  constructor(config?: Partial<NetlifyConfig>) {
    const fullConfig: NetlifyConfig = {
      baseUrl: "https://api.netlify.com/api/v1",
      timeout: config?.timeout ?? API_CONFIG.DEFAULT_TIMEOUT_MS,
      retryAttempts: config?.retryAttempts ?? API_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      ...config,
    };

    super({
      baseUrl: fullConfig.baseUrl,
      timeout: fullConfig.timeout,
      retry: fullConfig.retryAttempts,
    });

    this.config = fullConfig;
  }

  /**
   * Get site ID from site name or ID
   * Netlify API requires site ID for most endpoints
   */
  private async getSiteId(
    siteNameOrId: string,
    token: string
  ): Promise<string> {
    // Check cache first
    if (this.siteCache.has(siteNameOrId)) {
      return this.siteCache.get(siteNameOrId)!;
    }

    // List all sites and find by either name or id
    const sites = await this.listSites(token);
    const site = sites.find(
      s => s.name === siteNameOrId || s.id === siteNameOrId
    );

    if (!site) {
      throw new Error(`Site not found: ${siteNameOrId}`);
    }

    // Cache and return the site ID
    this.siteCache.set(siteNameOrId, site.id);
    return site.id;
  }

  async listDeploys(
    siteNameOrId: string,
    token: string,
    limit = 10
  ): Promise<NetlifyDeploy[]> {
    const siteId = await this.getSiteId(siteNameOrId, token);

    const endpoint = {
      ...this.endpoints.listDeploys,
      path: this.endpoints.listDeploys.path.replace("{site_id}", siteId),
    };

    const options: RequestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      searchParams: {
        per_page: limit,
      },
      token,
    };

    return this.request<NetlifyDeploy[]>(endpoint, options);
  }

  async getDeploy(deployId: string, token: string): Promise<NetlifyDeploy> {
    const endpoint = {
      ...this.endpoints.getDeploy,
      path: this.endpoints.getDeploy.path.replace("{deploy_id}", deployId),
    };

    const options: RequestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      token,
    };

    return this.request<NetlifyDeploy>(endpoint, options);
  }

  async getDeployLog(deployId: string, token: string): Promise<string> {
    // Netlify deploy logs are accessed via log_access_attributes
    // First get the deploy to get log access info
    const deploy = await this.getDeploy(deployId, token);

    if (!deploy.log_access_attributes?.url) {
      throw new Error("Deploy logs not available");
    }

    // Fetch logs from the provided URL
    const response = await fetch(deploy.log_access_attributes.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    return response.text();
  }

  async getUser(token: string): Promise<NetlifyUser> {
    const options: RequestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      token,
    };

    return this.request<NetlifyUser>(this.endpoints.getUser, options);
  }

  async listSites(token: string, limit = 20): Promise<NetlifySite[]> {
    const options: RequestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      searchParams: {
        per_page: limit.toString(),
      },
      token,
    };

    return this.request<NetlifySite[]>(this.endpoints.listSites, options);
  }
}
