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
  
  // Build the wrangler command
  const command = `npx wrangler pages deploy "${filesPath}" --project-name="${projectName}"`;
  
  // Set environment variables for authentication
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_API_TOKEN: apiToken,
  };
  
  try {
    console.log(`Deploying to Cloudflare Pages project: ${projectName}`);
    
    const { stdout, stderr } = await execAsync(command, {
      env,
      timeout: deploymentConfig.deployment.timeout,
    });
    
    // Log output for debugging
    console.log('Wrangler stdout:', stdout);
    if (stderr) console.log('Wrangler stderr:', stderr);
    
    // Parse deployment URL from output
    // Wrangler typically outputs: "✨ Deployment complete! https://[hash].[project].pages.dev"
    const urlMatch = stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
    
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      console.log(`Deployment successful: ${deploymentUrl}`);
      return deploymentUrl;
    }
    
    // If no URL found in stdout, throw error
    throw createDeploymentError(
      'Could not parse deployment URL from Wrangler output',
      'PARSE_ERROR',
      false
    );
  } catch (error) {
    // Parse the error to determine if it's retryable
    const stderr = (error as any).stderr || '';
    throw parseWranglerError(stderr);
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