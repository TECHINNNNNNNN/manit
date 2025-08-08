/**
 * COMPONENT: Deployment Configuration
 * PURPOSE: Centralized configuration for Cloudflare deployment settings
 * FLOW: Environment vars → Configuration constants → Used by deployment services
 * DEPENDENCIES: Environment variables from .env
 */

// Ensure environment variables are loaded for server-side deployment
// Next.js loads .env automatically for client/pages, but not for background jobs
if (typeof window === 'undefined' && !process.env.CLOUDFLARE_ACCOUNT_ID) {
  try {
    // Explicitly load from .env file (not .env.local)
    const path = require('path');
    const dotenv = require('dotenv');
    const envPath = path.resolve(process.cwd(), '.env');
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.warn('Could not load .env file:', result.error.message);
    } else {
      console.log('Loaded environment variables from .env for Cloudflare deployment');
    }
  } catch (e) {
    console.warn('dotenv not available - using existing process.env');
  }
}

export const deploymentConfig = {
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    projectPrefix: process.env.CLOUDFLARE_PROJECT_PREFIX || 'manit',
  },
  
  // Deployment settings
  deployment: {
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    timeout: 120000, // 2 minutes
    maxFileSize: 25 * 1024 * 1024, // 25MB (Cloudflare limit)
  },
  
  // Temporary file management
  tempFiles: {
    basePath: '/tmp/manit-deployments',
    cleanupDelay: 5000, // 5 seconds after deployment
  }
};

/**
 * Validates that all required environment variables are set
 * Call this on startup to ensure configuration is valid
 */
export const validateDeploymentConfig = () => {
  const required = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_API_TOKEN',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for deployment: ${missing.join(', ')}`
    );
  }
};