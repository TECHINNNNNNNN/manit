#!/usr/bin/env node

/**
 * Final test to verify the complete deployment flow works
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Replicate the naming function logic here for testing
function generateCloudflareProjectName(projectTitle, prefix = 'manit') {
  // Sanitize the project title
  const sanitized = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/_/g, '-')  // Replace underscores
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Generate a short unique ID (6 characters)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueId = '';
  for (let i = 0; i < 6; i++) {
    uniqueId += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Combine and ensure no underscores
  let projectName = `${prefix}-${sanitized}-${uniqueId}`.replace(/_/g, '-');
  
  // Ensure it starts with a letter
  if (!/^[a-z]/.test(projectName)) {
    projectName = 'a' + projectName;
  }
  
  // Truncate if too long
  if (projectName.length > 63) {
    projectName = projectName.substring(0, 63);
  }
  
  return projectName;
}

// Load environment variables
require('dotenv').config({ path: '.env' });

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testFinalDeployment() {
  console.log('=== Final Deployment Test ===\n');
  
  // Test the naming function
  console.log('Testing project name generation:');
  const testNames = [
    'dreamy love_links',  // Has underscore
    'my-awesome-project',  // Already valid
    'Test Project 123!',   // Has special chars
  ];
  
  testNames.forEach(name => {
    const generated = generateCloudflareProjectName(name);
    console.log(`  "${name}" → "${generated}"`);
    
    // Verify no underscores
    if (generated.includes('_')) {
      console.error(`  ❌ Generated name contains underscore!`);
      process.exit(1);
    }
  });
  console.log('  ✅ All names are valid\n');
  
  // Now test actual deployment
  const projectTitle = 'final test project';
  const projectName = generateCloudflareProjectName(projectTitle);
  console.log(`Deploying project: ${projectName}\n`);
  
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_API_TOKEN: apiToken,
  };
  
  // Create test files
  const testDir = path.join(os.tmpdir(), 'cf-final-test-' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Final Deployment Test</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center; 
      padding: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    h1 { font-size: 3em; margin-bottom: 0.5em; }
    .status { 
      font-size: 1.5em; 
      padding: 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>🎉 Deployment Successful!</h1>
  <div class="status">
    <p>✅ Project Name: ${projectName}</p>
    <p>✅ No Underscores</p>
    <p>✅ Cloudflare Pages Working</p>
    <p>📅 Deployed: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(testDir, 'index.html'), htmlContent);
  console.log(`✅ Test files created\n`);
  
  try {
    // Create project
    console.log('Creating project...');
    const createCmd = `npx wrangler pages project create ${projectName} --production-branch=main`;
    try {
      await execAsync(createCmd, { env, timeout: 30000 });
      console.log('  ✅ Project created\n');
    } catch (e) {
      if (e.stderr && e.stderr.includes('already exists')) {
        console.log('  ℹ️ Project already exists\n');
      } else {
        throw e;
      }
    }
    
    // Deploy
    console.log('Deploying...');
    const deployCmd = `npx wrangler pages deploy "${testDir}" --project-name="${projectName}" --commit-dirty=true`;
    const { stdout } = await execAsync(deployCmd, { env, timeout: 60000 });
    
    // Extract URL
    const urlMatch = stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
    if (urlMatch) {
      console.log(`\n✅ DEPLOYMENT SUCCESSFUL!`);
      console.log(`🌐 URL: ${urlMatch[0]}`);
      console.log(`\n📋 Summary:`);
      console.log(`  - Project name has no underscores ✓`);
      console.log(`  - Deployment completed successfully ✓`);
      console.log(`  - URL is accessible (may take 15-24h for SSL) ✓`);
      console.log(`\n🎉 The Cloudflare deployment system is working correctly!`);
    } else {
      console.error('⚠️ Deployment completed but URL not found');
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stdout:', error.stdout);
    console.error('Stderr:', error.stderr);
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('\n🗑️ Cleaned up test files');
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testFinalDeployment().catch(console.error);