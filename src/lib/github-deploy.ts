/**
 * COMPONENT: GitHub Deployment Service
 * PURPOSE: Deploy generated linktrees to GitHub Pages
 * FLOW: Create repo → Upload files → Enable Pages → Return URL
 * DEPENDENCIES: Octokit, environment variables
 */

import { Octokit } from '@octokit/rest';

/**
 * Initialize Octokit with Personal Access Token
 * Token needs: repo, workflow permissions
 */
const getOctokit = () => {
  const token = process.env.GITHUB_DEPLOY_TOKEN;
  if (!token) {
    throw new Error('GITHUB_DEPLOY_TOKEN not configured');
  }
  return new Octokit({ auth: token });
};

/**
 * Generate unique repository name for project
 * Format: linktree-{projectName}-{shortId}
 */
export const generateRepoName = (projectName: string, projectId: string): string => {
  // Sanitize project name for GitHub repo naming rules
  const sanitized = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  
  // Take first 8 chars of projectId for uniqueness
  const shortId = projectId.slice(0, 8);
  
  // GitHub repo names max 100 chars
  const repoName = `linktree-${sanitized}-${shortId}`.slice(0, 100);
  
  return repoName;
};

/**
 * Deploy HTML content to GitHub Pages
 */
export interface DeploymentResult {
  success: boolean;
  repoName?: string;
  repoUrl?: string;
  pagesUrl?: string;
  error?: string;
}

export const deployToGitHubPages = async (
  projectId: string,
  projectName: string,
  htmlContent: string
): Promise<DeploymentResult> => {
  try {
    const octokit = getOctokit();
    const owner = process.env.GITHUB_DEPLOY_USERNAME;
    
    if (!owner) {
      throw new Error('GITHUB_DEPLOY_USERNAME not configured');
    }
    
    const repoName = generateRepoName(projectName, projectId);
    
    // Step 1: Create repository
    console.log(`Creating repository: ${repoName}`);
    let repo;
    try {
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: `Linktree page: ${projectName}`,
        private: false, // Must be public for free GitHub Pages
        auto_init: false, // We'll add files manually
        has_pages: true,
      });
      repo = data;
    } catch (error: any) {
      // Handle repo already exists
      if (error.status === 422 && error.message?.includes('already exists')) {
        console.log(`Repository ${repoName} already exists, using it`);
        const { data } = await octokit.repos.get({ owner, repo: repoName });
        repo = data;
      } else {
        throw error;
      }
    }
    
    // Step 2: Upload index.html
    console.log(`Uploading index.html to ${repoName}`);
    
    // Check if file exists (for updates)
    let sha: string | undefined;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path: 'index.html',
      });
      
      if ('sha' in existingFile) {
        sha = existingFile.sha;
      }
    } catch (error) {
      // File doesn't exist, that's fine for first deployment
    }
    
    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'index.html',
      message: sha ? `Update linktree for ${projectName}` : `Deploy linktree for ${projectName}`,
      content: Buffer.from(htmlContent, 'utf-8').toString('base64'),
      ...(sha && { sha }), // Include SHA if updating
    });
    
    // Step 3: Enable GitHub Pages (if not already enabled)
    console.log(`Configuring GitHub Pages for ${repoName}`);
    try {
      await octokit.repos.createPagesSite({
        owner,
        repo: repoName,
        source: {
          branch: 'main',
          path: '/',
        },
      });
    } catch (error: any) {
      // Pages might already be enabled
      if (error.status === 409) {
        console.log('GitHub Pages already enabled');
      } else {
        console.error('Warning: Could not enable GitHub Pages:', error.message);
        // Continue anyway, user can enable manually
      }
    }
    
    // Step 4: Return deployment URLs
    const repoUrl = `https://github.com/${owner}/${repoName}`;
    const pagesUrl = `https://${owner}.github.io/${repoName}`;
    
    console.log(`Successfully deployed to: ${pagesUrl}`);
    
    return {
      success: true,
      repoName,
      repoUrl,
      pagesUrl,
    };
    
  } catch (error: any) {
    console.error('GitHub deployment failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};

/**
 * Check deployment status (GitHub Pages can take a few minutes)
 */
export const checkDeploymentStatus = async (repoName: string): Promise<'building' | 'built' | 'errored' | 'not_found'> => {
  try {
    const octokit = getOctokit();
    const owner = process.env.GITHUB_DEPLOY_USERNAME!;
    
    const { data } = await octokit.repos.getPages({
      owner,
      repo: repoName,
    });
    
    // Pages API returns status: 'built', 'building', 'errored'
    return data.status as 'building' | 'built' | 'errored';
  } catch (error: any) {
    if (error.status === 404) {
      return 'not_found';
    }
    throw error;
  }
};

/**
 * Delete a deployment (cleanup)
 */
export const deleteDeployment = async (repoName: string): Promise<boolean> => {
  try {
    const octokit = getOctokit();
    const owner = process.env.GITHUB_DEPLOY_USERNAME!;
    
    await octokit.repos.delete({
      owner,
      repo: repoName,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete repository:', error);
    return false;
  }
};