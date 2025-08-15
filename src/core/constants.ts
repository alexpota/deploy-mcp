/**
 * Constants for deployment intelligence features
 */

// Timing constants (in milliseconds)
export const POLLING_INTERVAL_MS = 2000;
export const DEFAULT_TIMEOUT_MS = 10000;
export const MAX_DEPLOYMENT_WATCH_ATTEMPTS = 120;
export const BUILD_TIME_SECONDS_DIVISOR = 1000;
export const MAX_WATCH_TIME_MS = 240000; // 4 minutes
export const MAX_BACKOFF_DELAY_MS = 30000; // 30 seconds
export const BACKOFF_JITTER_MS = 1000; // 1 second

// Risk thresholds (percentages)
export const HIGH_RISK_THRESHOLD_PERCENT = 50;
export const MEDIUM_RISK_THRESHOLD_PERCENT = 20;

// API limits
export const DEFAULT_DEPLOYMENT_LIMIT = 10;
export const DEFAULT_COMPARISON_COUNT = 2;
export const SINGLE_DEPLOYMENT_FETCH = 1;
export const MAX_TOKENS_PER_MINUTE = 30; // Conservative rate limit
export const RATE_LIMITER_CLEANUP_AGE_MS = 3600000; // 1 hour

// Deployment states
export const DEPLOYMENT_STATES = {
  INITIALIZING: "INITIALIZING",
  BUILDING: "BUILDING",
  UPLOADING: "UPLOADING",
  DEPLOYING: "DEPLOYING",
  READY: "READY",
  ERROR: "ERROR",
  CANCELED: "CANCELED",
} as const;

// Polling intervals by state (milliseconds)
export const POLLING_INTERVALS_BY_STATE = {
  INITIALIZING: 5000, // 5s - slower at start
  BUILDING: 3000, // 3s - active building
  UPLOADING: 2000, // 2s - final stages
  DEPLOYING: 2000, // 2s - final stages
  READY: 0, // Stop polling
  ERROR: 0, // Stop polling
  CANCELED: 0, // Stop polling
  UNKNOWN: 10000, // 10s - unknown states
} as const;

// Error patterns
export const ERROR_PATTERNS = {
  ERROR_LINE: /error|Error|failed|Failed/i,
} as const;

// Log filter patterns
export const LOG_FILTERS = {
  ERROR: /error|fail|exception|critical/i,
  WARNING: /warning|warn|deprecat/i,
} as const;

// Default values
export const DEFAULTS = {
  DEPLOYMENT_ID_SLICE_LENGTH: 7,
  ERROR_LINE_TRIM_INDEX: 0,
  PERCENTAGE_MULTIPLIER: 100,
  MAX_EVENT_BUFFER_SIZE: 100,
  MAX_CACHE_SIZE: 10,
  CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
  CACHE_CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NO_TOKEN: "No token provided",
  NO_DEPLOYMENT_FOUND: "No deployment found for this project",
  DEPLOYMENT_TAKING_LONG: "⚠️ Deployment is taking longer than expected",
  NO_LOGS_AVAILABLE: "No logs available",
  NO_LOGS_MATCHING_FILTER: "No logs matching filter criteria",
} as const;

// Status icons
export const STATUS_ICONS = {
  ROCKET: "🚀",
  HOURGLASS: "⏳",
  HAMMER: "🔨",
  PACKAGE: "📦",
  GLOBE: "🌍",
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚠️",
  CHART: "📊",
  LIGHTNING: "⚡",
  TURTLE: "🐢",
  LIGHTBULB: "💡",
  PIN: "📍",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  STARTING_WATCH: (id: string) =>
    `${STATUS_ICONS.ROCKET} Starting to watch deployment ${id}...`,
  INITIALIZING: `${STATUS_ICONS.HOURGLASS} Initializing deployment...`,
  BUILDING: `${STATUS_ICONS.HAMMER} Building application...`,
  UPLOADING: `${STATUS_ICONS.PACKAGE} Uploading to edge network...`,
  DEPLOYING: `${STATUS_ICONS.GLOBE} Deploying to production...`,
  DEPLOYMENT_SUCCESS: `${STATUS_ICONS.SUCCESS} Deployment successful!`,
  DEPLOYMENT_FAILED: (message: string) =>
    `${STATUS_ICONS.ERROR} Deployment failed: ${message}`,
  BUILD_TIME_SAME: (time: number) =>
    `${STATUS_ICONS.CHART} Build time: ${time}s (same as previous)`,
  BUILD_TIME_CHANGE: (current: number, delta: number, faster: boolean) =>
    `${STATUS_ICONS.CHART} Build time: ${current}s (${Math.abs(delta)}s ${faster ? "faster" : "slower"} than previous) ${faster ? STATUS_ICONS.LIGHTNING : STATUS_ICONS.TURTLE}`,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
} as const;

// Error text patterns for API error detection
export const ERROR_TEXT_PATTERNS = {
  UNAUTHORIZED: ["401", "unauthorized"],
  NOT_FOUND: ["404", "not found"],
  RATE_LIMITED: ["429", "rate limit"],
  TIMEOUT: ["timeout", "AbortError"],
} as const;

// API event types
export const API_EVENT_TYPES = {
  STDOUT: "stdout",
  STDERR: "stderr",
} as const;

// API response messages
export const API_MESSAGES = {
  NO_LOGS_AVAILABLE: "No logs available",
  INVALID_TOKEN: "Invalid Vercel token",
  PROJECT_NOT_FOUND: "Project not found",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  REQUEST_TIMEOUT: "Request timeout",
  FAILED_TO_VALIDATE_TOKEN: "Failed to validate Vercel token",
} as const;

// API query parameters
export const API_PARAMS = {
  BUILDS: 1,
  LOGS: 1,
} as const;

// API configuration defaults
export const API_CONFIG = {
  VERCEL_BASE_URL: "https://api.vercel.com",
  DEFAULT_TIMEOUT_MS: 10000,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_DEPLOYMENT_LIMIT: 10,
  SINGLE_DEPLOYMENT_LIMIT: 1,
} as const;

// Platform names
export const PLATFORM_NAMES = {
  VERCEL: "vercel",
  NETLIFY: "netlify",
  RAILWAY: "railway",
  RENDER: "render",
} as const;

// Environment types
export const ENVIRONMENT_TYPES = {
  PRODUCTION: "production",
  PREVIEW: "preview",
  DEVELOPMENT: "development",
} as const;

// Deployment states mapping
export const VERCEL_STATES = {
  READY: "READY",
  ERROR: "ERROR",
  CANCELED: "CANCELED",
  BUILDING: "BUILDING",
  INITIALIZING: "INITIALIZING",
  QUEUED: "QUEUED",
} as const;

// Netlify deployment states from official API
// Source: https://github.com/netlify/open-api/blob/master/swagger.yml
export const NETLIFY_STATES = {
  NEW: "new",
  PENDING_REVIEW: "pending_review",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ENQUEUED: "enqueued",
  BUILDING: "building",
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  PREPARING: "preparing",
  PREPARED: "prepared",
  PROCESSING: "processing",
  PROCESSED: "processed",
  READY: "ready",
  ERROR: "error",
  RETRYING: "retrying",
} as const;

// Error messages for adapters
export const ADAPTER_ERRORS = {
  TOKEN_REQUIRED:
    "Vercel token required. Set VERCEL_TOKEN environment variable or pass token parameter.",
  FETCH_DEPLOYMENT_FAILED: "Failed to fetch deployment status from Vercel",
  UNKNOWN_STATUS: "unknown",
} as const;

export type DeploymentState =
  (typeof DEPLOYMENT_STATES)[keyof typeof DEPLOYMENT_STATES];
