import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '../lib/types'

interface Props {
  tasks: Task[]
  onReschedule: (id: string) => void
  onDelete: (id: string) => void
  onDismiss: () => void
  show: boolean
}

export default function StaleTaskWarning({ tasks, onReschedule, onDelete, onDismiss, show }: Props) {
  const staleTasks = tasks.filter(t => t.rolled_over_count >= 3 && !t.completed)

  if (staleTasks.length === 0) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
                ⚠️ Stale tasks detected
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                These have been sitting for 3+ days. Still want them?
              </p>
            </div>
            <button onClick={onDismiss} className="text-xs p-1"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Dismiss
            </button>
          </div>

          <div className="space-y-2">
            {staleTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 rounded-lg p-2"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                <span className="flex-1 text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {task.text}
                </span>
                <button
                  onClick={() => onReschedule(task.id)}
                  className="text-xs px-2 py-1 rounded-md transition-colors"
                  style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-xs px-2 py-1 rounded-md transition-colors"
                  style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}
                >
                  Drop
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
