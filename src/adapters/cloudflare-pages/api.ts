import { BaseAPIClient, APIEndpoint } from "../base/api-client.js";
import { CloudflarePagesEndpoints } from "./endpoints.js";
import {
  CloudflarePagesProject,
  CloudflarePagesDeployment,
  CloudflarePagesListProjectsResponse,
  CloudflarePagesListDeploymentsResponse,
  CloudflarePagesGetProjectResponse,
  CloudflarePagesGetDeploymentResponse,
  CloudflarePagesGetLogsResponse,
} from "./types.js";

export class CloudflarePagesAPI extends BaseAPIClient {
  private readonly accountId: string;
  private readonly apiToken: string;

  protected endpoints: Record<string, APIEndpoint> = {
    listProjects: {
      path: "", // Will be set dynamically
      method: "GET",
      docsUrl: CloudflarePagesEndpoints.docs.api,
      description: "List all Cloudflare Pages projects",
    },
    getProject: {
      path: "pages/projects/{projectName}",
      method: "GET",
      docsUrl: CloudflarePagesEndpoints.docs.api,
      description: "Get details for a specific project",
    },
    listDeployments: {
      path: "pages/projects/{projectName}/deployments",
      method: "GET",
      docsUrl: CloudflarePagesEndpoints.docs.deployments,
      description: "List deployments for a project",
    },
    getDeployment: {
      path: "pages/projects/{projectName}/deployments/{deploymentId}",
      method: "GET",
      docsUrl: CloudflarePagesEndpoints.docs.deployments,
      description: "Get details for a specific deployment",
    },
    getDeploymentLogs: {
      path: "pages/projects/{projectName}/deployments/{deploymentId}/history/logs",
      method: "GET",
      docsUrl: CloudflarePagesEndpoints.docs.deployments,
      description: "Get logs for a deployment",
    },
    createDeployment: {
      path: "pages/projects/{projectName}/deployments",
      method: "POST",
      docsUrl: CloudflarePagesEndpoints.docs.deployments,
      description: "Create a new deployment",
    },
    retryDeployment: {
      path: "pages/projects/{projectName}/deployments/{deploymentId}/retry",
      method: "POST",
      docsUrl: CloudflarePagesEndpoints.docs.deployments,
      description: "Retry a failed deployment",
    },
  };

  constructor(accountId: string, apiToken: string) {
    super({
      baseUrl: CloudflarePagesEndpoints.base,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      timeout: 30000,
      retry: 3,
    });
    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  private cleanPath(path: string): string {
    // Remove leading slash to work with BaseAPIClient's URL building
    return path.startsWith("/") ? path.slice(1) : path;
  }

  async listProjects(options?: {
    page?: number;
    perPage?: number;
  }): Promise<CloudflarePagesProject[]> {
    const endpoint = this.endpoints.listProjects;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.listProjects(this.accountId)
    );

    const response = await this.request<CloudflarePagesListProjectsResponse>(
      { ...endpoint, path },
      {
        searchParams:
          options?.page || options?.perPage
            ? {
                ...(options.page && { page: options.page }),
                ...(options.perPage && { per_page: options.perPage }),
              }
            : undefined,
        token: this.apiToken,
      }
    );

    if (!response.success) {
      throw new Error(
        `Failed to list projects: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }

  async getProject(projectName: string): Promise<CloudflarePagesProject> {
    const endpoint = this.endpoints.getProject;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.getProject(this.accountId, projectName)
    );

    const response = await this.request<CloudflarePagesGetProjectResponse>(
      { ...endpoint, path },
      { token: this.apiToken }
    );

    if (!response.success) {
      throw new Error(
        `Failed to get project ${projectName}: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }

  async listDeployments(
    projectName: string,
    options?: {
      page?: number;
      perPage?: number;
      environment?: "production" | "preview";
    }
  ): Promise<CloudflarePagesDeployment[]> {
    const endpoint = this.endpoints.listDeployments;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.listDeployments(this.accountId, projectName)
    );

    const searchParams: Record<string, any> = {};

    if (options?.page) {
      searchParams.page = options.page;
    }

    if (options?.perPage) {
      searchParams.per_page = options.perPage;
    }

    if (options?.environment) {
      searchParams.env = options.environment;
    }

    const response = await this.request<CloudflarePagesListDeploymentsResponse>(
      { ...endpoint, path },
      {
        searchParams,
        token: this.apiToken,
      }
    );

    if (!response.success) {
      throw new Error(
        `Failed to list deployments for ${projectName}: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }

  async getDeployment(
    projectName: string,
    deploymentId: string
  ): Promise<CloudflarePagesDeployment> {
    const endpoint = this.endpoints.getDeployment;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.getDeployment(
        this.accountId,
        projectName,
        deploymentId
      )
    );

    const response = await this.request<CloudflarePagesGetDeploymentResponse>(
      { ...endpoint, path },
      { token: this.apiToken }
    );

    if (!response.success) {
      throw new Error(
        `Failed to get deployment ${deploymentId}: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }

  async getLatestDeployment(
    projectName: string,
    environment: "production" | "preview" = "production"
  ): Promise<CloudflarePagesDeployment | null> {
    const deployments = await this.listDeployments(projectName, {
      environment,
    });

    return deployments[0] || null;
  }

  async getDeploymentLogs(
    projectName: string,
    deploymentId: string
  ): Promise<CloudflarePagesGetLogsResponse> {
    const endpoint = this.endpoints.getDeploymentLogs;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.getDeploymentLogs(
        this.accountId,
        projectName,
        deploymentId
      )
    );

    const response = await this.request<CloudflarePagesGetLogsResponse>(
      { ...endpoint, path },
      { token: this.apiToken }
    );

    if (!response.success) {
      throw new Error(
        `Failed to get deployment logs: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response;
  }

  async createDeployment(
    projectName: string,
    branch?: string
  ): Promise<CloudflarePagesDeployment> {
    const endpoint = this.endpoints.createDeployment;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.createDeployment(this.accountId, projectName)
    );

    const body = branch ? { branch } : {};

    const response = await this.request<CloudflarePagesGetDeploymentResponse>(
      { ...endpoint, path },
      {
        body,
        token: this.apiToken,
      }
    );

    if (!response.success) {
      throw new Error(
        `Failed to create deployment: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }

  async retryDeployment(
    projectName: string,
    deploymentId: string
  ): Promise<CloudflarePagesDeployment> {
    const endpoint = this.endpoints.retryDeployment;
    const path = this.cleanPath(
      CloudflarePagesEndpoints.retryDeployment(
        this.accountId,
        projectName,
        deploymentId
      )
    );

    const response = await this.request<CloudflarePagesGetDeploymentResponse>(
      { ...endpoint, path },
      { token: this.apiToken }
    );

    if (!response.success) {
      throw new Error(
        `Failed to retry deployment: ${response.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.result;
  }
}
