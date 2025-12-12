# LangChain Integration Guide

## Overview

Prime has been enhanced with **LangChain** capabilities, providing advanced conversation management, structured prompting, and extensible tool integration. This guide explains the new architecture and how to leverage LangChain features.

## What Changed

### Before (Direct Hugging Face API)
- Simple direct API calls to Hugging Face
- Basic conversation history (last 6 messages)
- No structured tool support
- Limited extensibility

### After (LangChain Integration)
- Structured conversation chains with LangChain
- Enhanced memory management (up to 8 messages)
- Multiple fallback layers for reliability
- Foundation for tool calling and RAG
- Better prompt engineering with templates

## Architecture

### File Structure

```
war-room/
├── lib/langchain/
│   ├── agent.ts           # Prime's LangChain agent and chains
│   ├── memory.ts          # Conversation history utilities
│   └── tools.ts           # Trading analysis tools (future use)
└── app/api/chat/
    └── route.ts           # Updated chat endpoint using LangChain
```

### Core Components

#### 1. **Prime Chain** ([lib/langchain/agent.ts](lib/langchain/agent.ts))

The main conversational interface using LangChain's `RunnableSequence`:

```typescript
import { createPrimeChain } from '@/lib/langchain/agent';

// Create chain with conversation history
const chain = await createPrimeChain(apiKey, langchainMessages);

// Invoke with user message
const response = await chain.invoke({ input: message });
```

**Features:**
- Structured prompt templates
- Conversation history injection
- Streaming support ready
- 300 token max response

#### 2. **Memory Management** ([lib/langchain/memory.ts](lib/langchain/memory.ts))

Utilities for converting between app format and LangChain messages:

```typescript
import { convertToLangChainMessages, formatConversationContext } from '@/lib/langchain/memory';

// Convert app messages to LangChain format
const langchainMessages = convertToLangChainMessages(conversationHistory);

// Format as text for simple context
const context = formatConversationContext(conversationHistory, 6);
```

#### 3. **Trading Tools** ([lib/langchain/tools.ts](lib/langchain/tools.ts))

**Ready for future integration** - Four specialized tools built with LangChain's `DynamicStructuredTool`:

1. **Market Analysis Tool**
   - Analyzes sentiment and price action
   - Returns confidence scores and trends
   - Schema: `{ ticker: string }`

2. **Risk Assessment Tool**
   - Calculates position sizing and risk metrics
   - Evaluates max drawdown impact
   - Schema: `{ ticker: string, amount: number, currentPortfolioValue?: number }`

3. **Constitution Check Tool**
   - Validates trades against system rules
   - Checks zone limits and daily drawdown
   - Schema: `{ tradeAmount: number, zone: 'green'|'yellow'|'red', currentDailyDrawdown?: number }`

4. **Liquidity Analysis Tool**
   - Estimates slippage and gas costs
   - Analyzes liquidity depth
   - Schema: `{ ticker: string, tradeSize: number }`

**Note:** Tools are currently **not** connected to the agent (Qwen model doesn't support tool calling reliably), but infrastructure is ready for OpenAI/Anthropic models.

## Chat Flow

The chat endpoint now has a three-tier fallback system:

```
User Message
    ↓
┌─────────────────────────────────────┐
│ 1. LangChain Chain (Primary)       │
│    - Full conversation context      │
│    - Structured prompts             │
│    - 8 message history              │
└─────────────────────────────────────┘
    ↓ (if chain fails)
┌─────────────────────────────────────┐
│ 2. Simple LangChain Invoke          │
│    - Text-based context             │
│    - 6 message history              │
│    - No structured templates        │
└─────────────────────────────────────┘
    ↓ (if LangChain fails)
┌─────────────────────────────────────┐
│ 3. Mock Response (Fallback)         │
│    - Pattern matching               │
│    - No API calls                   │
│    - Always available               │
└─────────────────────────────────────┘
```

## System Prompt

Prime's enhanced system prompt includes:

- **Role Definition**: Lead AI trading agent for NeuroGrid Digital
- **Trading Guidelines**: Zone limits, position sizing, risk parameters
- **Communication Style**: Direct, concise, data-driven
- **Risk Focus**: Accuracy and risk management over aggressive returns

Located in: [lib/langchain/agent.ts:7-32](lib/langchain/agent.ts#L7-L32)

## Environment Setup

No changes required! Uses the same Hugging Face API key:

```bash
# .env.local
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## Dependencies Added

```json
{
  "langchain": "^1.x",
  "@langchain/core": "^1.0.0",
  "@langchain/community": "^1.0.7",
  "zod": "^4.x"
}
```

## Usage Examples

### Basic Chat (via API)

```typescript
// POST /api/chat
{
  "message": "What's your analysis on ETH?",
  "agentId": "prime",
  "conversationHistory": [
    { "role": "user", "content": "Hello Prime" },
    { "role": "assistant", "content": "Ready to analyze markets..." }
  ]
}
```

### Programmatic Usage

```typescript
import { createPrimeChain } from '@/lib/langchain/agent';
import { convertToLangChainMessages } from '@/lib/langchain/memory';

// Convert conversation history
const messages = convertToLangChainMessages(conversationHistory);

// Create chain
const chain = await createPrimeChain(process.env.HUGGINGFACE_API_KEY!, messages);

// Get response
const response = await chain.invoke({ input: "Analyze BTC" });
console.log(response);
```

## Future Enhancements

### 1. **Enable Tool Calling**

When using OpenAI/Anthropic models that support function calling:

```typescript
import { createPrimeAgent } from '@/lib/langchain/agent';
import { primeAgentTools } from '@/lib/langchain/tools';

// Future: Create agent with tools
const agent = await createPrimeAgent(apiKey, memory, primeAgentTools);
```

### 2. **Add RAG (Retrieval Augmented Generation)**

```typescript
import { VectorStore } from '@langchain/community/vectorstores';

// Future: Add vector store for market data
const vectorStore = await loadMarketDataVectorStore();
const retriever = vectorStore.asRetriever();

// Add to chain for context-aware responses
```

### 3. **Multi-Agent Coordination**

```typescript
// Future: Coordinate Prime with Sentinel, Executor, Warden
const multiAgentSystem = new MultiAgentOrchestrator({
  agents: [primeAgent, sentinelAgent, executorAgent, wardenAgent]
});
```

### 4. **Streaming Responses**

```typescript
// Future: Stream responses for better UX
const stream = await chain.stream({ input: message });
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Debugging

### Enable Verbose Logging

Set `verbose: true` in agent configuration:

```typescript
// In lib/langchain/agent.ts
const chain = RunnableSequence.from([...], {
  verbose: true  // Shows detailed execution logs
});
```

### Check Fallback Behavior

Monitor console for fallback messages:

```
Console Output:
- "Chain execution failed, using simple invoke" → Chain failed, using fallback
- "LangChain error, using mock response" → Complete LangChain failure, using mocks
```

### Validate Conversation History

```typescript
import { convertToLangChainMessages } from '@/lib/langchain/memory';

const messages = convertToLangChainMessages(conversationHistory);
console.log(messages); // Should show HumanMessage and AIMessage objects
```

## Performance

### Response Times

- **Chain Mode**: ~2-4 seconds (HuggingFace API latency)
- **Simple Invoke**: ~2-3 seconds
- **Mock Fallback**: <100ms (instant)

### Token Usage

- **Max Input Context**: ~2000 tokens (8 messages + system prompt)
- **Max Output**: 300 tokens per response
- **Average Response**: 100-200 tokens

## API Compatibility

The chat API endpoint remains **100% backward compatible**:

- Same request/response format
- Same error handling
- Same mock fallback behavior
- **Zero breaking changes** for existing clients

## Migration Notes

If you were using the old endpoint directly:

### ✅ No Changes Needed

The API contract is unchanged. LangChain is purely an internal enhancement.

### ⚠️ Only If Customizing

If you were modifying `app/api/chat/route.ts` directly:

- Import new utilities from `@/lib/langchain/*`
- Use `createPrimeChain()` instead of direct HuggingFace calls
- Leverage conversation history utilities in `memory.ts`

## Testing

### Test Without API Key

Mock responses still work without `HUGGINGFACE_API_KEY`:

```bash
# Test endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is ETH doing?","agentId":"prime"}'
```

### Test With LangChain

1. Set `HUGGINGFACE_API_KEY` in `.env.local`
2. Start dev server: `npm run dev`
3. Open chat interface and test conversation flow
4. Check browser console for any errors

## Troubleshooting

### Build Errors

If you see module resolution errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Rebuild
npm run build
```

### Type Errors

Ensure TypeScript can find LangChain types:

```bash
# Check types are installed
ls node_modules/@types/

# Restart TypeScript server in your IDE
```

### Runtime Errors

Check these common issues:

1. **API Key**: Verify `HUGGINGFACE_API_KEY` is set
2. **Model**: Ensure Qwen/Qwen2.5-7B-Instruct is accessible
3. **Message Format**: Conversation history should be `{ role, content }[]`

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [Hugging Face Models](https://huggingface.co/models)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

For issues or questions:

1. Check this guide first
2. Review [CHAT_GUIDE.md](CHAT_GUIDE.md) for chat feature details
3. Examine console logs for specific errors
4. Review LangChain documentation for advanced usage

---

**Built with LangChain** | **Powered by Qwen 2.5** | **NeuroGrid Digital**
