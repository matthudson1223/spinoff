# AI Setup Guide

This guide explains how to configure AI providers (Vertex AI and HuggingFace) for the War Room application.

## Quick Start

The application supports multiple AI providers with automatic fallback:
1. **Google Vertex AI (Gemini)** - Primary, supports tool calling (recommended)
2. **HuggingFace** - Fallback, faster setup but limited features
3. **Mock Responses** - No API keys required (for testing)

## Option 1: Google Vertex AI (Recommended)

Vertex AI provides access to Google's Gemini models with advanced features like tool calling.

### Prerequisites

- Google Cloud account
- Project with billing enabled
- Service account with credentials

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your **Project ID** (e.g., `gen-lang-client-0652471255`)

### Step 2: Enable Vertex AI API

Via Console:
1. Go to [Vertex AI API](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com)
2. Click **Enable**
3. Wait 2-3 minutes for activation

Via gcloud CLI:
```bash
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

### Step 3: Create Service Account

Via Console:
1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Name: `war-room-ai` (or any name)
4. Click **Create and Continue**
5. Grant role: **Vertex AI User** (`roles/aiplatform.user`)
6. Click **Done**

Via gcloud CLI:
```bash
# Create service account
gcloud iam service-accounts create war-room-ai \
  --display-name="War Room AI Service Account"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:war-room-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Step 4: Download Credentials

Via Console:
1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click on your service account
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** format
6. Click **Create** (downloads automatically)
7. Move the file to your project root (e.g., `war-room/credentials.json`)

Via gcloud CLI:
```bash
gcloud iam service-accounts keys create credentials.json \
  --iam-account=war-room-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 5: Configure Environment Variables

Create or update `.env.local` in the project root:

```bash
# Google Vertex AI Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/credentials.json

# HuggingFace (fallback - optional)
HUGGINGFACE_API_KEY=your-huggingface-key
```

**Important**: Use absolute path for `GOOGLE_APPLICATION_CREDENTIALS`

### Step 6: Verify Setup

```bash
# Start development server
npm run dev

# Test in browser
# Open http://localhost:3000
# Try chatting with Prime or CTO agents
```

Check console logs for:
- ✅ "Vertex AI initialized successfully"
- ❌ "Vertex AI not configured" (if there's an issue)

### Troubleshooting Vertex AI

#### Error: "Project ID not found"
```bash
# Check if environment variables are loaded
echo $GOOGLE_PROJECT_ID
echo $GOOGLE_APPLICATION_CREDENTIALS

# Restart dev server to reload .env.local
npm run dev
```

#### Error: "Permission denied" or "NOT_FOUND"
```bash
# Verify API is enabled
gcloud services list --enabled | grep aiplatform

# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:war-room-ai@*"
```

#### Error: "Model not found"
The app uses `gemini-1.5-flash-002` which is available in these regions:
- `us-central1` (recommended)
- `us-east4`
- `europe-west1`
- `asia-northeast1`

Update `GOOGLE_LOCATION` in `.env.local` if needed.

### Cost Considerations

**Gemini 1.5 Flash Pricing** (as of 2024):
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Estimated costs** for War Room usage:
- Per chat message: ~$0.0001 - $0.0005
- 1000 messages: ~$0.10 - $0.50

Enable budget alerts:
1. Go to [Billing](https://console.cloud.google.com/billing/budgets)
2. Create budget: $10/month
3. Set alert at 50%, 90%, 100%

---

## Option 2: HuggingFace (Fallback)

HuggingFace provides access to open-source models without tool calling support.

### Step 1: Get API Key

1. Go to [HuggingFace](https://huggingface.co/)
2. Sign up or log in
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click **New token**
5. Name: `war-room`
6. Type: **Read**
7. Click **Generate**
8. Copy the token (starts with `hf_...`)

### Step 2: Configure Environment

Create or update `.env.local`:

```bash
# Comment out or remove Vertex AI config
# GOOGLE_PROJECT_ID=...
# GOOGLE_LOCATION=...
# GOOGLE_APPLICATION_CREDENTIALS=...

# HuggingFace Configuration
HUGGINGFACE_API_KEY=hf_your_token_here
```

### Step 3: Verify Setup

```bash
npm run dev
# App will use HuggingFace (microsoft/Phi-3-mini-4k-instruct)
```

### HuggingFace Limitations

- ❌ No tool calling support
- ❌ Smaller context window (4K tokens vs 1M for Gemini)
- ❌ Slower inference (depends on server load)
- ✅ Free tier available
- ✅ Faster setup

---

## Option 3: Mock Mode (Testing)

For development without API costs, use mock responses.

### Configuration

Leave `.env.local` empty or comment out all API keys:

```bash
# .env.local
# GOOGLE_PROJECT_ID=
# GOOGLE_LOCATION=
# HUGGINGFACE_API_KEY=
```

### Features

- ✅ Instant responses (no API latency)
- ✅ No API costs
- ✅ Pattern-based responses
- ❌ No real AI reasoning
- ❌ Limited conversation context

Mock responses are defined in `app/api/chat/route.ts`:
- Lines 180-229: Prime agent responses
- Lines 232-284: CTO agent responses

---

## Model Configuration

Current models used by the application:

| Provider | Model | Use Case |
|----------|-------|----------|
| Vertex AI | `gemini-1.5-flash-002` | Primary (with tools) |
| HuggingFace | `microsoft/Phi-3-mini-4k-instruct` | Fallback |
| Mock | Pattern matching | No API keys |

### Changing Models

Edit `lib/langchain/agent.ts`:

```typescript
function createVertexAIModel(temperature: number = 0.7) {
  return new ChatVertexAI({
    model: "gemini-1.5-flash-002",  // Change this
    temperature: temperature,
    maxOutputTokens: 4096,
  });
}
```

Available Vertex AI models:
- `gemini-1.5-flash-002` - Fast, cost-effective (current)
- `gemini-1.5-pro-002` - More capable, higher cost
- `gemini-pro` - Previous generation

### Tool Calling

Tools are only available with Vertex AI (Gemini models).

Defined tools (`lib/langchain/tools.ts`):
- `marketAnalysisTool` - Analyze cryptocurrency markets
- `riskAssessmentTool` - Calculate position risk
- `constitutionCheckTool` - Verify compliance with trading rules
- `liquidityAnalysisTool` - Assess market liquidity

Tools are automatically bound when using Vertex AI.

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_PROJECT_ID` | For Vertex AI | GCP Project ID | `my-project-123` |
| `GOOGLE_LOCATION` | For Vertex AI | GCP region | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | For Vertex AI | Path to service account JSON | `/path/to/creds.json` |
| `HUGGINGFACE_API_KEY` | For HuggingFace | HF API token | `hf_abc123...` |

---

## Required IAM Permissions

Your Google Cloud service account needs:

### Minimum (Production)
- `roles/aiplatform.user` - Vertex AI User

### Development (Optional)
- `roles/logging.viewer` - View logs
- `roles/monitoring.viewer` - View metrics

### Not Required
- ❌ Editor or Owner (too broad)
- ❌ Service Account Admin (dangerous)
- ❌ Project IAM Admin (unnecessary)

---

## Verification Checklist

- [ ] Vertex AI API enabled in Google Cloud Console
- [ ] Service account created with Vertex AI User role
- [ ] Credentials JSON file downloaded and secured
- [ ] `.env.local` configured with absolute paths
- [ ] `.env.local` and `*.json` in `.gitignore`
- [ ] Development server starts without errors
- [ ] Chat responds with AI (not just mock responses)
- [ ] Console shows no authentication errors

---

## Next Steps

After setup:
1. Test both Prime and CTO agents
2. Review [SECURITY.md](./SECURITY.md) for credential management
3. Set up budget alerts in Google Cloud Console
4. Monitor usage in [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
5. Review [CHAT_GUIDE.md](./CHAT_GUIDE.md) for usage instructions

## Support

If you encounter issues:
1. Check console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure API quotas aren't exceeded
4. Review [Troubleshooting](#troubleshooting-vertex-ai) section above
5. Check [Google Cloud Status](https://status.cloud.google.com/) for outages
