# Cloud Build Fix: Tldraw License Key Deployment

## Problem
When running `npm run deploy:gcp`, you got:
```
ERROR: (gcloud.builds.submit) unrecognized arguments: --build-arg=VITE_TLDRAW_LICENSE_KEY=...
```

## Solution
The `gcloud builds submit` command doesn't support `--build-arg` directly. Instead, we use:
- A `cloudbuild.yaml` configuration file
- `--substitutions` to pass the license key as a variable

## How It Works Now

### Before (Broken)
```bash
gcloud builds submit --tag $IMAGE_NAME --build-arg="..." .
```
❌ `gcloud builds submit` doesn't accept `--build-arg`

### After (Fixed)
```bash
gcloud builds submit --config=cloudbuild.yaml --substitutions=_VITE_TLDRAW_LICENSE_KEY="..." .
```
✅ Uses `cloudbuild.yaml` which internally uses `docker build --build-arg`

## The Flow

```
deploy_gcp.sh
    ↓
loads .env (VITE_TLDRAW_LICENSE_KEY)
    ↓
gcloud builds submit --config=cloudbuild.yaml --substitutions=_VITE_TLDRAW_LICENSE_KEY="..."
    ↓
cloudbuild.yaml:
  Step 1: docker build --build-arg=VITE_TLDRAW_LICENSE_KEY=${_VITE_TLDRAW_LICENSE_KEY}
  Step 2: gcloud run deploy (with image from Step 1)
```

## Key Changes

### deploy_gcp.sh
- Simplified: now just loads `.env` and calls `gcloud builds submit`
- All build/deploy logic moved to `cloudbuild.yaml`
- Much cleaner and easier to maintain

### cloudbuild.yaml
- Step 1: Builds Docker image with license key as build arg
- Step 2: Deploys the built image to Cloud Run
- Uses substitution variable `${_VITE_TLDRAW_LICENSE_KEY}`

## Testing the Fix

```bash
# Make sure .env has the license key
grep VITE_TLDRAW_LICENSE_KEY .env

# Deploy (should work now without the --build-arg error)
npm run deploy:gcp

# Check if whiteboard works
gcloud run services describe ai-interview-platform --format='value(status.url)'
# Visit that URL and test the whiteboard
```

## Why This Approach?

| Aspect | Bash Script | Cloud Build Config |
|--------|------------|-------------------|
| Complexity | High (Python, env parsing) | Low (declarative YAML) |
| Maintainability | Hard to read | Easy to understand |
| CI/CD Ready | No | Yes ✅ |
| GitHub Actions | Awkward | Natural fit |
| Cloud Console | Can't set up easily | Easy UI for secrets |

Cloud Build config is the "proper" way to do multi-step builds in Google Cloud.

## References
- [Cloud Build documentation](https://cloud.google.com/build/docs)
- [Docker builder step](https://cloud.google.com/build/docs/build-steps/docker)
- [Cloud Run builder step](https://cloud.google.com/build/docs/build-steps/cloud-run)
