import { Agent, TradeProposal, ExecutedTrade, Constitution } from '@/types'

export const mockAgents: Agent[] = [
  {
    id: 'prime',
    name: 'Prime',
    icon: 'Brain',
    status: 'online',
    currentAction: 'Filtering Noise...',
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    icon: 'Eye',
    status: 'error',
    currentAction: 'Integration Pending...',
  },
  {
    id: 'executor',
    name: 'Executor',
    icon: 'Zap',
    status: 'error',
    currentAction: 'Integration Pending...',
  },
  {
    id: 'warden',
    name: 'Warden',
    icon: 'Shield',
    status: 'error',
    currentAction: 'Integration Pending...',
  },
  {
    id: 'cto',
    name: 'CTO',
    icon: 'Code',
    status: 'online',
    currentAction: 'Analyzing System Architecture...',
  },
]

export const mockTradeProposals: TradeProposal[] = [
  {
    id: '1',
    ticker: 'ETH-USDC',
    confidence: 92,
    reason: 'Funding Rate Arbitrage',
    gas: 2.50,
    slippage: 0.1,
    liquidity: 4000000,
    zone: 'green',
    timestamp: Date.now() - 30000,
  },
  {
    id: '2',
    ticker: 'PEPE-SOL',
    confidence: 65,
    reason: 'Social Volume Spike',
    gas: 0.001,
    slippage: 0.5,
    liquidity: 150000,
    zone: 'yellow',
    timestamp: Date.now() - 15000,
  },
]

export const mockExecutedTrades: ExecutedTrade[] = [
  {
    id: '1',
    ticker: 'SOL-USDC',
    timestamp: Date.now() - 120000,
    txHash: '0x7a3f...9d2c',
    profit: 12.40,
    gas: 0.02,
  },
  {
    id: '2',
    ticker: 'BTC-USDT',
    timestamp: Date.now() - 240000,
    txHash: '0x4b8e...1a5f',
    profit: -3.20,
    gas: 1.50,
  },
]

export const constitution: Constitution = {
  maxDailyDrawdown: '5%',
  greenZoneLimit: '$20',
  yellowZoneLimit: '$100',
  redZoneLimit: 'REQUIRES_MANUAL_APPROVAL',
}
