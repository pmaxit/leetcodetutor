# Tldraw License Key Setup

## Local Development

The Tldraw license key is already configured in `.env` file for local development:

```bash
VITE_TLDRAW_LICENSE_KEY=tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w
```

Simply run:
```bash
npm run dev      # Development with hot reload
npm run build    # Build for production
```

## Production Deployment (Google Cloud)

### Recommended: Using deploy_gcp.sh Script

The easiest way to deploy to Google Cloud is using the existing `deploy_gcp.sh` script, which now automatically handles the Tldraw license key:

```bash
npm run deploy:gcp
```

This script will:
1. Enable necessary Google Cloud APIs
2. Build and push your Docker image to Google Container Registry
3. Deploy to Cloud Run with all environment variables from `.env.cloud-run`
4. Include the `VITE_TLDRAW_LICENSE_KEY` automatically

**No additional setup needed** — the license key is already configured in `.env.cloud-run` and will be picked up by the script.

### Alternative: Manual Google Cloud Deployment

If you prefer to deploy manually without the script:

```bash
# Set the license key as an environment variable
export VITE_TLDRAW_LICENSE_KEY="tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w"

# Deploy using gcloud
gcloud run deploy ai-interview-platform \
  --image gcr.io/YOUR_PROJECT_ID/ai-interview-platform \
  --region us-central1 \
  --set-env-vars VITE_TLDRAW_LICENSE_KEY=$VITE_TLDRAW_LICENSE_KEY
```

### Optional: Google Cloud Secret Manager (For Enhanced Security)

For additional security in production, store the license key in Google Cloud Secret Manager:

1. **Create the secret:**
   ```bash
   echo -n "tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w" | gcloud secrets create tldraw-license-key --data-file=-
   ```

2. **Grant Cloud Run service account access:**
   ```bash
   gcloud secrets add-iam-policy-binding tldraw-license-key \
     --member=serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT@appspot.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

3. **Reference the secret in Cloud Run:**
   ```bash
   gcloud run deploy ai-interview-platform \
     --set-secrets VITE_TLDRAW_LICENSE_KEY=tldraw-license-key:latest
   ```

## Deployment Checklist

- [x] License key added to `.env` (development)
- [x] License key added to `.env.cloud-run` (production)
- [x] Vite config updated to expose `VITE_TLDRAW_LICENSE_KEY`
- [ ] Build and test locally: `npm run build`
- [ ] Deploy to Cloud Run and verify whiteboard functionality

## License Expiration

⚠️ **Important:** The license expires on **2026-08-15**. Plan to renew before this date.

## Troubleshooting

If you get the error "Whiteboard is unavailable in production without a Tldraw license key":

1. Verify the env var is set: `echo $VITE_TLDRAW_LICENSE_KEY`
2. Check that vite build includes it: `npm run build && grep -r "tldraw" dist/`
3. Verify it's being used in your Tldraw component initialization
