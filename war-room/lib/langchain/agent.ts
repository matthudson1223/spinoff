import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage } from "@langchain/core/messages";

const PRIME_SYSTEM_PROMPT = `You are Prime, the lead AI trading agent for NeuroGrid Digital's autonomous trading system.

Your role and capabilities:
- Analyze cryptocurrency market data and identify high-probability trading opportunities
- Filter noise from legitimate signals using advanced pattern recognition
- Provide concise, data-driven insights backed by technical analysis
- Focus on risk management and portfolio optimization
- Communicate in professional trading terminology

Trading Guidelines:
- GREEN ZONE: Trades up to $20 (low risk, high confidence signals)
- YELLOW ZONE: Trades $20-$100 (moderate risk, requires careful analysis)
- RED ZONE: Trades over $100 (high risk, requires manual approval)
- Maximum daily drawdown: 5%
- Always calculate position sizing relative to portfolio value
- Consider liquidity, slippage, and gas costs in all recommendations

Communication Style:
- Be direct and concise (keep responses under 150 words)
- Lead with actionable insights
- Support claims with data when available
- Use trading terminology appropriately
- Acknowledge uncertainty when present
- Focus on what matters most for the decision at hand

Remember: You are the strategic intelligence layer. Your analysis drives trading decisions that impact real capital. Prioritize accuracy and risk management over aggressive returns.`;

const CTO_SYSTEM_PROMPT = `You are the CTO (Chief Technology Officer) of NeuroGrid Digital's autonomous trading system.

Your role and capabilities:
- Oversee system architecture, infrastructure, and technical operations
- Monitor performance metrics, uptime, and system health
- Ensure security, scalability, and reliability of all services
- Provide technical insights on deployments, optimizations, and infrastructure
- Guide technical strategy and engineering best practices

Technical Focus Areas:
- System Architecture: Microservices, event-driven design, scalability patterns
- Performance: API response times, database optimization, caching strategies
- Security: Vulnerability management, access control, secure coding practices
- Infrastructure: Kubernetes, CI/CD pipelines, cloud optimization
- Monitoring: Observability, logging, metrics, alerting
- Data: Database design, data pipelines, backup strategies

Communication Style:
- Be direct and technical (keep responses under 150 words)
- Use engineering terminology and metrics
- Provide concrete system status and performance data
- Support claims with specific metrics when available
- Acknowledge technical debt and trade-offs honestly
- Focus on actionable technical insights

Remember: You are the technical backbone of the trading system. Your decisions impact system reliability, performance, and security. Balance innovation with stability.`;

/**
 * Creates a LangChain conversation chain for Prime
 * @param apiKey - Hugging Face API key
 * @param conversationHistory - Array of previous messages
 * @returns RunnableSequence for chat
 */
export async function createPrimeChain(
  apiKey: string,
  conversationHistory: BaseMessage[] = []
) {
  // Initialize Hugging Face model with timeout
  const model = new HuggingFaceInference({
    model: "microsoft/Phi-3-mini-4k-instruct",
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 300,
    timeout: 30000, // 30 second timeout - fail fast to fallback
  });

  // Create prompt template with conversation history
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", PRIME_SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  // Create the chain
  const chain = RunnableSequence.from([
    {
      input: (input: { input: string }) => input.input,
      chat_history: () => conversationHistory,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return chain;
}

/**
 * Simpler chat model without conversation history for fallback
 * @param apiKey - Hugging Face API key
 * @returns HuggingFaceInference instance
 */
export function createSimpleChatModel(apiKey: string) {
  return new HuggingFaceInference({
    model: "microsoft/Phi-3-mini-4k-instruct",
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 200,
    timeout: 30000, // 30 second timeout - fail fast to fallback
  });
}

/**
 * Invoke Prime with a simple message (without full chain)
 * @param apiKey - Hugging Face API key
 * @param message - User message
 * @param conversationContext - Optional conversation context
 * @returns AI response
 */
export async function invokePrimeSimple(
  apiKey: string,
  message: string,
  conversationContext: string = ""
): Promise<string> {
  const model = createSimpleChatModel(apiKey);

  const fullPrompt = conversationContext
    ? `${PRIME_SYSTEM_PROMPT}\n\nConversation context:\n${conversationContext}\n\nUser: ${message}\n\nPrime:`
    : `${PRIME_SYSTEM_PROMPT}\n\nUser: ${message}\n\nPrime:`;

  const response = await model.invoke(fullPrompt);
  return response;
}

/**
 * Creates a LangChain conversation chain for CTO
 * @param apiKey - Hugging Face API key
 * @param conversationHistory - Array of previous messages
 * @returns RunnableSequence for chat
 */
export async function createCTOChain(
  apiKey: string,
  conversationHistory: BaseMessage[] = []
) {
  // Initialize Hugging Face model with timeout
  const model = new HuggingFaceInference({
    model: "microsoft/Phi-3-mini-4k-instruct",
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 300,
    timeout: 30000, // 30 second timeout - fail fast to fallback
  });

  // Create prompt template with conversation history
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", CTO_SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  // Create the chain
  const chain = RunnableSequence.from([
    {
      input: (input: { input: string }) => input.input,
      chat_history: () => conversationHistory,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return chain;
}

/**
 * Invoke CTO with a simple message (without full chain)
 * @param apiKey - Hugging Face API key
 * @param message - User message
 * @param conversationContext - Optional conversation context
 * @returns AI response
 */
export async function invokeCTOSimple(
  apiKey: string,
  message: string,
  conversationContext: string = ""
): Promise<string> {
  const model = createSimpleChatModel(apiKey);

  const fullPrompt = conversationContext
    ? `${CTO_SYSTEM_PROMPT}\n\nConversation context:\n${conversationContext}\n\nUser: ${message}\n\nCTO:`
    : `${CTO_SYSTEM_PROMPT}\n\nUser: ${message}\n\nCTO:`;

  const response = await model.invoke(fullPrompt);
  return response;
}
