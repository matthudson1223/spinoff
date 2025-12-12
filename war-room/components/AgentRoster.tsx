'use client'

import { Agent } from '@/types'
import { Brain, Eye, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

interface AgentRosterProps {
  agents: Agent[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Eye,
  Zap,
  Shield,
}

export default function AgentRoster({ agents }: AgentRosterProps) {
  return (
    <div className="h-full bg-slate-900 border-r border-emerald-500/20 p-4">
      <h2 className="text-emerald-500 text-sm font-bold tracking-wider mb-6 cyber-glow-green">
        ACTIVE AGENTS
      </h2>

      <div className="space-y-4">
        {agents.map((agent, index) => {
          const IconComponent = iconMap[agent.icon]

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 border border-slate-700 rounded p-3 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Icon/Avatar */}
                <div className="flex-shrink-0 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <IconComponent className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name and Status */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-100">
                      {agent.name}
                    </span>

                    {/* Status Dot */}
                    <div className="relative flex-shrink-0">
                      {agent.status === 'online' && (
                        <motion.div
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      {agent.status === 'thinking' && (
                        <motion.div
                          className="w-2 h-2 bg-amber-400 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.6, 1]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      {agent.status === 'error' && (
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Current Action - Ticker */}
                  <div className="text-xs text-gray-400 truncate font-mono">
                    {agent.currentAction}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
