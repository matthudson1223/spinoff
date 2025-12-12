'use client'

import { Constitution } from '@/types'
import { X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface ConstitutionModalProps {
  isOpen: boolean
  onClose: () => void
  constitution: Constitution
}

export default function ConstitutionModal({
  isOpen,
  onClose,
  constitution,
}: ConstitutionModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-slate-800 border-b border-emerald-500/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-emerald-500 text-lg font-bold tracking-wider cyber-glow-green">
                    CONSTITUTION.PY
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="text-xs text-gray-500 mb-4 font-mono">
                  # Hard-coded Trading Rules & Risk Parameters
                </div>

                {/* Code Block */}
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm">
                  <div className="space-y-3">
                    <div className="text-gray-400">
                      <span className="text-purple-400">class</span>{' '}
                      <span className="text-emerald-500">Constitution</span>:
                    </div>

                    <div className="pl-4 space-y-2">
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">#</span>
                        <span className="text-gray-500">Maximum daily loss threshold</span>
                      </div>
                      <div>
                        <span className="text-blue-400">max_daily_drawdown</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-amber-400">"{constitution.maxDailyDrawdown}"</span>
                      </div>

                      <div className="flex items-start mt-4">
                        <span className="text-gray-500 mr-2">#</span>
                        <span className="text-gray-500">Auto-execute trades under this gas cost</span>
                      </div>
                      <div>
                        <span className="text-blue-400">green_zone_limit</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-amber-400">"{constitution.greenZoneLimit}"</span>
                      </div>

                      <div className="flex items-start mt-4">
                        <span className="text-gray-500 mr-2">#</span>
                        <span className="text-gray-500">Require human approval for gas above this</span>
                      </div>
                      <div>
                        <span className="text-blue-400">yellow_zone_limit</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-amber-400">"{constitution.yellowZoneLimit}"</span>
                      </div>

                      <div className="flex items-start mt-4">
                        <span className="text-gray-500 mr-2">#</span>
                        <span className="text-gray-500">Red zone requires manual approval</span>
                      </div>
                      <div>
                        <span className="text-blue-400">red_zone_limit</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-amber-400">"{constitution.redZoneLimit}"</span>
                      </div>

                      <div className="flex items-start mt-6">
                        <span className="text-gray-500 mr-2">#</span>
                        <span className="text-gray-500">Additional safety constraints</span>
                      </div>
                      <div>
                        <span className="text-blue-400">min_confidence_score</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-rose-400">60</span>
                      </div>
                      <div>
                        <span className="text-blue-400">max_slippage_tolerance</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-rose-400">1.0</span>
                        <span className="text-gray-500"> # 1%</span>
                      </div>
                      <div>
                        <span className="text-blue-400">min_liquidity_threshold</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-rose-400">100000</span>
                        <span className="text-gray-500"> # $100K</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-amber-400/10 border border-amber-400/30 rounded-lg p-4">
                  <div className="text-amber-400 text-sm font-semibold mb-2">
                    ⚠ Read-Only Parameters
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    These rules are hard-coded into the system constitution and cannot be
                    modified during trading sessions. To update parameters, you must
                    redeploy the entire agent framework.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-800 border-t border-emerald-500/30 p-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-6 rounded transition-colors"
                >
                  CLOSE
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
