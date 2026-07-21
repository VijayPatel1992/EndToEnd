# CI/CD Troubleshooting Guide

## Quick Checklist

Before running tests in CI/CD, ensure:

- [ ] Environment variables are set: `BASE_URL`, `LOGIN_USERNAME`, `LOGIN_PASSWORD`
- [ ] Node.js version 18+ is installed
- [ ] `.env` files exist in `/env` directory
- [ ] Run `npm install` before tests
- [ ] Run diagnostics: `npm run diagnostics`

## Common Issues and Solutions

### Issue 1: "Cannot find module 'loginPage'"

**Error Message:**
```
Error: Cannot find module '../pages/loginPage'
```

**Causes:**
- TypeScript not compiled
- File path mismatch (case sensitivity in CI/CD)
- Module resolution issue

**Solutions:**
```bash
# Ensure TypeScript is compiled
npx tsc --noEmit

# Check file exists and has correct case
ls -la pages/loginPage.ts  # Linux/Mac
dir pages\loginPage.ts     # Windows
```

### Issue 2: "Storage state file not found"

**Error Message:**
```
Error: Storage state file does not exist: /path/to/storageState.json
```

**Causes:**
- GlobalSetup failed to run
- GlobalSetup failed to create file
- File permissions issue
- Directory doesn't exist

**Solutions:**
```bash
# 1. Run diagnostics
npm run diagnostics

# 2. Check directory permissions
ls -ld /project/path  # Should show write permission

# 3. Force create directory
mkdir -p allure-results junit-results

# 4. Run test with verbose logging
npx playwright test --reporter=list

# 5. Check globalSetup logs
# Look for "=== Global Setup Started ===" and "=== Global Setup Completed Successfully ==="
```

### Issue 3: Login Fails During GlobalSetup

**Error Message:**
```
Error during login/storage state creation: TimeoutError: page.waitForNavigation: Timeout 30000ms exceeded
```

**Causes:**
- Network connectivity issue
- Wrong credentials
- Application not responding
- Slow network in CI environment

**Solutions:**
```bash
# 1. Verify credentials in CI/CD
echo $LOGIN_USERNAME
echo $LOGIN_PASSWORD  # Don't do this in production!

# 2. Test connectivity
curl -I $BASE_URL

# 3. Increase timeout in GlobalSetUp.ts
// Change from 30000 to 60000
await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60 * 1000 });

# 4. Run with headed mode locally to debug
npm run test:headed
```

### Issue 4: "Port Already in Use" or "Connection Refused"

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Causes:**
- Application server not running
- Wrong BASE_URL in CI/CD
- Firewall blocking connection
- Previous test process still running

**Solutions:**
```bash
# 1. Verify BASE_URL is correct
echo $BASE_URL

# 2. Test connection
ping $(echo $BASE_URL | cut -d'/' -f3)
curl -I $BASE_URL

# 3. Kill any hung processes
pkill -f "node|npm"

# 4. Check if server is running
curl -s -o /dev/null -w "%{http_code}" $BASE_URL
# Should return 200, not connection error
```

### Issue 5: Tests Pass Locally but Fail in CI/CD

**Common Reasons:**
- Environment differences (OS, timezone, locale)
- Storage state not persisting between runs
- Race conditions in CI environment
- Different network conditions

**Solutions:**

1. **Set consistent environment:**
   ```bash
   export TZ=UTC
   export LANG=en_US.UTF-8
   ```

2. **Force fresh storage state:**
   ```bash
   rm -f storageState.json
   npm run test:ci  # First run will create fresh state
   ```

3. **Add waits and retries:**
   ```typescript
   // In your test
   await page.waitForLoadState('networkidle');
   await expect(element).toBeVisible({ timeout: 30000 });
   ```

4. **Check file timestamps:**
   ```bash
   ls -l storageState.json
   # If older than 2 hours, it will be recreated
   ```

### Issue 6: "Headless Browser Failed to Start"

**Error Message:**
```
Error: browserType.launch: Failed to launch chromium
```

**Causes:**
- Missing dependencies in CI/CD
- Permission issues
- Insufficient resources

**Solutions:**
```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies (Linux/Ubuntu)
npx playwright install-deps

# Check available resources
free -h      # Memory
df -h        # Disk space
```

### Issue 7: Intermittent Test Failures

**Symptoms:**
- Same test passes sometimes, fails other times
- Different error each time
- Works locally but not in CI/CD

**Solutions:**

1. **Increase timeout:**
   ```typescript
   test.setTimeout(120 * 1000); // 2 minutes
   ```

2. **Add wait conditions:**
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('.login-form', { timeout: 30000 });
   ```

3. **Retry with better waits:**
   ```typescript
   await expect(element).toBeVisible({ timeout: 30000 });
   ```

4. **Check for race conditions:**
   - Ensure globalSetup completes before tests
   - Add delays between actions if needed
   - Use proper wait strategies

## Debugging Commands

### Run Diagnostics
```bash
npm run diagnostics
```

### Run Single Test
```bash
npx playwright test tests/logintest.spec.ts
```

### Debug in Browser
```bash
npm run test:debug
```

### Run with Detailed Logging
```bash
DEBUG=pw:api npx playwright test
```

### Extract Test Report
```bash
npm run allure:generate
npm run allure:open
```

### Check Storage State
```bash
cat storageState.json | jq '.'
```

## CI/CD Pipeline Configuration Examples

### Azure Pipelines
```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

jobs:
- job: PlaywrightTests
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'

  - script: npm install
    displayName: 'Install dependencies'

  - script: npm run diagnostics
    displayName: 'Run diagnostics'

  - script: npx playwright install
    displayName: 'Install Playwright browsers'

  - script: npm run test:ci
    displayName: 'Run Playwright tests'
    env:
      NODE_ENV: qa
      CI: true
      BASE_URL: $(baseUrl)
      LOGIN_USERNAME: $(username)
      LOGIN_PASSWORD: $(password)

  - task: PublishBuildArtifacts@1
    condition: succeededOrFailed()
    inputs:
      pathToPublish: 'junit-results'
      artifactName: 'junit-reports'

  - task: PublishBuildArtifacts@1
    condition: succeededOrFailed()
    inputs:
      pathToPublish: 'allure-results'
      artifactName: 'allure-results'
```

### GitHub Actions
```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Playwright browsers
      run: npx playwright install
    
    - name: Run diagnostics
      run: npm run diagnostics
      env:
        BASE_URL: ${{ secrets.BASE_URL }}
        LOGIN_USERNAME: ${{ secrets.USERNAME }}
        LOGIN_PASSWORD: ${{ secrets.PASSWORD }}
    
    - name: Run tests
      run: npm run test:ci
      env:
        NODE_ENV: qa
        CI: true
        BASE_URL: ${{ secrets.BASE_URL }}
        LOGIN_USERNAME: ${{ secrets.USERNAME }}
        LOGIN_PASSWORD: ${{ secrets.PASSWORD }}
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          junit-results/
          allure-results/
```

## Emergency Debug Steps

If you're stuck and nothing works:

1. **Clean everything:**
   ```bash
   rm -rf node_modules storageState.json
   npm install
   npx playwright install
   ```

2. **Run with maximum verbosity:**
   ```bash
   DEBUG=pw:* npx playwright test --reporter=verbose
   ```

3. **Run a simple connectivity test:**
   ```bash
   npx playwright codegen $BASE_URL
   # Just open browser and check if you can access the app
   ```

4. **Check system resources:**
   ```bash
   # Check if system has enough memory and disk space
   free -h
   df -h
   ```

5. **Look at full error logs:**
   ```bash
   npm run test:ci 2>&1 | tee test-output.log
   # Review entire log file
   ```

## Need Help?

If issues persist:
1. Review the full console output from CI/CD job
2. Check `allure-results/` for test evidence (screenshots, videos)
3. Compare with local test run using `npm run test:headed`
4. Create minimal test case to isolate issue
5. Check Playwright documentation: https://playwright.dev
