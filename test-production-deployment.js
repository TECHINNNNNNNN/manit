#!/usr/bin/env node

/**
 * Test script to mimic the exact production deployment scenario
 * This replicates the failed deployment: manit-dreamy-love-links-xch_yd
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Load environment variables
require('dotenv').config({ path: '.env' });

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testProductionDeployment() {
  console.log('=== Testing Production-Like Deployment ===\n');
  
  // Use the exact project name that's failing
  const projectName = `manit-test-prod-${Date.now().toString(36)}`;
  console.log(`Testing with project name: ${projectName}`);
  
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
    WRANGLER_LOG: 'debug',
  };
  
  // Create test files
  const testDir = path.join(os.tmpdir(), 'cf-prod-test-' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  
  // Create a simple linktree-like HTML
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Test Linktree</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 50px; }
    .link { display: block; margin: 20px auto; padding: 15px; max-width: 300px; 
            background: #007bff; color: white; text-decoration: none; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>My Links</h1>
  <a href="https://github.com" class="link">GitHub</a>
  <a href="https://twitter.com" class="link">Twitter</a>
  <p>Generated at: ${new Date().toISOString()}</p>
</body>
</html>`;
  
  fs.writeFileSync(path.join(testDir, 'index.html'), htmlContent);
  console.log(`✅ Test files created at: ${testDir}\n`);
  
  // Step 1: Check if project exists
  console.log('Step 1: Checking if project exists...');
  try {
    const checkCmd = `npx wrangler pages project get ${projectName}`;
    const { stdout } = await execAsync(checkCmd, { env, timeout: 10000 });
    console.log('   Project exists:', stdout.substring(0, 100));
  } catch (error) {
    console.log('   Project does not exist (expected)\n');
  }
  
  // Step 2: Try to create project
  console.log('Step 2: Creating project...');
  try {
    const createCmd = `npx wrangler pages project create ${projectName} --production-branch=main`;
    const { stdout, stderr } = await execAsync(createCmd, { env, timeout: 30000 });
    console.log('   ✅ Project created successfully');
    console.log('   Output:', stdout);
  } catch (createError) {
    console.error('   ⚠️ Project creation failed:');
    console.error('   Error:', createError.message);
    console.error('   Stderr:', createError.stderr);
    
    // Check if it's "already exists" error
    if (createError.stderr && createError.stderr.includes('already exists')) {
      console.log('   ℹ️ Project already exists, continuing...\n');
    } else {
      console.log('   Continuing anyway...\n');
    }
  }
  
  // Step 3: Deploy to project
  console.log('Step 3: Deploying to project...');
  try {
    const deployCmd = `npx wrangler pages deploy "${testDir}" --project-name="${projectName}" --commit-dirty=true`;
    console.log('   Command:', deployCmd);
    
    const { stdout, stderr } = await execAsync(deployCmd, { env, timeout: 60000 });
    
    console.log('\n   === Deploy Output ===');
    console.log(stdout);
    if (stderr) {
      console.log('\n   === Deploy Stderr ===');
      console.log(stderr);
    }
    
    // Extract URL
    const urlMatch = stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
    if (urlMatch) {
      console.log(`\n   ✅ Deployment successful!`);
      console.log(`   🌐 URL: ${urlMatch[0]}`);
    } else {
      console.log('\n   ⚠️ Deployment completed but URL not found in output');
    }
  } catch (deployError) {
    console.error('\n   ❌ Deployment failed!');
    console.error('   Error:', deployError.message);
    console.error('   Exit code:', deployError.code);
    console.error('\n   === Stdout ===');
    console.error(deployError.stdout || '(empty)');
    console.error('\n   === Stderr ===');
    console.error(deployError.stderr || '(empty)');
    
    // Step 4: If deployment failed with "project not found", try recreating
    if (deployError.stdout && deployError.stdout.includes('Project not found')) {
      console.log('\n   🔄 Project not found - attempting to recreate...');
      
      try {
        const recreateCmd = `npx wrangler pages project create ${projectName} --production-branch=main`;
        await execAsync(recreateCmd, { env, timeout: 30000 });
        console.log('   ✅ Project recreated');
        
        // Retry deployment
        console.log('   🔄 Retrying deployment...');
        const retryCmd = `npx wrangler pages deploy "${testDir}" --project-name="${projectName}" --commit-dirty=true`;
        const { stdout: retryStdout } = await execAsync(retryCmd, { env, timeout: 60000 });
        
        console.log('\n   === Retry Output ===');
        console.log(retryStdout);
        
        const retryUrlMatch = retryStdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
        if (retryUrlMatch) {
          console.log(`\n   ✅ Retry successful!`);
          console.log(`   🌐 URL: ${retryUrlMatch[0]}`);
        }
      } catch (retryError) {
        console.error('   ❌ Retry failed:', retryError.message);
      }
    }
  } finally {
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('\n   🗑️ Cleaned up test files');
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testProductionDeployment().catch(console.error);