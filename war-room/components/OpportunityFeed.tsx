'use client'

import { TradeProposal } from '@/types'
import { TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface OpportunityFeedProps {
  proposals: TradeProposal[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export default function OpportunityFeed({
  proposals,
  onApprove,
  onReject,
}: OpportunityFeedProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatLiquidity = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'green':
        return 'border-emerald-500/50 bg-emerald-500/5'
      case 'yellow':
        return 'border-amber-400/50 bg-amber-400/5'
      case 'red':
        return 'border-rose-500/50 bg-rose-500/5'
      default:
        return 'border-slate-700'
    }
  }

  const getZoneBadge = (zone: string) => {
    switch (zone) {
      case 'green':
        return (
          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30">
            AUTO-EXECUTE
          </span>
        )
      case 'yellow':
        return (
          <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-400 rounded border border-amber-400/30">
            NEEDS APPROVAL
          </span>
        )
      case 'red':
        return (
          <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded border border-rose-500/30">
            HIGH RISK
          </span>
        )
    }
  }

  return (
    <div className="h-full bg-slate-900 p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-emerald-500 text-sm font-bold tracking-wider cyber-glow-green flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          INCOMING SIGNALS (Waitlist)
        </h2>
        <div className="text-xs text-gray-500 font-mono">
          {proposals.length} PENDING
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {proposals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            No signals in queue
          </div>
        ) : (
          proposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              className={`border rounded-lg p-4 ${getZoneColor(proposal.zone)} hover:shadow-lg transition-all`}
            >
              {/* Top: Ticker + Confidence */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-100 font-mono">
                    {proposal.ticker}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getZoneBadge(proposal.zone)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-500 font-mono">
                    {proposal.confidence}%
                  </div>
                  <div className="text-xs text-gray-500">Conf</div>
                </div>
              </div>

              {/* Middle: The "Why" */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded border border-slate-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {proposal.reason}
                  </p>
                </div>
              </div>

              {/* Bottom: Data Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
                  <div className="text-xs text-gray-500 mb-1">Est. Gas</div>
                  <div className="text-sm font-mono font-bold text-gray-100">
                    {formatCurrency(proposal.gas)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
                  <div className="text-xs text-gray-500 mb-1">Slippage</div>
                  <div className="text-sm font-mono font-bold text-gray-100">
                    {proposal.slippage}%
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
                  <div className="text-xs text-gray-500 mb-1">Liquidity</div>
                  <div className="text-sm font-mono font-bold text-gray-100">
                    {formatLiquidity(proposal.liquidity)}
                  </div>
                </div>
              </div>

              {/* Actions: Approve/Reject */}
              {proposal.zone !== 'green' && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onApprove(proposal.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    APPROVE
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onReject(proposal.id)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    REJECT
                  </motion.button>
                </div>
              )}

              {proposal.zone === 'green' && (
                <div className="text-center text-xs text-emerald-500 font-semibold py-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                  AUTO-EXECUTED (Under ${proposal.gas.toFixed(2)} gas)
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
