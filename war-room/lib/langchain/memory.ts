import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Converts conversation history to LangChain messages
 * @param conversationHistory - Array of previous messages
 * @returns Array of BaseMessage instances
 */
export function convertToLangChainMessages(conversationHistory: ConversationMessage[]): BaseMessage[] {
  return conversationHistory.map(msg =>
    msg.role === 'user'
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
}

/**
 * Converts LangChain messages back to conversation format
 * @param messages - Array of BaseMessage instances
 * @returns Array of conversation messages
 */
export function convertFromLangChainMessages(messages: BaseMessage[]): ConversationMessage[] {
  return messages.map(msg => ({
    role: msg._getType() === 'human' ? 'user' as const : 'assistant' as const,
    content: msg.content as string,
  }));
}

/**
 * Formats conversation history as a text summary
 * @param conversationHistory - Array of previous messages
 * @param maxMessages - Maximum number of recent messages to include
 * @returns Formatted conversation string
 */
export function formatConversationContext(
  conversationHistory: ConversationMessage[],
  maxMessages: number = 6
): string {
  const recentMessages = conversationHistory.slice(-maxMessages);

  return recentMessages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Prime'}: ${msg.content}`)
    .join('\n');
}

// Export a placeholder type for backwards compatibility
export type BufferMemory = {
  chatHistory: {
    getMessages: () => Promise<BaseMessage[]>;
  };
};
