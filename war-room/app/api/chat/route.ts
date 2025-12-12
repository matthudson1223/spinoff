import { HfInference } from '@huggingface/inference'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Hugging Face client
// Note: In production, use environment variable: process.env.HUGGINGFACE_API_KEY
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '')

// Model configuration for Prime agent
const PRIME_MODEL = 'microsoft/Phi-3-mini-4k-instruct'

// System prompt for Prime agent
const PRIME_SYSTEM_PROMPT = `You are Prime, the lead AI trading agent for NeuroGrid Digital. Your role is to:
- Analyze crypto market data and identify high-probability trading opportunities
- Filter noise from legitimate signals
- Provide concise, data-driven insights
- Communicate in a professional, precise manner
- Focus on risk management and portfolio optimization

Keep responses brief and technical. Use trading terminology. Always think in terms of probability and risk/reward ratios.`

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

    // For now, only Prime agent uses Hugging Face
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

    // Build conversation context
    const messages = [
      { role: 'system', content: PRIME_SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ]

    // Call Hugging Face API
    let fullResponse = ''

    try {
      const stream = await hf.chatCompletion({
        model: PRIME_MODEL,
        messages: messages as any,
        max_tokens: 200,
        temperature: 0.7,
        stream: false,
      })

      if ('choices' in stream && stream.choices[0]?.message?.content) {
        fullResponse = stream.choices[0].message.content
      } else {
        // Fallback to mock if streaming fails
        fullResponse = generateMockPrimeResponse(message)
      }
    } catch (apiError) {
      console.error('Hugging Face API error:', apiError)
      // Fallback to mock response
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
  const lowerMessage = message.toLowerCase()

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
