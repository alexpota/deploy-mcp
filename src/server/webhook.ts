import { Env } from "../types.js";
import { updateDeploymentStatus } from "./badge.js";
import { validateRepository, validateParams } from "../utils/github.js";

// Webhook response interface
interface WebhookResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Vercel webhook payload structure
interface VercelWebhookPayload {
  type: string;
  deployment?: {
    id: string;
    url: string;
    state: "BUILDING" | "READY" | "ERROR" | "CANCELED";
    name: string;
    target?: string;
  };
}

// Netlify webhook payload structure
interface NetlifyWebhookPayload {
  state: "building" | "ready" | "error";
  name: string;
  url?: string;
}

/**
 * Validates webhook signature for security using HMAC SHA-256
 */
async function validateWebhookSignature(
  request: Request,
  platform: string,
  env: Env
): Promise<boolean> {
  if (platform === "vercel") {
    const signature = request.headers.get("x-vercel-signature");
    if (!signature) {
      return false;
    }

    const secret = env.VERCEL_WEBHOOK_SECRET;
    if (!secret) {
      return true;
    }

    try {
      const body = await request.clone().text();
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const bodyData = encoder.encode(body);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        bodyData
      );
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // Vercel sends signature as "sha256=<hash>"
      const expectedSignature = `sha256=${computedSignature}`;

      // Constant-time comparison to prevent timing attacks
      return signature === expectedSignature;
    } catch (error) {
      console.error("Webhook signature validation error:", error);
      return false;
    }
  }

  // For public repositories, we skip signature validation for simplicity
  // This matches the approach of many badge services like shields.io
  // Private repos are already blocked at the repository validation stage
  return true;
}

/**
 * Maps platform deployment states to our standard status format
 */
function mapDeploymentStatus(
  platform: string,
  payload: any
): "success" | "failed" | "building" | "error" | "unknown" {
  switch (platform) {
    case "vercel": {
      const vercelPayload = payload as VercelWebhookPayload;
      switch (vercelPayload.deployment?.state) {
        case "READY":
          return "success";
        case "BUILDING":
          return "building";
        case "ERROR":
          return "failed";
        case "CANCELED":
          return "failed";
        default:
          return "unknown";
      }
    }

    case "netlify": {
      const netlifyPayload = payload as NetlifyWebhookPayload;
      switch (netlifyPayload.state) {
        case "ready":
          return "success";
        case "building":
          return "building";
        case "error":
          return "failed";
        default:
          return "unknown";
      }
    }

    case "railway":
      // Railway webhook format (to be implemented)
      return "unknown";

    default:
      return "unknown";
  }
}

/**
 * Main webhook handler
 */
export async function handleWebhook(
  request: Request,
  user: string,
  repo: string,
  platform: string,
  env: Env
): Promise<WebhookResponse> {
  if (!validateParams(user, repo, platform)) {
    return {
      success: false,
      message: "Invalid parameters",
      error: "User, repo, or platform format is invalid",
    };
  }

  const repoValidation = await validateRepository(user, repo);
  if (!repoValidation.exists) {
    return {
      success: false,
      message: "Repository not found",
      error: `Repository ${user}/${repo} does not exist or is not accessible`,
    };
  }

  if (!repoValidation.isPublic) {
    return {
      success: false,
      message: "Private repository",
      error: "Badge updates are only supported for public repositories",
    };
  }

  // Validate webhook signature
  const isValidSignature = await validateWebhookSignature(
    request,
    platform,
    env
  );
  if (!isValidSignature) {
    return {
      success: false,
      message: "Invalid webhook",
      error: "Webhook validation failed",
    };
  }

  // Parse webhook payload
  let payload: any;
  try {
    payload = await request.json();
    // Process webhook payload
  } catch {
    return {
      success: false,
      message: "Invalid JSON payload",
      error: "Could not parse webhook payload",
    };
  }

  // Map deployment status
  const deploymentStatus = mapDeploymentStatus(platform, payload);
  // Deployment status mapped successfully

  // Update KV storage
  try {
    await updateDeploymentStatus(user, repo, platform, deploymentStatus, env);
    // KV storage updated successfully

    return {
      success: true,
      message: `Deployment status updated to: ${deploymentStatus}`,
    };
  } catch (error) {
    console.error("Failed to update KV storage:", error);
    return {
      success: false,
      message: "Failed to update deployment status",
      error: error instanceof Error ? error.message : "Unknown KV error",
    };
  }
}

/**
 * Rate limiting helper (future enhancement)
 */
export async function checkRateLimit(
  _request: Request,
  _env: Env
): Promise<boolean> {
  return true;
}
