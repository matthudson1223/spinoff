export type AgentStatus = 'online' | 'thinking' | 'error'

export interface Agent {
  id: string
  name: string
  icon: string
  status: AgentStatus
  currentAction: string
}

export type TradeZone = 'green' | 'yellow' | 'red'

export interface TradeProposal {
  id: string
  ticker: string
  confidence: number
  reason: string
  gas: number
  slippage: number
  liquidity: number
  zone: TradeZone
  timestamp: number
}

export interface ExecutedTrade {
  id: string
  ticker: string
  timestamp: number
  txHash: string
  profit: number
  gas: number
}

export interface Constitution {
  maxDailyDrawdown: string
  greenZoneLimit: string
  yellowZoneLimit: string
  redZoneLimit: string
}

export type MessageRole = 'user' | 'agent'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  agentId?: string
  agentName?: string
  timestamp: number
}
