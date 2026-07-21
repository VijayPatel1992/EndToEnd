# Storage State Fix - Local vs CI/CD Issue Resolution

## Issues Fixed

### 1. **Headless Mode (Critical for CI/CD)**
- **Problem**: GlobalSetup was launching browser with `headless: false`
- **Fix**: Changed to `headless: true` for better CI/CD compatibility
- **Impact**: Browser will run in headless mode in CI/CD pipelines

### 2. **Path Resolution Inconsistency**
- **Problem**: Different path resolution using `__dirname` vs `ROOT_PATH`
- **Fix**: Moved `ROOT_PATH` export to top of GlobalSetUp.ts and use it consistently
- **Impact**: Consistent file path resolution across local and CI/CD

### 3. **No Error Handling**
- **Problem**: GlobalSetup silently failed without proper error messages
- **Fix**: Added comprehensive try-catch blocks and console logging
- **Impact**: Better visibility into what's happening during setup

### 4. **Storage State File Validation**
- **Problem**: Config referenced storage state file that might not exist
- **Fix**: Added file existence check in config with conditional loading
- **Impact**: Tests won't fail if storage state doesn't exist yet

### 5. **Navigation Handling**
- **Problem**: Login might not trigger navigation event in some scenarios
- **Fix**: Added `.catch()` to handle cases where navigation doesn't occur
- **Impact**: More robust login handling

### 6. **Network Wait Strategy**
- **Problem**: Unclear wait conditions after navigation
- **Fix**: Changed to `waitUntil: 'networkidle'` for better stability
- **Impact**: Better page stability detection after login

## Modified Files

### [GlobalSetUp.ts](./utility/GlobalSetUp.ts)
- Added comprehensive error handling with try-catch
- Added detailed console logging for debugging
- Changed browser launch to use `headless: true`
- Added `waitUntil: 'networkidle'` for better reliability
- Added null check for browser.close()
- Moved exports to top of file

### [playwright.config.ts](./playwright.config.ts)
- Added `fs` import for file checks
- Added conditional storage state loading
- Added logging to show which storage state is being used
- Better env file path logging

## How to Verify the Fix

### Local Testing
```bash
# Run tests locally
npm test

# Check console output for these messages:
# ✓ "=== Global Setup Started ===" 
# ✓ "Storage state path:" (should show full path)
# ✓ "=== Global Setup Completed Successfully ===" 
# ✓ "Storage state file exists: true"
# ✓ "Using existing storage state file"
```

### First Run (No Existing Storage State)
```bash
# First time run should show:
# ⚠ "Storage state file does not exist yet. It will be created by globalSetup."
# ✓ "Creating new storage state..."
# ✓ "Logging in as: [username]"
# ✓ "Storage state saved successfully"
```

### CI/CD Pipeline Debugging
Check the CI/CD logs for:
1. GlobalSetup execution messages
2. Login success/failure
3. Storage state file creation
4. Environment properties file creation

## Troubleshooting

### Issue: "Storage state file does not exist" error
**Solution**: Ensure globalSetup runs before tests
```bash
# Force run globalSetup
npx playwright test --config playwright.config.ts
```

### Issue: Tests still failing in CI/CD
**Check**:
1. Environment variables are set: `BASE_URL`, `LOGIN_USERNAME`, `LOGIN_PASSWORD`
2. Network connectivity to the app
3. CI/CD machine has write permissions to create `storageState.json`
4. No firewall blocking the application

### Issue: Storage state file is outdated
The file expires after 120 minutes. GlobalSetup will automatically recreate it.
**Manual refresh**:
```bash
# Delete old storage state
rm storageState.json

# Run tests (will recreate)
npm test
```

## CI/CD Pipeline Recommendations

### Azure Pipelines
```yaml
- script: npm test
  displayName: 'Run Playwright Tests'
  env:
    NODE_ENV: qa
    CI: true
    BASE_URL: $(baseUrl)
    LOGIN_USERNAME: $(username)
    LOGIN_PASSWORD: $(password)
```

### GitHub Actions
```yaml
- name: Run tests
  env:
    NODE_ENV: qa
    CI: true
    BASE_URL: ${{ secrets.BASE_URL }}
    LOGIN_USERNAME: ${{ secrets.USERNAME }}
    LOGIN_PASSWORD: ${{ secrets.PASSWORD }}
  run: npm test
```

## Key Differences from Previous Setup

| Aspect | Before | After |
|--------|--------|-------|
| Browser Mode | headless: false | headless: true |
| Error Handling | None | Comprehensive with logging |
| Path Resolution | Mixed (__dirname + ROOT_PATH) | Consistent (ROOT_PATH) |
| File Validation | No check | Validated before use |
| Navigation Wait | timeout only | networkidle + timeout |
| Logging | Minimal | Detailed for debugging |

## Support

If issues persist:
1. Run with `--debug` flag: `npx playwright test --debug`
2. Check `junit-results/junit-report.xml` for test failures
3. Check `allure-results/` for test evidence
4. Review console output for GlobalSetup messages
5. Ensure all environment variables are correctly set in CI/CD
