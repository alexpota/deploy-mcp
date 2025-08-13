import {
  API_CONFIG,
  MAX_TOKENS_PER_MINUTE,
  RATE_LIMITER_CLEANUP_AGE_MS,
  MAX_BACKOFF_DELAY_MS,
  BACKOFF_JITTER_MS,
} from "../../core/constants.js";

interface RateLimiter {
  tokens: number;
  lastRefill: number;
  refillRate: number;
}

export class RateLimitError extends Error {
  constructor(
    public readonly retryAfter: number,
    public readonly endpoint: string
  ) {
    super(`Rate limit exceeded for ${endpoint}. Retry after ${retryAfter}ms`);
    this.name = "RateLimitError";
  }
}

export class HTTPError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly method: string
  ) {
    super(`${method} ${url} failed with ${statusCode}: ${statusText}`);
    this.name = "HTTPError";
    Error.captureStackTrace(this, HTTPError);
  }
}

export interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  docsUrl: string;
  description: string;
}

export interface APIClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  searchParams?: Record<string, string | number | boolean>;
  body?: unknown;
  signal?: AbortSignal;
  token?: string; // Optional token for rate limiting
}

export abstract class BaseAPIClient {
  private readonly baseUrl: URL;
  private readonly defaultHeaders: Headers;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly pendingRequests = new Map<string, Promise<any>>();
  private readonly rateLimiters = new Map<string, RateLimiter>();
  private readonly maxTokensPerMinute = MAX_TOKENS_PER_MINUTE;

  protected abstract endpoints: Record<string, APIEndpoint>;

  constructor(config: APIClientConfig) {
    this.baseUrl = new URL(config.baseUrl);

    this.defaultHeaders = new Headers({
      "Content-Type": "application/json",
      "User-Agent": "deploy-mcp/1.0.0",
      ...config.headers,
    });

    this.timeout = config.timeout ?? API_CONFIG.DEFAULT_TIMEOUT_MS;
    this.maxRetries = config.retry ?? API_CONFIG.DEFAULT_RETRY_ATTEMPTS;
  }

  protected async request<T>(
    endpoint: APIEndpoint,
    options?: RequestOptions
  ): Promise<T> {
    // Check rate limit if token provided
    if (options?.token) {
      await this.checkRateLimit(options.token, endpoint.path);
    }

    const cacheKey = this.getCacheKey(endpoint, options);

    if (endpoint.method === "GET" && !options?.body) {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending;
      }
    }

    const requestPromise = this.executeRequest<T>(endpoint, options);

    if (endpoint.method === "GET" && !options?.body) {
      this.pendingRequests.set(cacheKey, requestPromise);
      requestPromise.finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    }

    return requestPromise;
  }

  private async executeRequest<T>(
    endpoint: APIEndpoint,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint.path, options?.searchParams);
    const headers = this.mergeHeaders(options?.headers);

    let lastError: Error = new Error("No attempts made");

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method: endpoint.method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: options?.signal,
        });

        if (!response.ok) {
          throw new HTTPError(
            response.status,
            response.statusText,
            url.toString(),
            endpoint.method
          );
        }

        const text = await response.text();
        if (!text) {
          return {} as T;
        }

        try {
          return JSON.parse(text) as T;
        } catch {
          throw new Error(
            `Invalid JSON response from ${endpoint.path}: ${text.slice(0, 100)}`
          );
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (
          (error instanceof HTTPError &&
            error.statusCode >= 400 &&
            error.statusCode < 500) ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          throw this.enhanceError(lastError, endpoint);
        }

        if (attempt === this.maxRetries) {
          throw this.enhanceError(lastError, endpoint);
        }

        // Exponential backoff with max cap
        const baseDelay = Math.min(
          1000 * Math.pow(2, attempt),
          MAX_BACKOFF_DELAY_MS
        );
        const jitter = Math.random() * BACKOFF_JITTER_MS;
        const totalDelay = Math.min(baseDelay + jitter, MAX_BACKOFF_DELAY_MS);
        await this.delay(totalDelay);
      }
    }

    throw this.enhanceError(lastError, endpoint);
  }

  private async fetchWithTimeout(
    url: URL,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();

    if (init.signal) {
      init.signal.addEventListener("abort", () => controller.abort());
    }

    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
        keepalive: true,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean>
  ): URL {
    const url = new URL(path, this.baseUrl);

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      url.search = searchParams.toString();
    }

    return url;
  }

  private mergeHeaders(headers?: Record<string, string>): Headers {
    if (!headers) {
      return this.defaultHeaders;
    }

    const merged = new Headers(this.defaultHeaders);
    for (const [key, value] of Object.entries(headers)) {
      merged.set(key, value);
    }
    return merged;
  }

  private enhanceError(error: Error, endpoint: APIEndpoint): Error {
    const enhanced = new Error(
      `API request failed for ${endpoint.path}: ${error.message}\n` +
        `See docs: ${endpoint.docsUrl}`
    );
    enhanced.stack = error.stack;
    enhanced.cause = error;
    return enhanced;
  }

  private getCacheKey(endpoint: APIEndpoint, options?: RequestOptions): string {
    const params = options?.searchParams
      ? JSON.stringify(options.searchParams)
      : "";
    return `${endpoint.method}:${endpoint.path}:${params}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRateLimiter(token: string): RateLimiter {
    if (!this.rateLimiters.has(token)) {
      this.rateLimiters.set(token, {
        tokens: this.maxTokensPerMinute,
        lastRefill: Date.now(),
        refillRate: this.maxTokensPerMinute,
      });
    }
    return this.rateLimiters.get(token)!;
  }

  private async checkRateLimit(token: string, endpoint: string): Promise<void> {
    const limiter = this.getRateLimiter(token);
    const now = Date.now();
    const timeSinceLastRefill = now - limiter.lastRefill;
    const minutesElapsed = timeSinceLastRefill / 60000;

    // Refill tokens based on time elapsed
    const tokensToAdd = minutesElapsed * limiter.refillRate;
    limiter.tokens = Math.min(
      this.maxTokensPerMinute,
      limiter.tokens + tokensToAdd
    );
    limiter.lastRefill = now;

    // Check if we have tokens available
    if (limiter.tokens < 1) {
      const waitTime = (1 - limiter.tokens) * (60000 / limiter.refillRate);
      throw new RateLimitError(Math.ceil(waitTime), endpoint);
    }

    // Consume a token
    limiter.tokens -= 1;
  }

  // Clean up old rate limiters to prevent memory leak
  protected cleanupRateLimiters(): void {
    const now = Date.now();
    const maxAge = RATE_LIMITER_CLEANUP_AGE_MS;

    for (const [token, limiter] of this.rateLimiters.entries()) {
      if (now - limiter.lastRefill > maxAge) {
        this.rateLimiters.delete(token);
      }
    }
  }
}
