# Security Guide

## Credentials Management

### Environment Variables

This application uses sensitive credentials that must **NEVER** be committed to version control:

- `GOOGLE_PROJECT_ID` - Google Cloud Project ID
- `GOOGLE_LOCATION` - Google Cloud region (e.g., us-central1)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON file
- `HUGGINGFACE_API_KEY` - HuggingFace API key

### Protected Files

The following files contain sensitive data and are gitignored:
- `.env.local` - Local environment variables
- `.env` - Production environment variables
- `*.json` - Service account credential files (except package.json, tsconfig.json)

### Service Account Setup

#### Required IAM Roles

Your Google Cloud service account needs these roles to access Vertex AI:

1. **Vertex AI User** (`roles/aiplatform.user`)
   - Allows invoking Vertex AI models
   - Required for Gemini API calls

2. **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`) - Optional
   - Only needed if generating short-lived credentials

#### Granting Permissions

Via Google Cloud Console:
1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account: `667026515460-compute@developer.gserviceaccount.com`
3. Click "Edit" (pencil icon)
4. Click "Add Another Role"
5. Select `Vertex AI User`
6. Click "Save"

Via gcloud CLI:
```bash
gcloud projects add-iam-policy-binding gen-lang-client-0652471255 \
  --member="serviceAccount:667026515460-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Credential Rotation

If credentials are ever exposed, rotate them immediately:

#### 1. Rotate Google Cloud Service Account

```bash
# Delete the compromised key
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=667026515460-compute@developer.gserviceaccount.com

# Create a new key
gcloud iam service-accounts keys create new-service-account-key.json \
  --iam-account=667026515460-compute@developer.gserviceaccount.com

# Update .env.local with new path
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/new-service-account-key.json
```

Or via Console:
1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click on your service account
3. Go to "Keys" tab
4. Delete the compromised key
5. Click "Add Key" → "Create new key" → "JSON"
6. Download and save securely
7. Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`

#### 2. Rotate HuggingFace API Key

1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Delete the compromised token
3. Create a new token with "Read" access
4. Update `HUGGINGFACE_API_KEY` in `.env.local`

### Production Deployment

For production environments, use secret management services instead of files:

#### Option 1: Google Secret Manager (Recommended)

```bash
# Store credentials as secrets
echo -n "your-huggingface-key" | gcloud secrets create huggingface-api-key \
  --data-file=-

# Store service account JSON
gcloud secrets create google-credentials \
  --data-file=service-account-key.json

# Grant access to Cloud Run/App Engine service account
gcloud secrets add-iam-policy-binding huggingface-api-key \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Update your code to fetch from Secret Manager:
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/huggingface-api-key/versions/latest',
});
const apiKey = version.payload.data.toString();
```

#### Option 2: Environment Variables Only (Cloud Run/Vercel)

Instead of using a file path for `GOOGLE_APPLICATION_CREDENTIALS`, pass the JSON content directly:

```bash
# .env.production (server environment only)
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

Update code:
```typescript
// lib/langchain/agent.ts
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? undefined // Use file path
  : JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');

const model = new ChatVertexAI({
  model: "gemini-1.5-flash-002",
  authOptions: credentials ? { credentials } : undefined,
});
```

### Security Checklist

Before deploying:

- [ ] `.env.local` is in `.gitignore`
- [ ] Service account JSON files are in `.gitignore`
- [ ] No credentials in git history (`git log --all --full-history -- .env.local`)
- [ ] Service account has minimal required permissions (Vertex AI User only)
- [ ] API keys are not exposed in client-side code
- [ ] Production uses Secret Manager or environment variables (not files)
- [ ] Credentials are rotated every 90 days
- [ ] 2FA enabled on Google Cloud account
- [ ] 2FA enabled on HuggingFace account

### Incident Response

If credentials are exposed:

1. **Immediate** (< 5 minutes):
   - Revoke/delete compromised keys in Google Cloud Console
   - Revoke HuggingFace API key

2. **Short-term** (< 1 hour):
   - Generate new credentials
   - Update production environment variables
   - Redeploy application

3. **Follow-up** (< 24 hours):
   - Review access logs for unauthorized usage
   - Check Google Cloud billing for unexpected charges
   - Remove credentials from git history if committed
   - Document incident and remediation steps

### Monitoring

Enable these monitoring features:

1. **Google Cloud Audit Logs**
   - Track all Vertex AI API calls
   - Alert on unusual usage patterns

2. **API Usage Quotas**
   - Set budget alerts in Google Cloud Console
   - Monitor HuggingFace API usage

3. **Error Tracking**
   - Monitor authentication failures
   - Track rate limit errors

### Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Separation of Concerns**: Different keys for dev/staging/production
3. **Regular Rotation**: Rotate credentials every 90 days
4. **Audit Regularly**: Review service account permissions quarterly
5. **Never Log Secrets**: Ensure credentials aren't in application logs
6. **Use Short-Lived Tokens**: When possible, use OAuth2 tokens instead of long-lived keys

## Additional Resources

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Vertex AI Access Control](https://cloud.google.com/vertex-ai/docs/general/access-control)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
