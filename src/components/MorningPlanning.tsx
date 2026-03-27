import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '../lib/types'

interface Props {
  tasks: Task[]
  onSetMIT: (id: string) => void
  onDismiss: () => void
  show: boolean
}

export default function MorningPlanning({ tasks, onSetMIT, onDismiss, show }: Props) {
  const [step, setStep] = useState<'welcome' | 'pick' | 'done'>('welcome')
  const uncompletedTasks = tasks.filter(t => !t.completed)
  const mitCount = tasks.filter(t => t.priority === 1).length

  if (!show || uncompletedTasks.length === 0) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-w-md w-full"
          >
            {step === 'welcome' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  className="text-5xl mb-6"
                >
                  🌅
                </motion.div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#faf5ff', letterSpacing: '-0.02em' }}>
                  Plan your day
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  You have {uncompletedTasks.length} task{uncompletedTasks.length !== 1 ? 's' : ''} today.
                  Pick up to 3 that matter most.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('pick')}
                  className="px-8 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  Let's go
                </motion.button>
                <button
                  onClick={onDismiss}
                  className="block mx-auto mt-4 text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                >
                  Skip for today
                </button>
              </div>
            )}

            {step === 'pick' && (
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#faf5ff' }}>
                  Pick your top 3
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {mitCount}/3 selected. Tap the star to mark priorities.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                  {uncompletedTasks.map((task, i) => (
                    <motion.button
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        if (task.priority === 1 || mitCount < 3) {
                          onSetMIT(task.id)
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: task.priority === 1
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${task.priority === 1 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <span className="text-base">
                        {task.priority === 1 ? '⭐' : '☆'}
                      </span>
                      <span className="flex-1 text-sm" style={{
                        color: task.priority === 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                      }}>
                        {task.text}
                      </span>
                      {task.priority === 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                          MIT
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('done')}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: mitCount > 0
                      ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                      : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    boxShadow: mitCount > 0 ? '0 4px 20px rgba(139, 92, 246, 0.3)' : 'none',
                  }}
                >
                  {mitCount > 0 ? `Continue with ${mitCount} priorit${mitCount === 1 ? 'y' : 'ies'}` : 'Continue without priorities'}
                </motion.button>
              </div>
            )}

            {step === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">💪</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#faf5ff' }}>
                  You're set!
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {mitCount > 0
                    ? `Focus on your ${mitCount} top priorit${mitCount === 1 ? 'y' : 'ies'} first.`
                    : 'Get after it today.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDismiss}
                  className="px-8 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Start your day
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
