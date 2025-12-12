'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import AgentRoster from '@/components/AgentRoster'
import OpportunityFeed from '@/components/OpportunityFeed'
import ExecutionPanel from '@/components/ExecutionPanel'
import ConstitutionModal from '@/components/ConstitutionModal'
import ChatBox from '@/components/ChatBox'
import { mockAgents, mockTradeProposals, mockExecutedTrades, constitution } from '@/data/mockData'
import { TradeProposal, ExecutedTrade } from '@/types'

export default function Home() {
  const [proposals, setProposals] = useState<TradeProposal[]>(mockTradeProposals)
  const [executedTrades, setExecutedTrades] = useState<ExecutedTrade[]>(mockExecutedTrades)
  const [isConstitutionOpen, setIsConstitutionOpen] = useState(false)
  const [portfolioValue] = useState(1000.00)
  const [dailyChange] = useState(12.40)
  const [dailyChangePercent] = useState(1.2)

  const handleApprove = (id: string) => {
    const proposal = proposals.find(p => p.id === id)
    if (!proposal) return

    // Create executed trade
    const newTrade: ExecutedTrade = {
      id: `trade-${Date.now()}`,
      ticker: proposal.ticker,
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      profit: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10,
      gas: proposal.gas,
    }

    // Add to executed trades (prepend to show at top)
    setExecutedTrades([newTrade, ...executedTrades])

    // Remove from proposals
    setProposals(proposals.filter(p => p.id !== id))
  }

  const handleReject = (id: string) => {
    // Simply remove from proposals
    setProposals(proposals.filter(p => p.id !== id))
  }

  const handleEmergencyHalt = () => {
    if (confirm('⚠️ EMERGENCY HALT\n\nThis will immediately stop all trading activity and cancel pending orders.\n\nAre you sure?')) {
      // In a real app, this would trigger emergency shutdown
      alert('🛑 All trading activity has been halted.')
      setProposals([])
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-500 tracking-wider cyber-glow-green">
            NEUROGRID DIGITAL
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            AI-Powered Autonomous Trading Framework
          </p>
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => setIsConstitutionOpen(true)}
          className="p-2 hover:bg-slate-800 rounded transition-colors group"
          title="View Constitution"
        >
          <Settings className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors group-hover:rotate-90 transform duration-300" />
        </button>
      </header>

      {/* Main 3-Column Grid Layout */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Sidebar: Agent Roster */}
        <div className="col-span-3 overflow-hidden">
          <AgentRoster agents={mockAgents} />
        </div>

        {/* Center Panel: Opportunity Feed */}
        <div className="col-span-5 overflow-hidden">
          <OpportunityFeed
            proposals={proposals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* Right Panel: Execution Log & P&L */}
        <div className="col-span-4 overflow-hidden">
          <ExecutionPanel
            trades={executedTrades}
            portfolioValue={portfolioValue}
            dailyChange={dailyChange}
            dailyChangePercent={dailyChangePercent}
            onEmergencyHalt={handleEmergencyHalt}
          />
        </div>
      </main>

      {/* Constitution Modal */}
      <ConstitutionModal
        isOpen={isConstitutionOpen}
        onClose={() => setIsConstitutionOpen(false)}
        constitution={constitution}
      />

      {/* Chat Box - Fixed to bottom right */}
      <ChatBox agentId="prime" agentName="Prime" />
    </div>
  )
}
