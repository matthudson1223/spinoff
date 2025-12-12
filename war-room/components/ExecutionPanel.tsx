'use client'

import { ExecutedTrade } from '@/types'
import { DollarSign, AlertOctagon, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExecutionPanelProps {
  trades: ExecutedTrade[]
  portfolioValue: number
  dailyChange: number
  dailyChangePercent: number
  onEmergencyHalt: () => void
}

export default function ExecutionPanel({
  trades,
  portfolioValue,
  dailyChange,
  dailyChangePercent,
  onEmergencyHalt,
}: ExecutionPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <div className="h-full bg-slate-900 border-l border-emerald-500/20 p-4 flex flex-col">
      {/* Top Section: LIVE P&L */}
      <div className="mb-6">
        <h2 className="text-emerald-500 text-sm font-bold tracking-wider mb-4 cyber-glow-green flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          LIVE P&L
        </h2>

        {/* Portfolio Value */}
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-4 mb-3">
          <div className="text-xs text-gray-500 mb-1">Total Portfolio Value</div>
          <div className="text-3xl font-bold text-emerald-500 font-mono cyber-glow-green">
            {formatCurrency(portfolioValue)}
          </div>
        </div>

        {/* 24h Change */}
        <div className={`bg-slate-800/50 border rounded-lg p-4 mb-4 ${
          dailyChange >= 0
            ? 'border-emerald-500/30'
            : 'border-rose-500/30'
        }`}>
          <div className="text-xs text-gray-500 mb-1">24h Change</div>
          <div className="flex items-center gap-2">
            {dailyChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-500" />
            )}
            <div className={`text-xl font-bold font-mono ${
              dailyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {dailyChange >= 0 ? '+' : ''}{formatCurrency(dailyChange)}
            </div>
            <div className={`text-sm font-mono ${
              dailyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              ({dailyChange >= 0 ? '+' : ''}{dailyChangePercent.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* The Kill Switch */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEmergencyHalt}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500 text-rose-500 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
        >
          <AlertOctagon className="w-5 h-5" />
          EMERGENCY HALT
        </motion.button>
      </div>

      {/* Bottom Section: TRANSACTION HISTORY */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <h2 className="text-emerald-500 text-sm font-bold tracking-wider mb-4 cyber-glow-green">
          TRANSACTION HISTORY
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              No transactions yet
            </div>
          ) : (
            trades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded p-3 hover:border-emerald-500/30 transition-colors"
              >
                {/* Top Row: Ticker and Profit */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-gray-100 font-mono text-sm">
                      {trade.ticker}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {formatTime(trade.timestamp)}
                    </div>
                  </div>
                  <div className={`text-right ${
                    trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    <div className="text-sm font-bold font-mono">
                      {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Gas: {formatCurrency(trade.gas)}
                    </div>
                  </div>
                </div>

                {/* Tx Hash */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500 font-mono">
                    <span>Tx:</span>
                    <span className="text-emerald-500/70">{trade.txHash}</span>
                  </div>
                  <a
                    href={`#`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
