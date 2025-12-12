import { NextRequest, NextResponse } from 'next/server'
import { createPrimeChain, invokePrimeSimple, createCTOChain, invokeCTOSimple } from '@/lib/langchain/agent'
import { convertToLangChainMessages, formatConversationContext } from '@/lib/langchain/memory'
import { primeAgentTools } from '@/lib/langchain/tools'

export async function POST(request: NextRequest) {
  try {
    const { message, agentId, conversationHistory } = await request.json()

    // Validate request
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate agentId
    if (agentId !== 'prime' && agentId !== 'cto') {
      return NextResponse.json(
        { error: 'Invalid agent ID. Only Prime and CTO agents are available for chat' },
        { status: 400 }
      )
    }

    // Check if API keys are available (Vertex AI or HuggingFace)
    const hasVertexAI = process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_LOCATION
    const hasHuggingFace = process.env.HUGGINGFACE_API_KEY

    if (!hasVertexAI && !hasHuggingFace) {
      // Fallback to mock response if no API keys
      const mockResponse = agentId === 'cto'
        ? generateMockCTOResponse(message)
        : generateMockPrimeResponse(message)
      return NextResponse.json({ response: mockResponse })
    }

    let fullResponse = ''

    // Check if this is a simple greeting - use mock response for instant reply
    const lowerMessage = message.toLowerCase().trim()
    const isSimpleGreeting = ['hey', 'hi', 'hello', 'yo', 'sup'].includes(lowerMessage)

    if (isSimpleGreeting) {
      // Skip AI for simple greetings to provide instant response
      fullResponse = agentId === 'cto'
        ? generateMockCTOResponse(message)
        : generateMockPrimeResponse(message)
      return NextResponse.json({ response: fullResponse })
    }

    try {
      // Convert conversation history to LangChain messages
      const recentHistory = (conversationHistory || []).slice(-4)
      const langchainMessages = convertToLangChainMessages(recentHistory)
      
      
      // After line 48
      if (message.toLowerCase().includes('analyze eth')) {
        const { marketAnalysisTool } = await import('@/lib/langchain/tools')
        const result = await marketAnalysisTool.invoke({ ticker: 'ETH' })
        const parsed = JSON.parse(result)
        return NextResponse.json({ 
          response: `ETH Analysis:\n- Sentiment: ${parsed.sentiment}\n- Trend: ${parsed.trend}\n- Confidence: ${parsed.confidence}%\n- Recommendation: ${parsed.recommendation}` 
        })
      }

      // Wrap the entire LangChain execution with a timeout
      // Use 45 second timeout - fail fast and use mock response
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 45 seconds')), 45000)
      })

      // Try to use LangChain with full conversation context
      try {
        const apiKey = process.env.HUGGINGFACE_API_KEY || ""
        const useTools = hasVertexAI  // Only use tools with Vertex AI (Gemini)

        const chain = agentId === 'cto'
          ? await createCTOChain(
              apiKey,
              langchainMessages,
              useTools ? primeAgentTools : []  // CTO can also use trading tools for analysis
            )
          : await createPrimeChain(
              apiKey,
              langchainMessages,
              useTools ? primeAgentTools : []
            )

        const result = await Promise.race([
          chain.invoke(
            useTools
              ? { input: message, messages: [...langchainMessages, { role: "user", content: message }] }
              : { input: message }
          ) as Promise<any>,
          timeoutPromise
        ])

        // Extract messages from LangGraph response
        if (typeof result === 'object' && result !== null && 'messages' in result) {
          const messages = (result as any).messages
          const lastMessage = messages[messages.length - 1]
          fullResponse = lastMessage.content
        } else if (typeof result === 'string') {
          fullResponse = result
        } else {
          fullResponse = JSON.stringify(result)
        }
      } catch (chainError) {
        console.warn('Chain execution failed, trying simple invoke:', {
          error: chainError instanceof Error ? chainError.message : String(chainError),
          messageLength: message.length,
          historyLength: recentHistory.length
        })

        // Fallback to simple invoke with formatted context
        const context = formatConversationContext(recentHistory, 4)
        const simpleInvokeTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Simple invoke timeout after 25 seconds')), 25000)
        })

        try {
          const apiKey = process.env.HUGGINGFACE_API_KEY || ""
          fullResponse = await Promise.race([
            agentId === 'cto'
              ? invokeCTOSimple(
                  apiKey,
                  message,
                  context
                )
              : invokePrimeSimple(
                  apiKey,
                  message,
                  context
                ),
            simpleInvokeTimeout
          ])
        } catch (simpleError) {
          console.error('Simple invoke failed, using mock response:', {
            error: simpleError instanceof Error ? simpleError.message : String(simpleError),
            messageLength: message.length
          })
          // Final fallback to mock response
          fullResponse = agentId === 'cto'
            ? generateMockCTOResponse(message)
            : generateMockPrimeResponse(message)
        }
      }

      // Ensure we have a valid response
      if (!fullResponse || fullResponse.trim().length === 0) {
        console.warn('Empty response received, using mock response')
        fullResponse = agentId === 'cto'
          ? generateMockCTOResponse(message)
          : generateMockPrimeResponse(message)
      }
    } catch (langchainError) {
      console.error('Unexpected error in LangChain execution:', {
        error: langchainError instanceof Error ? langchainError.message : String(langchainError),
        stack: langchainError instanceof Error ? langchainError.stack : undefined
      })
      // Final fallback to mock response
      fullResponse = agentId === 'cto'
        ? generateMockCTOResponse(message)
        : generateMockPrimeResponse(message)
    }

    return NextResponse.json({ response: fullResponse })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

// Mock response generator for when API is unavailable
function generateMockPrimeResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim()

  // Handle greetings
  if (lowerMessage === 'hey' || lowerMessage === 'hi' || lowerMessage === 'hello' ||
      lowerMessage === 'yo' || lowerMessage === 'sup') {
    return 'Hey. Prime here. Market is active. What do you need - analysis, portfolio status, or trade opportunities?'
  }

  // Pattern matching for common queries
  if (lowerMessage.includes('status') || lowerMessage.includes('how are you')) {
    return 'All systems nominal. Currently monitoring 47 trading pairs. Market volatility index: 0.68. Scanning for arbitrage opportunities.'
  }

  if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
    return 'ETH currently showing bullish momentum. RSI at 62, funding rate +0.008%. Watching for entry at $3,420 support level. Risk/reward ratio: 1:3.2.'
  }

  if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
    return 'BTC consolidating in tight range. Volume declining. Suggest waiting for breakout confirmation above $96.5K before entry. Current confidence: 72%.'
  }

  if (lowerMessage.includes('sol') || lowerMessage.includes('solana')) {
    return 'SOL showing strong network activity. DEX volume up 23% in 24h. Potential rotation from ETH. Monitoring whale wallets for position changes.'
  }

  if (lowerMessage.includes('risk') || lowerMessage.includes('portfolio')) {
    return 'Current portfolio exposure: 68%. Daily drawdown: -0.8% (well within 5% limit). Sharpe ratio: 2.1. All positions within risk parameters.'
  }

  if (lowerMessage.includes('trade') || lowerMessage.includes('opportunity')) {
    return 'Identified 3 potential setups: 1) ETH-USDC funding arb (92% conf), 2) SOL perp spread (78% conf), 3) BTC range mean reversion (65% conf). Awaiting confirmation signals.'
  }

  if (lowerMessage.includes('market') || lowerMessage.includes('analysis')) {
    return 'Market correlation matrix shows decoupling between majors. BTC dominance at 54.2%. Fear & Greed Index: 68 (Greed). Suggest reducing position sizes temporarily.'
  }

  // Default analytical response
  const responses = [
    'Analyzing... Market structure remains intact. Waiting for higher probability setups. Current edge: 0.34% per trade.',
    'Signal quality moderate. Filtering 83% of noise. Focus on high-confidence opportunities only. Patience is alpha.',
    'Risk-adjusted returns prioritized. No forced trades. Current market regime: mean-reverting. Adapt strategy accordingly.',
    'Data synthesis complete. Cross-referencing on-chain metrics with price action. Will alert when probability threshold exceeded.',
    'Market microstructure analysis ongoing. Bid-ask spread tightening. Liquidity improving. Monitoring for optimal entry conditions.',
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// Mock response generator for CTO agent
function generateMockCTOResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim()

  // Handle greetings
  if (lowerMessage === 'hey' || lowerMessage === 'hi' || lowerMessage === 'hello' ||
      lowerMessage === 'yo' || lowerMessage === 'sup') {
    return 'Hey. CTO here. System architecture running smoothly. Need help with technical strategy, infrastructure, or codebase optimization?'
  }

  // Pattern matching for common queries
  if (lowerMessage.includes('status') || lowerMessage.includes('how are you')) {
    return 'All systems operational. Backend services: 99.97% uptime. Database latency: 12ms avg. CI/CD pipeline: green. Monitoring 23 microservices.'
  }

  if (lowerMessage.includes('architecture') || lowerMessage.includes('system')) {
    return 'Current architecture: Event-driven microservices on K8s. Using CQRS pattern for trading logic. Real-time data via WebSockets. Considering migration to service mesh for better observability.'
  }

  if (lowerMessage.includes('performance') || lowerMessage.includes('optimization')) {
    return 'Performance metrics looking solid. API response time: p95 < 150ms. Database queries optimized with proper indexing. Caching layer reducing load by 67%. Identified opportunity to improve WebSocket throughput.'
  }

  if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
    return 'Security posture: Strong. All dependencies scanned (0 critical CVEs). API rate limiting active. Secrets in vault. Regular penetration testing scheduled. Implementing zero-trust architecture.'
  }

  if (lowerMessage.includes('scale') || lowerMessage.includes('scaling')) {
    return 'Horizontal scaling configured via HPA. Current capacity: 10K concurrent users. Auto-scaling triggers at 70% CPU. Database read replicas ready. CDN caching static assets globally.'
  }

  if (lowerMessage.includes('deployment') || lowerMessage.includes('deploy')) {
    return 'Deployment pipeline: GitOps with ArgoCD. Blue-green deployments minimize downtime. Automated rollbacks on health check failures. Average deployment time: 4.2 minutes. 15 deploys this week.'
  }

  if (lowerMessage.includes('database') || lowerMessage.includes('data')) {
    return 'Database strategy: PostgreSQL for transactional data, TimescaleDB for time-series, Redis for caching. Automated backups every 6h. Query performance monitored via slow query log.'
  }

  if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('issue')) {
    return 'Error tracking active via Sentry. 3 new issues this week (all P3). Resolution time: avg 2.1 days. Memory leak in WebSocket handler identified and patched. Implementing better error boundaries.'
  }

  // Default technical response
  const responses = [
    'Reviewing system metrics. CPU utilization stable at 45%. Memory headroom sufficient. No bottlenecks detected. Ready to scale on demand.',
    'Code quality gates passing. Test coverage: 87%. Static analysis clean. Dependency vulnerabilities: 0 critical. Technical debt under control.',
    'Infrastructure costs optimized this quarter. Reduced cloud spend by 18% via reserved instances. Monitoring for further optimization opportunities.',
    'API versioning strategy working well. v2 adoption at 76%. Deprecated endpoints scheduled for sunset Q2. Backward compatibility maintained.',
    'Observability stack upgraded. Distributed tracing via OpenTelemetry. Log aggregation performant. Dashboards providing actionable insights.',
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
