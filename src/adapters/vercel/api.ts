import { AdapterException } from "../base/index.js";
import type {
  VercelDeploymentsResponse,
  VercelUserResponse,
  VercelConfig,
} from "./types.js";

/**
 * Vercel API client for making HTTP requests
 */
export class VercelAPI {
  private config: VercelConfig;

  constructor(config: VercelConfig) {
    this.config = config;
  }

  /**
   * Get deployments for a project
   */
  async getDeployments(
    projectId: string,
    token: string,
    limit = 1
  ): Promise<VercelDeploymentsResponse> {
    const url = `${this.config.baseUrl}/v6/deployments?projectId=${projectId}&limit=${limit}`;

    try {
      const response = await this.makeRequest(url, token);
      return await response.json();
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to fetch deployments for project ${projectId}`
      );
    }
  }

  /**
   * Get user information to validate token
   */
  async getUser(token: string): Promise<VercelUserResponse> {
    const url = `${this.config.baseUrl}/v2/user`;

    try {
      const response = await this.makeRequest(url, token);
      return await response.json();
    } catch (error) {
      throw this.handleApiError(error, "Failed to validate Vercel token");
    }
  }

  /**
   * Make authenticated request to Vercel API
   */
  private async makeRequest(url: string, token: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "deploy-mcp/1.0.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle and categorize API errors
   */
  private handleApiError(error: unknown, context: string): AdapterException {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return new AdapterException(
          "UNAUTHORIZED",
          "Invalid Vercel token",
          error
        );
      }
      if (error.message.includes("404")) {
        return new AdapterException("NOT_FOUND", "Project not found", error);
      }
      if (error.message.includes("429")) {
        return new AdapterException(
          "RATE_LIMITED",
          "Rate limit exceeded",
          error
        );
      }
      if (error.name === "AbortError") {
        return new AdapterException("NETWORK_ERROR", "Request timeout", error);
      }
      return new AdapterException("NETWORK_ERROR", context, error);
    }

    return new AdapterException("UNKNOWN_ERROR", context);
  }
}
