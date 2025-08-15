import { DeploymentStatus } from "../../types.js";

/**
 * Base interface for all platform adapters
 */
export interface PlatformAdapter {
  name: string;
  getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus>;
  authenticate(token: string): Promise<boolean>;
}

/**
 * Configuration interface for adapters
 */
export interface AdapterConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Common error types across all adapters
 */
export type AdapterError =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR"
  | "UNKNOWN";

export class AdapterException extends Error {
  constructor(
    public type: AdapterError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AdapterException";
  }
}
