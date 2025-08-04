import { Env } from "../types.js";
import {
  validateRepository as validateGitHubRepository,
  validateParams as validateGitHubParams,
} from "../utils/github.js";

// Shields.io JSON schema for custom badges
interface ShieldsBadgeData {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  logoSvg?: string;
}

// Status colors (shared across all platforms)
const STATUS_COLORS = {
  success: "brightgreen",
  failed: "red",
  building: "yellow",
  error: "lightgrey",
  unknown: "lightgrey",
} as const;

// Platform-specific configuration
const PLATFORM_CONFIG = {
  vercel: {
    label: "Vercel",
    logo: "vercel",
  },
  netlify: {
    label: "Netlify",
    logo: "netlify",
  },
  railway: {
    label: "Railway",
    logo: "railway",
  },
} as const;

type Platform = keyof typeof PLATFORM_CONFIG;
type DeploymentStatus = "success" | "failed" | "building" | "error" | "unknown";

/**
 * Validates input parameters (with additional length checks for badge URLs)
 */
function validateParams(user: string, repo: string, platform: string): boolean {
  const validPlatforms = Object.keys(PLATFORM_CONFIG);

  // Use common validation + additional length checks for badges
  return (
    validateGitHubParams(user, repo, platform) &&
    user.length <= 50 &&
    repo.length <= 100 &&
    validPlatforms.includes(platform)
  );
}

/**
 * Gets deployment status from KV storage
 */
async function getDeploymentStatus(
  user: string,
  repo: string,
  platform: string,
  env: Env
): Promise<DeploymentStatus> {
  if (!env.BADGE_KV) {
    return "unknown"; // No KV binding configured
  }

  try {
    const key = `${user}/${repo}/${platform}`;
    const status = await env.BADGE_KV.get(key, "text");

    if (!status) return "unknown";

    // Validate status is one of our expected values
    const validStatuses: DeploymentStatus[] = [
      "success",
      "failed",
      "building",
      "error",
      "unknown",
    ];
    return validStatuses.includes(status as DeploymentStatus)
      ? (status as DeploymentStatus)
      : "unknown";
  } catch {
    return "error";
  }
}

/**
 * Generates shields.io compatible badge data
 */
export async function generateBadgeData(
  user: string,
  repo: string,
  platform: string,
  env: Env
): Promise<ShieldsBadgeData> {
  // Validate inputs
  if (!validateParams(user, repo, platform)) {
    throw new Error("Invalid parameters");
  }

  // Check if repository exists and is public
  const repoInfo = await validateGitHubRepository(user, repo);
  if (!repoInfo.exists || !repoInfo.isPublic) {
    // Return error badge for non-existent or private repositories
    return generateErrorBadge(platform, "Repository not found or private");
  }

  // Get deployment status
  const status = await getDeploymentStatus(user, repo, platform, env);
  const config = PLATFORM_CONFIG[platform as Platform];

  // Format message based on status
  const messages = {
    success: "deployed",
    failed: "failed",
    building: "deploying",
    error: "error",
    unknown: "unknown",
  };

  return {
    schemaVersion: 1,
    label: config.label,
    message: messages[status],
    color: STATUS_COLORS[status],
  };
}

/**
 * Generates error badge data
 */
export function generateErrorBadge(
  platform: string,
  message: string
): ShieldsBadgeData {
  const config = PLATFORM_CONFIG[platform as Platform];

  return {
    schemaVersion: 1,
    label: config ? config.label : platform,
    message: message,
    color: "lightgrey",
  };
}

/**
 * Updates deployment status in KV storage (for webhook use)
 */
export async function updateDeploymentStatus(
  user: string,
  repo: string,
  platform: string,
  status: DeploymentStatus,
  env: Env
): Promise<void> {
  if (!env.BADGE_KV) {
    throw new Error("KV storage not configured");
  }

  const key = `${user}/${repo}/${platform}`;
  await env.BADGE_KV.put(key, status, {
    expirationTtl: 86400 * 30, // Expire after 30 days
  });
}
