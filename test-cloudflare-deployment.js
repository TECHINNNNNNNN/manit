#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 0. Verify .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error(`❌ .env file not found at ${envPath}`);
  process.exit(1);
}

// Load env variables
require('dotenv').config({ path: envPath });

// 0.1 Verify required variables are in the .env file
const requiredVars = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const os = require('os');

(async function testCloudflareSetup() {
  console.log('=== Testing Cloudflare Deployment Setup ===\n');

  // 1. Node.js version
  console.log('1. Checking Node.js version...');
  const nodeVersion = process.version;
  console.log(`   Node.js version: ${nodeVersion}`);
  if (parseInt(nodeVersion.slice(1)) < 20) {
    console.error('   ❌ Node.js v20+ required');
    process.exit(1);
  }
  console.log('   ✅ Node.js version OK\n');

  // 2. Wrangler CLI
  console.log('2. Testing Wrangler CLI...');
  try {
    const { stdout } = await execAsync('npx wrangler --version');
    console.log(`   ✅ Wrangler version: ${stdout.trim()}\n`);
  } catch (error) {
    console.error('   ❌ Wrangler not found or failed to run:', error.message);
    process.exit(1);
  }

  // 3. API authentication
  console.log('3. Testing Cloudflare API authentication...');
  try {
    const { stdout } = await execAsync('npx wrangler whoami', { env: process.env });
    console.log(stdout);
    if (stdout.includes('You are logged in')) {
      console.log('   ✅ Authentication successful!\n');
    } else {
      console.error('   ⚠️  Could not verify authentication');
    }
  } catch (error) {
    console.error('   ❌ Authentication failed:', error.message);
    process.exit(1);
  }

  // 4. Deployment test
  console.log('4. Testing deployment...');
  const testDir = path.join(os.tmpdir(), 'cloudflare-test-' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(
    path.join(testDir, 'index.html'),
    `<h1>Cloudflare Test</h1><p>${new Date().toISOString()}</p>`
  );
  console.log(`   ✅ Test files created at: ${testDir}`);

  const projectName = `test-${Date.now()}`;
  try {
    // First, try to create the project
    console.log(`   Creating project: ${projectName}...`);
    try {
      const { stdout: createStdout } = await execAsync(
        `npx wrangler pages project create ${projectName} --production-branch=main`,
        { env: process.env, timeout: 30000 }
      );
      console.log(`   ✅ Project created`);
      console.log(createStdout);
    } catch (createError) {
      // Show the actual error
      console.error(`   ❌ Project creation failed!`);
      console.error(`   Error: ${createError.message}`);
      console.error(`   Stdout: ${createError.stdout}`);
      console.error(`   Stderr: ${createError.stderr}`);
      // Try to continue anyway
      console.log(`   Attempting deployment anyway...`);
    }

    // Now deploy to the project
    console.log(`   Deploying to project...`);
    const { stdout, stderr } = await execAsync(
      `npx wrangler pages deploy "${testDir}" --project-name="${projectName}" --commit-dirty=true`,
      { env: process.env, timeout: 60000 }
    );
    console.log(stdout);

    const urlMatch = stdout.match(/https:\/\/[\w-]+\.[\w-]+\.pages\.dev/);
    if (urlMatch) {
      console.log(`   ✅ Deployment successful! 🌐 ${urlMatch[0]}`);
    }
  } catch (error) {
    console.error(`\n   ❌ Deployment failed!`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Exit code: ${error.code}`);
    console.error(`   Command: ${error.cmd}`);
    console.error(`\n   === STDOUT ===`);
    console.error(error.stdout || '   (empty)');
    console.error(`\n   === STDERR ===`);
    console.error(error.stderr || '   (empty)');
    console.error(`\n   Full error object:`, error);
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('   🗑️  Cleaned up test files');
  }

  console.log('\n=== Test Complete ===');
})();
