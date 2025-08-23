/**
 * Vercel API response types
 */
export interface VercelDeployment {
  uid: string;
  id?: string;
  name: string;
  url: string;
  state:
    | "BUILDING"
    | "ERROR"
    | "INITIALIZING"
    | "QUEUED"
    | "READY"
    | "CANCELED";
  readyState?:
    | "INITIALIZING"
    | "BUILDING"
    | "UPLOADING"
    | "DEPLOYING"
    | "READY"
    | "ERROR"
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

export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  framework?: string | null;
  gitForkProtection?: boolean;
  link?: {
    type: string;
    repo: string;
    org: string;
    repoId?: number;
  };
  latestDeployments?: Array<{
    id: string;
    url: string;
    readyState: string;
    createdAt: number;
  }>;
}

export interface VercelProjectsResponse {
  projects: VercelProject[];
  pagination: {
    count: number;
    next?: number | null;
    prev?: number | null;
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
