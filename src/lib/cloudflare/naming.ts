/**
 * COMPONENT: Cloudflare Project Naming
 * PURPOSE: Generate unique, valid project names for Cloudflare Pages
 * FLOW: Input project title → Sanitize → Add unique ID → Return valid name
 * DEPENDENCIES: nanoid for unique ID generation
 */

import { nanoid } from 'nanoid';

/**
 * Generates a unique project name for Cloudflare Pages
 * Cloudflare requirements:
 * - Must be lowercase
 * - Can contain letters, numbers, and hyphens ONLY
 * - Must start with a letter
 * - Max 63 characters
 * - NO underscores allowed (will cause "Project not found" errors)
 */
export const generateCloudflareProjectName = (
  projectTitle: string,
  prefix: string = 'manit'
): string => {
  // Sanitize the project title
  const sanitized = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Generate a short unique ID (6 characters)
  // Replace any underscores that nanoid might generate with hyphens
  const uniqueId = nanoid(6).toLowerCase().replace(/_/g, '-');
  
  // Combine parts: prefix-title-id
  let projectName = `${prefix}-${sanitized}-${uniqueId}`;
  
  // Final safety check: replace any remaining underscores with hyphens
  projectName = projectName.replace(/_/g, '-');
  
  // Ensure it starts with a letter (prefix should handle this)
  if (!/^[a-z]/.test(projectName)) {
    projectName = `a${projectName}`;
  }
  
  // Truncate if too long (max 63 chars)
  if (projectName.length > 63) {
    // Keep prefix and ID, truncate the middle part
    const maxTitleLength = 63 - prefix.length - uniqueId.length - 2; // -2 for hyphens
    const truncatedTitle = sanitized.substring(0, Math.max(0, maxTitleLength));
    projectName = `${prefix}-${truncatedTitle}-${uniqueId}`;
  }
  
  return projectName;
};

/**
 * Validates if a project name meets Cloudflare requirements
 */
export const isValidCloudflareProjectName = (name: string): boolean => {
  return (
    /^[a-z][a-z0-9-]{0,62}$/.test(name) && // Starts with letter, valid chars, max 63
    !name.endsWith('-') && // Doesn't end with hyphen
    !name.includes('_') // No underscores allowed
  );
};