# AI Chat Interface - Complete Guide

## Overview

The War Room dashboard features an interactive AI chat interface that allows you to communicate directly with Prime, the lead trading agent. This guide covers everything you need to know about using and customizing the chat feature.

## Quick Start

1. **Open the chat**: Click the floating "Chat with Prime" button in the bottom right corner
2. **Type your question**: The input field accepts any text
3. **Send**: Press Enter or click the send button
4. **Receive response**: Prime will analyze your question and respond

## Features

### 💬 Real-time Conversation
- Instant responses from Prime agent
- Conversation history maintained during session
- Context-aware responses (remembers last 6 messages)
- Natural language understanding

### 🤖 AI-Powered by Hugging Face
- **Model**: Microsoft Phi-3-mini-4k-instruct
- **Capabilities**: Trading analysis, market insights, portfolio advice
- **Fallback**: Smart mock responses if API key not configured
- **Temperature**: 0.7 (balanced between creative and factual)
- **Max Tokens**: 200 (concise, focused responses)

### 🎨 UI Features
- Clean cyberpunk-styled interface
- Message bubbles with timestamps
- User/agent avatar indicators
- Loading spinner during processing
- Minimizable window
- Smooth animations

## Using the Chat

### Opening the Chat

Click the floating emerald button labeled "Chat with Prime" in the bottom-right corner of the screen.

### Asking Questions

The chat supports natural language queries. Here are examples:

#### Market Analysis
```
You: What's your analysis on ETH right now?
Prime: ETH currently showing bullish momentum. RSI at 62,
funding rate +0.008%. Watching for entry at $3,420 support
level. Risk/reward ratio: 1:3.2.
```

#### Portfolio Status
```
You: How is our portfolio performing?
Prime: Current portfolio exposure: 68%. Daily drawdown: -0.8%
(well within 5% limit). Sharpe ratio: 2.1. All positions
within risk parameters.
```

#### Specific Cryptocurrencies
```
You: Tell me about SOL
Prime: SOL showing strong network activity. DEX volume up 23%
in 24h. Potential rotation from ETH. Monitoring whale wallets
for position changes.
```

#### Trading Opportunities
```
You: What trades are you looking at?
Prime: Identified 3 potential setups: 1) ETH-USDC funding arb
(92% conf), 2) SOL perp spread (78% conf), 3) BTC range mean
reversion (65% conf). Awaiting confirmation signals.
```

### Best Practices

1. **Be specific**: Ask about particular assets, metrics, or timeframes
2. **One topic at a time**: Focus questions for clearer responses
3. **Use trading terminology**: Prime understands technical terms
4. **Check context**: Prime remembers recent conversation

## Setup & Configuration

### Option 1: Mock Responses (Default)

The chat works immediately with intelligent mock responses. No setup required!

**Pros:**
- No API key needed
- Works offline
- Instant responses
- Free forever

**Cons:**
- Pattern-based responses
- No true AI reasoning
- Limited variety

### Option 2: Hugging Face Integration

Enable real AI responses with Hugging Face:

#### Step 1: Get API Key

1. Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up/login (free account)
3. Click "New token"
4. Name it (e.g., "war-room-chat")
5. Select "Read" access
6. Copy the token (starts with `hf_`)

#### Step 2: Configure Environment

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

#### Step 3: Test

Send a message in chat. You'll now get AI-generated responses!

## Technical Details

### Architecture

```
User Input → ChatBox Component → API Route → Hugging Face API
                                            ↓
User sees response ← ChatBox ← API Response ← Model Output
```

### API Endpoint

**Location**: `/app/api/chat/route.ts`

**Method**: POST

**Request Body**:
```typescript
{
  message: string,           // User's message
  agentId: string,          // "prime" (only agent supported)
  conversationHistory: {    // Last 6 messages for context
    role: 'user' | 'assistant',
    content: string
  }[]
}
```

**Response**:
```typescript
{
  response: string  // Agent's reply
}
```

### System Prompt

Prime is configured with this personality:

```
You are Prime, the lead AI trading agent for NeuroGrid Digital.
Your role is to:
- Analyze crypto market data and identify high-probability
  trading opportunities
- Filter noise from legitimate signals
- Provide concise, data-driven insights
- Communicate in a professional, precise manner
- Focus on risk management and portfolio optimization

Keep responses brief and technical. Use trading terminology.
Always think in terms of probability and risk/reward ratios.
```

### Model Parameters

- **Model**: `microsoft/Phi-3-mini-4k-instruct`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 200 (concise responses)
- **Streaming**: Disabled (faster for short responses)
- **Context Window**: Last 6 messages

## Customization Guide

### Change the Agent Personality

Edit `/app/api/chat/route.ts`:

```typescript
const PRIME_SYSTEM_PROMPT = `You are Prime, a [new personality here]...`
```

### Use a Different Model

Edit `/app/api/chat/route.ts`:

```typescript
const PRIME_MODEL = 'meta-llama/Llama-2-7b-chat-hf'  // Example
```

Popular alternatives:
- `mistralai/Mistral-7B-Instruct-v0.2`
- `meta-llama/Meta-Llama-3-8B-Instruct`
- `google/gemma-7b-it`

### Adjust Response Length

Edit `/app/api/chat/route.ts`:

```typescript
const stream = await hf.chatCompletion({
  // ...
  max_tokens: 500,  // Longer responses
})
```

### Change Chat Position

Edit `/components/ChatBox.tsx`:

```typescript
// Bottom-left instead of bottom-right
className="fixed bottom-6 left-6 ..."  // Change 'right-6' to 'left-6'
```

### Add More Agents

1. Create new agent data in `/data/mockData.ts`
2. Add API handling in `/app/api/chat/route.ts`
3. Pass different `agentId` to `<ChatBox>` component

Example:
```tsx
<ChatBox agentId="sentinel" agentName="Sentinel" />
```

## Mock Response Patterns

When no API key is configured, the system uses pattern matching:

| Keywords | Response Type |
|----------|---------------|
| status, how are you | System status report |
| eth, ethereum | ETH market analysis |
| btc, bitcoin | BTC market analysis |
| sol, solana | SOL market analysis |
| risk, portfolio | Portfolio metrics |
| trade, opportunity | Available setups |
| market, analysis | Market overview |
| _default_ | Random analytical response |

To add new patterns, edit `generateMockPrimeResponse()` in `/app/api/chat/route.ts`.

## Troubleshooting

### Chat button not appearing
- Check that `<ChatBox>` is imported in `/app/page.tsx`
- Verify no CSS z-index conflicts
- Check browser console for errors

### API errors
- Verify API key is correct (starts with `hf_`)
- Check Hugging Face token has read access
- Ensure `.env.local` file exists and is not `.env.example`
- Restart dev server after adding API key

### Slow responses
- Normal for first request (model cold start)
- Consider using a smaller model
- Check your internet connection
- Verify Hugging Face API status

### Chat not remembering context
- Context limited to last 6 messages (by design)
- Messages cleared on page refresh
- Check `conversationHistory` is being passed in API call

### Messages not displaying
- Check React DevTools for state updates
- Verify `setMessages()` is being called
- Check for JavaScript errors in console

## Rate Limits

### Hugging Face Free Tier
- ~30,000 characters/month
- ~1,000 requests/day
- May have rate limiting during peak times

### Solutions for Heavy Usage
1. Cache responses for common queries
2. Implement request throttling
3. Upgrade to Hugging Face Pro ($9/month)
4. Self-host the model locally

## Privacy & Security

### Data Handling
- Messages sent to Hugging Face API (if configured)
- No messages stored in database
- Conversation history cleared on page refresh
- API key stored in environment variables (not committed to git)

### Best Practices
1. Never commit `.env.local` to version control
2. Use separate API keys for dev/production
3. Don't send sensitive data in chat
4. Rotate API keys periodically

## Advanced Features

### Adding Streaming Responses

For a typewriter effect, modify the API route to enable streaming:

```typescript
const stream = await hf.chatCompletion({
  // ...
  stream: true,
})

// Handle streaming in component
for await (const chunk of stream) {
  // Append chunk to message
}
```

### Voice Input

Add Web Speech API:

```typescript
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  setInput(transcript)
}
```

### Multi-Agent Conversations

Create separate chat instances:

```tsx
<ChatBox agentId="prime" agentName="Prime" />
<ChatBox agentId="sentinel" agentName="Sentinel" />
```

## Examples & Use Cases

### Trading Assistant
Ask Prime about entry/exit points, risk assessment, and market conditions before making trades.

### Portfolio Monitoring
Check portfolio health, exposure levels, and risk metrics through natural conversation.

### Market Education
Learn about different trading strategies, indicators, and market dynamics by asking questions.

### Alert Explanations
When you see a trade opportunity, ask Prime to explain the rationale and risk factors.

## Support & Resources

- **Hugging Face Docs**: [https://huggingface.co/docs](https://huggingface.co/docs)
- **Phi-3 Model Card**: [https://huggingface.co/microsoft/Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)
- **Next.js API Routes**: [https://nextjs.org/docs/app/building-your-application/routing/route-handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Contributing

To improve the chat feature:

1. Add more sophisticated mock responses
2. Implement conversation export
3. Add support for code blocks in responses
4. Create preset question buttons
5. Add sentiment analysis for market mood

Happy chatting! 🤖💬
