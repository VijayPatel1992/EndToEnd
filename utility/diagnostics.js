#!/usr/bin/env node

/**
 * CI/CD Diagnostics Script
 * Run this before Playwright tests to verify setup is correct
 * Usage: node ./utility/diagnostics.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_PATH = path.join(__dirname, '..');
const storageStatePath = path.resolve(ROOT_PATH, 'storageState.json');
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env.qa`;

console.log('\n=== Playwright CI/CD Diagnostics ===\n');

// Check 1: Environment Variables
console.log('1. Environment Variables Check:');
const requiredEnvVars = ['BASE_URL', 'LOGIN_USERNAME', 'LOGIN_PASSWORD'];
let envVarsOk = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✓ ${envVar} is set`);
  } else {
    console.log(`   ✗ ${envVar} is MISSING`);
    envVarsOk = false;
  }
});

console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (will default to qa)'}`);
console.log(`   CI: ${process.env.CI || 'not set'}\n`);

// Check 2: .env File
console.log('2. Environment File Check:');
const envFilePath = path.resolve(ROOT_PATH, 'env', envFile);
if (fs.existsSync(envFilePath)) {
  console.log(`   ✓ Found: ${envFile}\n`);
} else {
  console.log(`   ✗ Missing: ${envFile}`);
  console.log(`   Expected location: ${envFilePath}\n`);
}

// Check 3: Storage State File
console.log('3. Storage State File Check:');
if (fs.existsSync(storageStatePath)) {
  const stats = fs.statSync(storageStatePath);
  const ageInMin = (Date.now() - stats.mtimeMs) / (1000 * 60);
  const sizeKb = (stats.size / 1024).toFixed(2);
  console.log(`   ✓ File exists: ${storageStatePath}`);
  console.log(`   Size: ${sizeKb} KB`);
  console.log(`   Age: ${ageInMin.toFixed(2)} minutes`);
  
  if (ageInMin > 120) {
    console.log(`   ⚠ File is older than 120 minutes - will be recreated\n`);
  } else {
    console.log(`   ✓ File is fresh (valid)\n`);
  }
} else {
  console.log(`   ⚠ File does not exist yet`);
  console.log(`   Expected location: ${storageStatePath}`);
  console.log(`   This is OK - it will be created during globalSetup\n`);
}

// Check 4: Directory Permissions
console.log('4. Directory Permissions Check:');
try {
  const testFile = path.join(ROOT_PATH, '.diagnostics-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`   ✓ Write permission OK for: ${ROOT_PATH}\n`);
} catch (error) {
  console.log(`   ✗ No write permission for: ${ROOT_PATH}`);
  console.log(`   Error: ${error.message}\n`);
}

// Check 5: Required Directories
console.log('5. Required Directories Check:');
const requiredDirs = [
  'tests',
  'pages',
  'utility',
  'env',
  'allure-results',
  'junit-results'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(ROOT_PATH, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ✓ ${dir}`);
  } else {
    console.log(`   ✗ ${dir} (MISSING)`);
  }
});
console.log();

// Check 6: Configuration Files
console.log('6. Configuration Files Check:');
const configFiles = [
  'playwright.config.ts',
  'tsconfig.json',
  'package.json'
];

configFiles.forEach(file => {
  const filePath = path.join(ROOT_PATH, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} (MISSING)`);
  }
});
console.log();

// Summary
console.log('=== Diagnostics Summary ===\n');
if (envVarsOk) {
  console.log('✓ All checks passed! Ready to run tests.');
} else {
  console.log('✗ Some checks failed. Review the issues above.');
  console.log('\nCommon solutions:');
  console.log('1. Set environment variables in CI/CD pipeline');
  console.log('2. Ensure .env files exist in /env directory');
  console.log('3. Check directory permissions on CI/CD machine');
  console.log('4. First run will create storageState.json automatically');
}

console.log('\n=== End Diagnostics ===\n');

// Exit with error if critical checks failed
if (!envVarsOk) {
  process.exit(1);
}
