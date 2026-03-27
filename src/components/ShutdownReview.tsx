import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '../lib/types'

interface Props {
  tasks: Task[]
  onReschedule: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
  show: boolean
}

export default function ShutdownReview({ tasks, onReschedule, onDelete, onClose, show }: Props) {
  const [step, setStep] = useState<'review' | 'incomplete' | 'done'>('review')

  const completed = tasks.filter(t => t.completed)
  const incomplete = tasks.filter(t => !t.completed)
  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

  if (!show) return null

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
            {step === 'review' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  className="text-5xl mb-6"
                >
                  {completionRate === 100 ? '🏆' : completionRate >= 50 ? '👏' : '🌙'}
                </motion.div>

                <h2 className="text-2xl font-bold mb-2" style={{ color: '#faf5ff', letterSpacing: '-0.02em' }}>
                  Day in review
                </h2>

                {/* Stats */}
                <div className="flex items-center justify-center gap-6 my-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{completed.length}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Done</p>
                  </div>
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: incomplete.length > 0 ? '#f59e0b' : '#10b981' }}>
                      {incomplete.length}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Remaining</p>
                  </div>
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: '#a78bfa' }}>{completionRate}%</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Rate</p>
                  </div>
                </div>

                {incomplete.length > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('incomplete')}
                    className="px-8 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    Handle remaining tasks
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    Perfect day! Close
                  </motion.button>
                )}

                {incomplete.length > 0 && (
                  <button
                    onClick={onClose}
                    className="block mx-auto mt-4 text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                  >
                    Skip, I'll deal with it tomorrow
                  </button>
                )}
              </div>
            )}

            {step === 'incomplete' && (
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#faf5ff' }}>
                  What about these?
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Move them to tomorrow or drop them.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                  {incomplete.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="flex-1 text-sm truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {task.text}
                      </span>
                      <button
                        onClick={() => onReschedule(task.id)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}
                      >
                        Tomorrow
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}
                      >
                        Drop
                      </button>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('done')}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                  }}
                >
                  Done
                </motion.button>
              </div>
            )}

            {step === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">🌙</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#faf5ff' }}>
                  Day closed
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Rest up. Tomorrow's a fresh start.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Good night
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
