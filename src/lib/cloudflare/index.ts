/**
 * COMPONENT: Cloudflare Deployment Service
 * PURPOSE: Deploy static files to Cloudflare Pages programmatically
 * FLOW: Files JSON → Temp directory → Wrangler deploy → Cleanup → Return URL
 * DEPENDENCIES: fs-extra, child_process, deployment config
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import { deploymentConfig } from '@/config/deployment';
import { generateCloudflareProjectName } from './naming';
import { 
  parseWranglerError, 
  isRetryableError, 
  calculateBackoffDelay,
  createFileSizeError,
  createDeploymentError 
} from './errors';

const execAsync = promisify(exec);

/**
 * Validates Cloudflare API token by attempting to list accounts
 * @returns true if token is valid, false otherwise
 */
export const validateApiToken = async (): Promise<boolean> => {
  const { accountId, apiToken } = deploymentConfig.cloudflare;
  
  if (!accountId || !apiToken) {
    console.error('Missing Cloudflare credentials');
    return false;
  }
  
  try {
    const command = `npx wrangler whoami`;
    const env = {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_API_TOKEN: apiToken,
    };
    
    const { stdout, stderr } = await execAsync(command, {
      env,
      timeout: 10000, // 10 second timeout
    });
    
    console.log('API Token validation result:', stdout);
    
    // Check if authentication was successful
    if (stdout.includes('You are logged in') || stdout.includes(accountId)) {
      console.log('✅ Cloudflare API token validated successfully');
      return true;
    }
    
    console.error('❌ API token validation failed:', stderr || stdout);
    return false;
  } catch (error: any) {
    console.error('❌ Failed to validate API token:', error.message);
    return false;
  }
};

/**
 * Prepares files for deployment by writing them to a temporary directory
 * @param files - Object with file paths as keys and content as values
 * @param projectId - Unique project identifier
 * @returns Path to the temporary directory containing files
 */
export const prepareFilesForDeployment = async (
  files: Record<string, string>,
  projectId: string
): Promise<string> => {
  const tempDir = path.join(deploymentConfig.tempFiles.basePath, projectId);
  
  try {
    // Ensure temp directory exists
    await fs.ensureDir(tempDir);
    
    // Check total size before writing
    let totalSize = 0;
    
    // Write each file to temp directory
    for (const [filePath, content] of Object.entries(files)) {
      // Calculate size
      const fileSize = Buffer.byteLength(content, 'utf8');
      totalSize += fileSize;
      
      // Check if we exceed the limit
      if (totalSize > deploymentConfig.deployment.maxFileSize) {
        throw createFileSizeError(
          `Total file size (${totalSize} bytes) exceeds limit of ${deploymentConfig.deployment.maxFileSize} bytes`
        );
      }
      
      // Create full file path
      const fullPath = path.join(tempDir, filePath);
      
      // Ensure directory exists for the file
      await fs.ensureDir(path.dirname(fullPath));
      
      // Write file
      await fs.writeFile(fullPath, content, 'utf8');
    }
    
    console.log(`Prepared ${Object.keys(files).length} files in ${tempDir}`);
    return tempDir;
  } catch (error) {
    // Clean up on error
    await cleanupTempFiles(tempDir).catch(console.error);
    throw error;
  }
};

/**
 * Creates a Cloudflare Pages project if it doesn't exist
 * @param projectName - Cloudflare project name
 * @returns true if created or already exists
 */
const ensureProjectExists = async (projectName: string): Promise<boolean> => {
  const { accountId, apiToken } = deploymentConfig.cloudflare;
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_API_TOKEN: apiToken,
  };
  
  try {
    console.log(`Ensuring project exists: ${projectName}`);
    
    // Try to create the project with production branch
    const createCommand = `npx wrangler pages project create ${projectName} --production-branch=main`;
    const { stdout, stderr } = await execAsync(createCommand, {
      env,
      timeout: 30000, // 30 second timeout
    });
    
    console.log(`✅ Project created: ${projectName}`);
    console.log('Create stdout:', stdout);
    return true;
  } catch (error: any) {
    console.log('Project creation error details:', {
      message: error.message,
      stdout: error.stdout,
      stderr: error.stderr,
      code: error.code
    });
    
    // Check if project already exists (this is okay)
    const errorOutput = error.stderr || error.stdout || error.message || '';
    if (errorOutput.includes('already exists') || errorOutput.includes('name is already taken')) {
      console.log(`ℹ️ Project already exists: ${projectName}`);
      return true;
    }
    
    // Check for authentication issues
    if (errorOutput.includes('authentication') || errorOutput.includes('unauthorized')) {
      throw createAuthError(`Project creation failed: ${errorOutput}`);
    }
    
    // For other errors, still try to continue but log them properly
    console.warn(`Warning: Could not create project ${projectName}: ${errorOutput}`);
    console.warn(`Attempting deployment anyway - project may exist or be created during deploy`);
    return false;
  }
};

/**
 * Deploys files to Cloudflare Pages using Wrangler CLI
 * @param projectName - Cloudflare project name
 * @param filesPath - Path to directory containing files to deploy
 * @returns Deployment URL
 */
export const deployToCloudflare = async (
  projectName: string,
  filesPath: string
): Promise<string> => {
  const { accountId, apiToken } = deploymentConfig.cloudflare;
  
  // Ensure project exists first
  await ensureProjectExists(projectName);
  
  // Build the wrangler command (removed --log-level debug as it's not recognized)
  const command = `npx wrangler pages deploy "${filesPath}" --project-name="${projectName}" --commit-dirty=true`;
  
  // Set environment variables for authentication and debugging
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_API_TOKEN: apiToken,
    WRANGLER_LOG: 'debug', // Enable debug logging
  };
  
  try {
    console.log(`Deploying to Cloudflare Pages project: ${projectName}`);
    console.log(`Command: ${command}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`API Token: ${apiToken ? `${apiToken.substring(0, 10)}...` : 'NOT SET'}`);
    
    const { stdout, stderr } = await execAsync(command, {
      env,
      timeout: deploymentConfig.deployment.timeout,
    });
    
    // Log all output for debugging
    console.log('=== Wrangler stdout ===');
    console.log(stdout);
    console.log('=== Wrangler stderr ===');
    console.log(stderr);
    console.log('======================');
    
    // Parse deployment URL from output
    // Wrangler typically outputs: "✨ Deployment complete! https://[hash].[project].pages.dev"
    const urlMatch = stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
    
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      console.log(`Deployment successful: ${deploymentUrl}`);
      return deploymentUrl;
    }
    
    // If no URL found in stdout, throw error with full output
    throw createDeploymentError(
      `Could not parse deployment URL from Wrangler output. Stdout: ${stdout}. Stderr: ${stderr}`,
      'PARSE_ERROR',
      false
    );
  } catch (error: any) {
    console.error('=== Deployment Error Details ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stderr:', error.stderr);
    console.error('Error stdout:', error.stdout);
    console.error('Error cmd:', error.cmd);
    console.error('================================');
    
    // Parse the error - check multiple places where stderr might be
    let errorMessage = '';
    
    if (error.stderr) {
      errorMessage = error.stderr;
    } else if (error.stdout) {
      errorMessage = error.stdout;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }
    
    // If still empty, provide more context
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = `Command failed with exit code ${error.code || 'unknown'}. No error output captured.`;
    }
    
    // Special handling for project not found errors
    if (errorMessage.includes('Project not found') || errorMessage.includes('does not exist')) {
      console.log('Project not found - attempting to recreate project before retry');
      try {
        // Force create the project again
        const forceCreateCommand = `npx wrangler pages project create ${projectName} --production-branch=main`;
        await execAsync(forceCreateCommand, {
          env,
          timeout: 30000,
        });
        console.log('Project recreated, retrying deployment...');
        // Retry the deployment once more
        const retryResult = await execAsync(command, {
          env,
          timeout: deploymentConfig.deployment.timeout,
        });
        
        const urlMatch = retryResult.stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
        if (urlMatch) {
          const deploymentUrl = urlMatch[0];
          console.log(`Deployment successful after project recreation: ${deploymentUrl}`);
          return deploymentUrl;
        }
      } catch (retryError: any) {
        console.error('Failed to recreate project and retry:', retryError);
        // Fall through to original error handling
      }
    }
    
    throw parseWranglerError(errorMessage);
  }
};

/**
 * Deploys with retry logic
 * @param projectName - Cloudflare project name
 * @param filesPath - Path to directory containing files
 * @param maxRetries - Maximum number of retry attempts
 * @returns Deployment URL
 */
export const deployWithRetry = async (
  projectName: string,
  filesPath: string,
  maxRetries: number = deploymentConfig.deployment.maxRetries
): Promise<string> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If this is a retry, wait with exponential backoff
      if (attempt > 0) {
        const delay = calculateBackoffDelay(attempt - 1);
        console.log(`Retry attempt ${attempt} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Attempt deployment
      return await deployToCloudflare(projectName, filesPath);
    } catch (error) {
      lastError = error as Error;
      
      // If error is not retryable, throw immediately
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Deployment failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
    }
  }
  
  // Should never reach here, but TypeScript needs this
  throw lastError || createDeploymentError('Deployment failed', 'UNKNOWN', false);
};

/**
 * Cleans up temporary files after deployment
 * @param tempPath - Path to temporary directory to remove
 */
export const cleanupTempFiles = async (tempPath: string): Promise<void> => {
  try {
    await fs.remove(tempPath);
    console.log(`Cleaned up temp files at ${tempPath}`);
  } catch (error) {
    console.error(`Failed to cleanup temp files at ${tempPath}:`, error);
    // Don't throw - cleanup errors shouldn't break the flow
  }
};

/**
 * Full deployment pipeline
 * @param files - Files to deploy (path -> content mapping)
 * @param projectTitle - Human-readable project title
 * @param projectId - Unique project identifier
 * @returns Object with deployment URL and Cloudflare project ID
 */
export const deployProject = async (
  files: Record<string, string>,
  projectTitle: string,
  projectId: string
): Promise<{ deploymentUrl: string; cloudflareProjectId: string }> => {
  // Validate API token first
  console.log('Validating Cloudflare API token...');
  const isValid = await validateApiToken();
  
  if (!isValid) {
    throw createDeploymentError(
      'Cloudflare API token validation failed. Please check your CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.',
      'AUTH_FAILED',
      false
    );
  }
  
  // Generate unique project name
  const cloudflareProjectName = generateCloudflareProjectName(projectTitle);
  
  let tempDir: string | null = null;
  
  try {
    // Prepare files
    tempDir = await prepareFilesForDeployment(files, projectId);
    
    // Deploy with retry
    const deploymentUrl = await deployWithRetry(cloudflareProjectName, tempDir);
    
    // Schedule cleanup (don't await)
    setTimeout(() => {
      if (tempDir) {
        cleanupTempFiles(tempDir).catch(console.error);
      }
    }, deploymentConfig.tempFiles.cleanupDelay);
    
    return {
      deploymentUrl,
      cloudflareProjectId: cloudflareProjectName,
    };
  } catch (error) {
    // Ensure cleanup on error
    if (tempDir) {
      await cleanupTempFiles(tempDir).catch(console.error);
    }
    throw error;
  }
};