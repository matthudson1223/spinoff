import { NextRequest, NextResponse } from 'next/server'
import { createPrimeChain, invokePrimeSimple } from '@/lib/langchain/agent'
import { convertToLangChainMessages, formatConversationContext } from '@/lib/langchain/memory'

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

    // For now, only Prime agent uses AI chat
    if (agentId !== 'prime') {
      return NextResponse.json(
        { error: 'Only Prime agent is available for chat' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      // Fallback to mock response if no API key
      const mockResponse = generateMockPrimeResponse(message)
      return NextResponse.json({ response: mockResponse })
    }

    let fullResponse = ''

    // Check if this is a simple greeting - use mock response for instant reply
    const lowerMessage = message.toLowerCase().trim()
    const isSimpleGreeting = ['hey', 'hi', 'hello', 'yo', 'sup'].includes(lowerMessage)

    if (isSimpleGreeting) {
      // Skip AI for simple greetings to provide instant response
      fullResponse = generateMockPrimeResponse(message)
      return NextResponse.json({ response: fullResponse })
    }

    try {
      // Convert conversation history to LangChain messages
      const recentHistory = (conversationHistory || []).slice(-8)
      const langchainMessages = convertToLangChainMessages(recentHistory)

      // Wrap the entire LangChain execution with a timeout
      // Use 15 second timeout - fail fast and use mock response
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      })

      // Try to use LangChain with full conversation context
      try {
        const chain = await createPrimeChain(
          process.env.HUGGINGFACE_API_KEY,
          langchainMessages
        )

        fullResponse = await Promise.race([
          chain.invoke({ input: message }),
          timeoutPromise
        ])
      } catch (chainError) {
        console.warn('Chain execution failed, using simple invoke:', chainError)

        // Fallback to simple invoke with formatted context
        const context = formatConversationContext(recentHistory, 6)
        fullResponse = await Promise.race([
          invokePrimeSimple(
            process.env.HUGGINGFACE_API_KEY,
            message,
            context
          ),
          timeoutPromise
        ])
      }

      // Ensure we have a valid response
      if (!fullResponse || fullResponse.trim().length === 0) {
        throw new Error('Empty response from LangChain')
      }
    } catch (langchainError) {
      console.error('LangChain error, using mock response:', langchainError)
      // Final fallback to mock response
      fullResponse = generateMockPrimeResponse(message)
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
