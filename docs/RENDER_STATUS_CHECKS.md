# 🛡️ Preventing Render Deployment on CI Failure

This guide explains how to configure your setup so that Render **does not deploy** when GitHub CI status checks fail.

## Current Setup

✅ **GitHub Branch Protection**: Already configured
- Branch protection rules require status checks to pass before merging
- Required status checks: `backend-tests`, `frontend-tests`, `build`

✅ **CI Workflow**: Automatically creates status checks
- Each job (`backend-tests`, `frontend-tests`, `build`) creates a status check
- Status checks are visible in GitHub's commit status API

## Steps to Stop CD on CI Failure

### Step 1: Verify GitHub Status Checks

Your CI workflow automatically creates status checks. Verify they appear:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click on your branch protection rule (e.g., `main`)
4. Under **"Require status checks to pass before merging"**, you should see:
   - `backend-tests (18.x)` and `backend-tests (20.x)`
   - `frontend-tests (18.x)` and `frontend-tests (20.x)`
   - `build`

**Note**: If you see multiple matrix jobs, you may want to create a single aggregated status check. See "Optional: Create Single Status Check" below.

### Step 2: Configure Render to Wait for Status Checks

Render has different options depending on your plan and service type:

#### Option A: Render "Wait for CI" Feature (Recommended)

1. **Go to Render Dashboard**
   - Navigate to your service (e.g., `oopshop-backend` or `oopshop-frontend`)
   - Click on **Settings**

2. **Find Auto-Deploy Section**
   - Scroll down to **"Auto-Deploy"** or **"Deploy"** settings
   - Look for **"Wait for CI"** or **"Wait for GitHub status checks"** option

3. **Enable the Feature**
   - Toggle **"Wait for CI"** to **ON**
   - Or enable **"Wait for GitHub status checks"**
   - Render will now wait for all required status checks to pass before deploying

4. **Specify Status Check Names** (if required)
   - Some Render configurations allow you to specify which status checks to wait for
   - Enter: `backend-tests`, `frontend-tests`, `build`
   - Or use the workflow name: `CI`

#### Option B: Manual Deployment (If Option A Not Available)

If your Render plan doesn't support waiting for status checks:

1. **Disable Auto-Deploy**
   - Go to Render Dashboard → Your Service → Settings
   - Under **"Auto-Deploy"**, set to **"Manual"** or **"Disabled"**

2. **Deploy After CI Passes**
   - After pushing to `main`, wait for CI to complete
   - Check GitHub Actions tab to confirm all checks pass (green ✓)
   - Manually trigger deployment in Render dashboard

#### Option C: Use Render Webhook (Advanced)

1. **Create a GitHub Webhook** (if Render supports it)
   - Go to GitHub repo → Settings → Webhooks
   - Add webhook that triggers only on successful CI
   - Point to Render's deployment webhook

2. **Or use GitHub Actions to trigger Render**
   - Add a deployment step to your CI workflow
   - Only runs if all previous jobs succeed
   - Calls Render API to trigger deployment

### Step 3: Test the Configuration

1. **Create a test commit that will fail CI**
   ```bash
   # Temporarily break a test
   # Push to a branch and create PR, or push directly to main if allowed
   ```

2. **Verify Behavior**
   - CI should fail ❌
   - Render should **NOT** deploy (check Render dashboard)
   - If Render tries to deploy, the configuration needs adjustment

3. **Fix the test and verify success**
   - CI should pass ✅
   - Render should deploy automatically (if auto-deploy is enabled)

## Optional: Create Single Status Check

If you have multiple matrix jobs (e.g., `backend-tests (18.x)` and `backend-tests (20.x)`), you might want a single aggregated status check. Update your CI workflow:

```yaml
jobs:
  # ... existing jobs ...
  
  ci-success:
    name: CI / All Checks Passed
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests, build]
    if: always()
    steps:
      - name: Check all jobs passed
        run: |
          if [[ "${{ needs.backend-tests.result }}" != "success" ]] || \
             [[ "${{ needs.frontend-tests.result }}" != "success" ]] || \
             [[ "${{ needs.build.result }}" != "success" ]]; then
            echo "One or more CI jobs failed"
            exit 1
          fi
          echo "✅ All CI checks passed"
```

Then require only `CI / All Checks Passed` in branch protection rules.

## Troubleshooting

### Render Still Deploys When CI Fails

**Possible causes:**
1. "Wait for CI" not enabled in Render settings
2. Status check names don't match between GitHub and Render
3. Render doesn't support this feature on your plan

**Solutions:**
- Double-check Render settings
- Contact Render support to confirm feature availability
- Use manual deployment as fallback

### Status Checks Not Appearing in GitHub

**Possible causes:**
1. Workflow not running on push to main
2. Jobs failing before creating status checks

**Solutions:**
- Check GitHub Actions tab to see if workflow runs
- Ensure workflow triggers on `push` to `main`
- Fix any workflow syntax errors

### Multiple Status Checks from Matrix Jobs

**Solution:**
- Use the aggregated status check approach (see above)
- Or configure Render to wait for all matrix variants
- Or simplify matrix to single Node.js version

## Verification Checklist

- [ ] GitHub branch protection requires status checks
- [ ] CI workflow runs on push to `main`
- [ ] Status checks appear in GitHub (visible in PR/branch)
- [ ] Render "Wait for CI" is enabled (or auto-deploy is manual)
- [ ] Tested with failing CI → Render does not deploy
- [ ] Tested with passing CI → Render deploys successfully

## Additional Resources

- [Render Documentation: Auto-Deploy](https://render.com/docs/auto-deploy)
- [GitHub: Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [GitHub Actions: Job Status](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)
