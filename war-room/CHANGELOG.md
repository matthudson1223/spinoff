# Changelog

All notable changes to the War Room Dashboard project.

## [1.2.0] - 2025-12-12

### 🔒 Security Hardening

#### Added
- **SECURITY.md** - Comprehensive security documentation
  - Credentials management best practices
  - Service account IAM permissions guide
  - Credential rotation procedures
  - Production deployment security
  - Incident response procedures
  - Security monitoring recommendations

#### Security Improvements
- Enhanced `.gitignore` to protect service account JSON files
- Verified no credentials in git history
- Server-side only environment variable usage
- Protected sensitive file patterns

### 📚 Documentation

#### Added
- **SETUP.md** - Complete AI provider setup guide
  - Step-by-step Vertex AI configuration
  - HuggingFace fallback setup instructions
  - Mock mode testing guide
  - Comprehensive troubleshooting section
  - Cost considerations and budgeting
  - Environment variables reference
  - IAM permissions checklist

### 🚀 API Improvements

#### Structured Response Format
- Added TypeScript types in `types/api.ts`
- Chat API now returns structured responses:
  ```typescript
  {
    response: string,
    source: 'vertex-ai' | 'huggingface' | 'mock',
    confidence: number,  // 1.0 for AI, 0.5 for mock
    metadata: {
      model?: string,
      usedTools?: boolean,
      responseTime?: number
    }
  }
  ```

#### Response Source Tracking
- All responses now include their originating provider
- Confidence scores distinguish AI vs mock responses
- Performance metrics (response time) for all API calls
- Model information included in metadata

### ⚙️ Configuration Changes

#### Model Update
- Changed from `gemini-1.5-pro` to `gemini-1.5-flash-002`
  - **2x faster** response times
  - More widely available across GCP regions
  - Lower cost per token
  - Still supports tool calling for trading features

#### Conversation History
- Standardized to **8 messages** across all code paths
  - Previously: Inconsistent (4-6 messages)
  - Now: Uniform 8 message limit
  - Applies to: Chain execution, simple invoke, context formatting

### 📦 Dependencies

#### Removed
- `@langchain/anthropic` - Unused package removed
  - Reduces bundle size
  - Eliminates unnecessary dependencies
  - Cleaner package.json

### 🐛 Bug Fixes

#### Vertex AI Integration
- Fixed "Project ID not found" error
- Fixed "Model not found" error (model availability)
- Proper environment variable loading verified
- Service account authentication configured

### 📊 Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Model Speed | gemini-1.5-pro | gemini-1.5-flash-002 | ~2x faster |
| Response Tracking | None | Full metrics | Monitoring enabled |
| Error Handling | Basic | 3-tier fallback | Better reliability |
| Type Safety | Partial | Full types | Fewer bugs |
| Bundle Size | 234 packages | 229 packages | -5 packages |

### ⚠️ Action Required

1. **Review Service Account Permissions**
   - Verify IAM role `roles/aiplatform.user` is assigned
   - Check in [Google Cloud Console](https://console.cloud.google.com/iam-admin/iam)

2. **Enable Vertex AI API**
   - Required for Gemini models
   - [Enable here](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com)

3. **Set Budget Alerts** (Recommended)
   - Suggested: $10/month with 50%, 90%, 100% alerts
   - [Configure budgets](https://console.cloud.google.com/billing/budgets)

### 🔄 Migration Guide

**For API Consumers:**

Old format still works but missing new features:
```typescript
const { response } = await fetch('/api/chat', {...})
```

New format with full metadata:
```typescript
const { response, source, confidence, metadata } = await fetch('/api/chat', {...})
if (source === 'mock') console.warn('Using mock response')
if (metadata?.usedTools) console.log('AI used trading tools')
console.log(`Response time: ${metadata?.responseTime}ms`)
```

---

## [1.1.0] - 2025-12-12

### ✨ Added - AI Chat Interface

#### New Features
- **Interactive Chat Component**: Chat directly with Prime agent via floating chat button
- **Hugging Face Integration**: Powered by Microsoft Phi-3-mini-4k-instruct model
- **Smart Fallback System**: Intelligent mock responses when API key not configured
- **Context-Aware Conversations**: Maintains last 6 messages for coherent dialogue
- **Real-time Responses**: Instant feedback with loading indicators
- **Minimizable UI**: Collapsible chat window with clean cyberpunk styling

#### New Components
- `ChatBox.tsx` - Main chat interface component
- `/app/api/chat/route.ts` - API endpoint for Hugging Face integration

#### New Types
- `ChatMessage` interface
- `MessageRole` type

#### Documentation
- `CHAT_GUIDE.md` - Comprehensive chat feature documentation
- `.env.example` - Environment variable template
- Updated `README.md` with chat setup instructions

#### Technical Details
- Natural language processing for trading insights
- Pattern matching for intelligent mock responses
- Conversation history management
- Keyboard shortcuts (Enter to send)
- Smooth animations with Framer Motion

#### Chat Capabilities
Prime agent can discuss:
- Market analysis and trends
- Portfolio metrics and risk
- Specific cryptocurrencies (BTC, ETH, SOL, etc.)
- Trading opportunities and signals
- System status and performance

### 📦 Dependencies Added
- `@huggingface/inference` - Hugging Face API client

### 🎨 UI Enhancements
- Floating chat button with hover animations
- Message bubbles with timestamps
- User/agent avatar indicators
- Loading spinner during AI processing
- Minimize/close controls

---

## [1.0.0] - 2025-12-11

### Initial Release

#### Core Features
- **3-Column Dashboard Layout**
  - Left: Agent Roster with status monitoring
  - Center: Opportunity Feed with trade proposals
  - Right: P&L and execution log

#### Components
- `AgentRoster.tsx` - Agent status display
- `OpportunityFeed.tsx` - Trade proposal cards
- `ExecutionPanel.tsx` - Portfolio and history
- `ConstitutionModal.tsx` - Trading rules display

#### Agent System
- 4 AI agents: Prime, Sentinel, Executor, Warden
- Real-time status indicators (online/thinking/error)
- Live action tickers

#### Trading Features
- Color-coded trade zones (Green/Yellow/Red)
- Approve/Reject trade workflow
- Auto-execution for low-risk trades
- Emergency halt button
- Transaction history log

#### Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Framer Motion (animations)

#### Design
- Bloomberg Terminal aesthetic
- Cyberpunk color scheme
- Monospace fonts for data
- Neon accent colors
- Dark mode (slate-900)

#### Mock Data
- 4 active agents
- 2 sample trade proposals
- 2 executed trades
- Constitution parameters

---

## Future Roadmap

### Planned Features
- [ ] WebSocket integration for live data
- [ ] Historical performance charts
- [ ] Chat with all agents (not just Prime)
- [ ] Voice input for chat
- [ ] Export chat history
- [ ] Advanced trade filtering
- [ ] Multi-portfolio support
- [ ] Mobile responsive design
- [ ] Custom alert configuration
- [ ] Theme customization
