import { BaseAPIClient } from "../base/api-client.js";
import { AdapterException } from "../base/index.js";
import { VercelEndpoints } from "./endpoints.js";
import {
  API_EVENT_TYPES,
  API_MESSAGES,
  API_PARAMS,
  ERROR_TEXT_PATTERNS,
} from "../../core/constants.js";
import type {
  VercelDeploymentsResponse,
  VercelUserResponse,
  VercelConfig,
  VercelDeployment,
} from "./types.js";

export class VercelAPI extends BaseAPIClient {
  protected endpoints = VercelEndpoints;
  private config: VercelConfig;

  constructor(config: VercelConfig) {
    super({
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      retry: config.retryAttempts,
    });
    this.config = config;
  }

  async getDeployments(
    projectId: string,
    token: string,
    limit = 1
  ): Promise<VercelDeploymentsResponse> {
    try {
      return await this.request<VercelDeploymentsResponse>(
        this.endpoints.listDeployments,
        {
          searchParams: { projectId, limit },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          token, // Pass token for rate limiting
        }
      );
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to fetch deployments for project ${projectId}`
      );
    }
  }

  async getUser(token: string): Promise<VercelUserResponse> {
    try {
      return await this.request<VercelUserResponse>(this.endpoints.getUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        token, // Pass token for rate limiting
      });
    } catch (error) {
      throw this.handleApiError(error, API_MESSAGES.FAILED_TO_VALIDATE_TOKEN);
    }
  }

  async getDeploymentById(
    deploymentId: string,
    token: string
  ): Promise<VercelDeployment> {
    try {
      const endpoint = {
        ...this.endpoints.getDeployment,
        path: `${this.endpoints.getDeployment.path}/${deploymentId}`,
      };

      return await this.request<VercelDeployment>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        token, // Pass token for rate limiting
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to fetch deployment ${deploymentId}`
      );
    }
  }

  async getDeploymentLogs(
    deploymentId: string,
    token: string
  ): Promise<string> {
    try {
      const endpoint = {
        ...this.endpoints.getDeploymentEvents,
        path: `${this.endpoints.getDeploymentEvents.path}/${deploymentId}/events`,
      };

      const response = await this.request<any[]>(endpoint, {
        searchParams: {
          builds: API_PARAMS.BUILDS,
          logs: API_PARAMS.LOGS,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        token, // Pass token for rate limiting
      });

      if (!response || !Array.isArray(response)) {
        return API_MESSAGES.NO_LOGS_AVAILABLE;
      }

      const logs = response
        .filter(
          (event: any) =>
            event.type === API_EVENT_TYPES.STDOUT ||
            event.type === API_EVENT_TYPES.STDERR
        )
        .map((event: any) => event.payload?.text || event.text || "")
        .join("\n");

      // Sanitize logs for safe display (remove potential XSS vectors)
      const sanitizedLogs = logs
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

      return sanitizedLogs || API_MESSAGES.NO_LOGS_AVAILABLE;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to fetch logs for deployment ${deploymentId}`
      );
    }
  }

  private handleApiError(error: unknown, context: string): AdapterException {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        ERROR_TEXT_PATTERNS.UNAUTHORIZED.some(pattern =>
          message.includes(pattern)
        )
      ) {
        return new AdapterException(
          "UNAUTHORIZED",
          API_MESSAGES.INVALID_TOKEN,
          error
        );
      }

      if (
        ERROR_TEXT_PATTERNS.NOT_FOUND.some(pattern => message.includes(pattern))
      ) {
        return new AdapterException(
          "NOT_FOUND",
          API_MESSAGES.PROJECT_NOT_FOUND,
          error
        );
      }

      if (
        ERROR_TEXT_PATTERNS.RATE_LIMITED.some(pattern =>
          message.includes(pattern)
        )
      ) {
        return new AdapterException(
          "RATE_LIMITED",
          API_MESSAGES.RATE_LIMIT_EXCEEDED,
          error
        );
      }

      if (
        ERROR_TEXT_PATTERNS.TIMEOUT.some(
          pattern => message.includes(pattern) || error.name === pattern
        )
      ) {
        return new AdapterException(
          "NETWORK_ERROR",
          API_MESSAGES.REQUEST_TIMEOUT,
          error
        );
      }

      return new AdapterException("NETWORK_ERROR", context, error);
    }

    return new AdapterException("UNKNOWN_ERROR", context);
  }
}
