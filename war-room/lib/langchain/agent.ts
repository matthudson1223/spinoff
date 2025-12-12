import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage } from "@langchain/core/messages";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

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
 * Creates a ChatVertexAI model instance
 * @param temperature - Model temperature (default 0.7)
 * @returns ChatVertexAI instance configured for tool calling
 */
function createVertexAIModel(temperature: number = 0.7) {
  return new ChatVertexAI({
    model: "gemini-1.5-flash-002",  // Using Gemini 1.5 Flash - faster and more widely available
    temperature: temperature,
    maxOutputTokens: 4096,
    // Project and location are read from environment variables:
    // GOOGLE_PROJECT_ID and GOOGLE_LOCATION
  });
}

/**
 * Creates a LangChain conversation chain for Prime with tool calling support
 * @param apiKey - Hugging Face API key (for fallback)
 * @param conversationHistory - Array of previous messages
 * @param tools - Array of tools to bind to the agent
 * @returns AgentExecutor or RunnableSequence for chat
 */
export async function createPrimeChain(
  apiKey: string,
  conversationHistory: BaseMessage[] = [],
  tools: any[] = []
) {
  // Check if Vertex AI is configured
  const hasVertexAI = process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_LOCATION;

  if (hasVertexAI && tools.length > 0) {
    // Use Google Vertex AI (Gemini) with tool calling
    const model = createVertexAIModel();

    // Create React agent using LangGraph
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      messageModifier: PRIME_SYSTEM_PROMPT,
    });

    // Return the agent graph
    return agent;
  }

  // Fallback to HuggingFace without tool calling
  const model = new HuggingFaceInference({
    model: "microsoft/Phi-3-mini-4k-instruct",
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 300,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", PRIME_SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

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
  });
}

/**
 * Simple invoke helper with Vertex AI or HuggingFace fallback
 */
async function invokeSimpleModel(
  systemPrompt: string,
  message: string,
  conversationContext: string = ""
): Promise<string> {
  const hasVertexAI = process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_LOCATION;

  if (hasVertexAI) {
    const model = createVertexAIModel(0.7);
    const fullPrompt = conversationContext
      ? `${systemPrompt}\n\nConversation context:\n${conversationContext}\n\nUser: ${message}`
      : `${systemPrompt}\n\nUser: ${message}`;

    const response = await model.invoke(fullPrompt);
    return response.content as string;
  }

  // Fallback to HuggingFace
  const model = createSimpleChatModel(process.env.HUGGINGFACE_API_KEY || "");
  const fullPrompt = conversationContext
    ? `${systemPrompt}\n\nConversation context:\n${conversationContext}\n\nUser: ${message}\n\nAssistant:`
    : `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

  return await model.invoke(fullPrompt);
}

/**
 * Invoke Prime with a simple message (without full chain)
 * @param apiKey - API key (not used directly, reads from env)
 * @param message - User message
 * @param conversationContext - Optional conversation context
 * @returns AI response
 */
export async function invokePrimeSimple(
  apiKey: string,
  message: string,
  conversationContext: string = ""
): Promise<string> {
  return invokeSimpleModel(PRIME_SYSTEM_PROMPT, message, conversationContext);
}

/**
 * Creates a LangChain conversation chain for CTO with tool calling support
 * @param apiKey - Hugging Face API key (for fallback)
 * @param conversationHistory - Array of previous messages
 * @param tools - Array of tools to bind to the agent
 * @returns AgentExecutor or RunnableSequence for chat
 */
export async function createCTOChain(
  apiKey: string,
  conversationHistory: BaseMessage[] = [],
  tools: any[] = []
) {
  // Check if Vertex AI is configured
  const hasVertexAI = process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_LOCATION;

  if (hasVertexAI && tools.length > 0) {
    // Use Google Vertex AI (Gemini) with tool calling
    const model = createVertexAIModel();

    // Create React agent using LangGraph
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      messageModifier: CTO_SYSTEM_PROMPT,
    });

    // Return the agent graph
    return agent;
  }

  // Fallback to HuggingFace without tool calling
  const model = new HuggingFaceInference({
    model: "microsoft/Phi-3-mini-4k-instruct",
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 300,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", CTO_SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

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
 * @param apiKey - API key (not used directly, reads from env)
 * @param message - User message
 * @param conversationContext - Optional conversation context
 * @returns AI response
 */
export async function invokeCTOSimple(
  apiKey: string,
  message: string,
  conversationContext: string = ""
): Promise<string> {
  return invokeSimpleModel(CTO_SYSTEM_PROMPT, message, conversationContext);
}
