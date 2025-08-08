/**
 * COMPONENT: Cloudflare Deployment Errors
 * PURPOSE: Custom error classes and functional error handling for deployment failures
 * FLOW: Deployment attempt → Error occurs → Categorize error → Handle appropriately
 * DEPENDENCIES: None
 */

// Error classes (following JS best practices for proper instanceof and stack traces)
export class CloudflareDeploymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'CloudflareDeploymentError';
  }
}

// Specific error types
class RateLimitError extends CloudflareDeploymentError {
  constructor(message = 'Cloudflare rate limit exceeded') {
    super(message, 'RATE_LIMIT', true);
  }
}

class FileSizeError extends CloudflareDeploymentError {
  constructor(message = 'File size exceeds Cloudflare limit') {
    super(message, 'FILE_SIZE', false);
  }
}

class AuthenticationError extends CloudflareDeploymentError {
  constructor(message = 'Cloudflare authentication failed') {
    super(message, 'AUTH_FAILED', false);
  }
}

class NetworkError extends CloudflareDeploymentError {
  constructor(message = 'Network error during deployment') {
    super(message, 'NETWORK_ERROR', true);
  }
}

// ============================================================
// FUNCTIONAL HELPERS - Use these instead of direct class instantiation
// ============================================================

/**
 * Creates a rate limit error
 */
export const createRateLimitError = (message?: string) => 
  new RateLimitError(message);

/**
 * Creates a file size error
 */
export const createFileSizeError = (message?: string) => 
  new FileSizeError(message);

/**
 * Creates an authentication error
 */
export const createAuthError = (message?: string) => 
  new AuthenticationError(message);

/**
 * Creates a network error
 */
export const createNetworkError = (message?: string) => 
  new NetworkError(message);

/**
 * Creates a generic deployment error
 */
export const createDeploymentError = (
  message: string, 
  code: string, 
  retryable = false
) => new CloudflareDeploymentError(message, code, retryable);

/**
 * Parses Wrangler CLI output to determine error type
 * Returns appropriate error instance based on stderr content
 */
export const parseWranglerError = (stderr: string): CloudflareDeploymentError => {
  // Check for common error patterns
  if (stderr.includes('rate limit') || stderr.includes('Too Many Requests')) {
    return createRateLimitError();
  }
  
  if (stderr.includes('authentication') || stderr.includes('unauthorized') || 
      stderr.includes('API token') || stderr.includes('invalid token')) {
    return createAuthError(`Authentication failed: ${stderr}`);
  }
  
  if (stderr.includes('file size') || stderr.includes('too large')) {
    return createFileSizeError();
  }
  
  if (stderr.includes('network') || stderr.includes('timeout') || 
      stderr.includes('ECONNRESET') || stderr.includes('ETIMEDOUT')) {
    return createNetworkError();
  }
  
  // Project-specific errors (retryable)
  if (stderr.includes('Project not found') || stderr.includes('does not exist') ||
      stderr.includes('already exists') || stderr.includes('name is already taken')) {
    return createDeploymentError(
      `Project configuration error: ${stderr}`,
      'PROJECT_ERROR',
      true
    );
  }
  
  // Wrangler command errors (usually retryable)
  if (stderr.includes('Command failed') || stderr.includes('Error:')) {
    return createDeploymentError(
      `Wrangler command failed: ${stderr}`,
      'COMMAND_ERROR',  
      true
    );
  }
  
  // Generic error
  return createDeploymentError(
    `Deployment failed: ${stderr}`,
    'UNKNOWN',
    true // Assume retryable by default
  );
};

/**
 * Checks if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  return error instanceof CloudflareDeploymentError && error.retryable;
};

/**
 * Gets error code from a deployment error
 */
export const getErrorCode = (error: unknown): string | null => {
  return error instanceof CloudflareDeploymentError ? error.code : null;
};

/**
 * Implements exponential backoff for retries
 */
export const calculateBackoffDelay = (
  attemptNumber: number,
  baseDelay: number = 2000
): number => {
  // Exponential backoff: 2s, 4s, 8s, 16s...
  return Math.min(baseDelay * Math.pow(2, attemptNumber), 30000); // Max 30 seconds
};