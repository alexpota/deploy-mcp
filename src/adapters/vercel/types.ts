/**
 * Vercel API response types
 */
export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state:
    | "BUILDING"
    | "ERROR"
    | "INITIALIZING"
    | "QUEUED"
    | "READY"
    | "CANCELED";
  ready: number;
  createdAt: number;
  buildingAt: number;
  creator: {
    uid: string;
    username: string;
  };
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorName?: string;
  };
  target?: string;
  aliasError?: string;
}

export interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: number;
    prev?: number;
  };
}

export interface VercelUserResponse {
  user: {
    uid: string;
    email: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export interface VercelProjectResponse {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  targets?: {
    production?: {
      id: string;
      domain: string;
    };
  };
}

/**
 * Vercel adapter configuration
 */
export interface VercelConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}
