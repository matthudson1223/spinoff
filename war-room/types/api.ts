/**
 * API Response Types for Chat Endpoint
 */

/**
 * Source of the chat response
 */
export type ResponseSource =
  | 'vertex-ai'      // Google Vertex AI (Gemini)
  | 'huggingface'    // HuggingFace model
  | 'mock'           // Pattern-based mock response

/**
 * Structured chat response
 */
export interface ChatResponse {
  /** The AI-generated response text */
  response: string

  /** Source of the response */
  source: ResponseSource

  /** Confidence score (1.0 = real AI, 0.5 = mock) */
  confidence: number

  /** Optional metadata about the response */
  metadata?: {
    /** Model used (e.g., "gemini-1.5-flash-002") */
    model?: string

    /** Whether tools were used in generation */
    usedTools?: boolean

    /** Approximate token count (if available) */
    tokens?: number

    /** Response time in milliseconds */
    responseTime?: number
  }
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  /** User message */
  message: string

  /** Agent ID (prime or cto) */
  agentId: 'prime' | 'cto'

  /** Optional conversation history */
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

/**
 * Error response
 */
export interface ChatError {
  /** Error message */
  error: string

  /** Error code (optional) */
  code?: string
}
