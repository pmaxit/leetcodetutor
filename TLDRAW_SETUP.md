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

### Option 1: Google Cloud Secret Manager (Recommended)

1. **Create the secret in Google Cloud Secret Manager:**
   ```bash
   gcloud secrets create tldraw-license-key \
     --replication-policy="automatic" \
     --data-file=- <<< "tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w"
   ```

2. **Grant Cloud Run access to the secret:**
   ```bash
   gcloud secrets add-iam-policy-binding tldraw-license-key \
     --member=serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT \
     --role=roles/secretmanager.secretAccessor
   ```

3. **Update Cloud Run deployment to use the secret:**
   ```bash
   gcloud run deploy YOUR_SERVICE_NAME \
     --set-env-vars VITE_TLDRAW_LICENSE_KEY=tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w \
     --region us-central1
   ```

### Option 2: Using `.env.cloud-run` (Already Configured)

The license key is already set in `.env.cloud-run` for Cloud Run deployments. When deploying:

```bash
gcloud run deploy YOUR_SERVICE_NAME \
  --source . \
  --region us-central1 \
  --set-env-vars-file .env.cloud-run
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
