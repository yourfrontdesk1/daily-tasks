import { useState } from 'react'
import { motion } from 'framer-motion'
import { sounds } from '../lib/sounds'
import { getRecurrenceLabel, type RecurrenceRule } from '../lib/recurrence'
import type { Task } from '../lib/types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReschedule: (id: string) => void
  onFocus: (task: Task) => void
  onSetMIT: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete, onReschedule, onFocus, onSetMIT }: Props) {
  const [showParticles, setShowParticles] = useState(false)
  const isStale = task.rolled_over_count >= 3

  const handleToggle = () => {
    if (!task.completed) {
      sounds.taskComplete()
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 700)
    } else {
      sounds.undo()
    }
    onToggle(task.id)
  }

  const handleDelete = () => {
    sounds.swish()
    onDelete(task.id)
  }

  const handleReschedule = () => {
    sounds.swish()
    onReschedule(task.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, filter: 'blur(4px)' }}
      transition={{
        layout: { type: 'spring', stiffness: 500, damping: 35 },
        opacity: { duration: 0.2 },
      }}
      whileHover={{ scale: 1.01 }}
      className="group relative"
    >
      {/* Stale task warning glow */}
      {isStale && !task.completed && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)' }} />
      )}

      <div
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
          task.completed
            ? 'border-white/[0.03]'
            : isStale
              ? 'border-amber-500/20'
              : 'border-white/[0.06] hover:border-white/[0.12]'
        }`}
        style={{
          background: task.completed
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* MIT star */}
        <button
          onClick={() => onSetMIT(task.id)}
          className="flex-shrink-0 transition-all duration-200 active:scale-75"
          title={task.priority === 1 ? 'Remove from top priorities' : 'Mark as top priority'}
        >
          {task.priority === 1 ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </button>

        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className="relative flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-85"
          style={{
            borderColor: task.completed ? '#10b981' : 'rgba(255,255,255,0.2)',
            background: task.completed ? '#10b981' : 'transparent',
            boxShadow: task.completed ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
          }}
        >
          {task.completed && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-3 h-3 text-white"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <motion.path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </motion.svg>
          )}

          {/* Particle burst */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full animate-particle"
                  style={{
                    backgroundColor: ['#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#84cc16','#e11d48'][i],
                    '--angle': `${i * 45}deg`,
                    '--distance': `${20 + Math.random() * 15}px`,
                    animationDelay: `${i * 0.02}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <motion.span
            animate={{
              color: task.completed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
            }}
            className={`text-sm block ${task.completed ? 'line-through' : ''}`}
          >
            {task.text}
          </motion.span>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-0.5">
            {task.is_recurring && task.recurrence_rule && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(139, 92, 246, 0.6)' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {getRecurrenceLabel(task.recurrence_rule as RecurrenceRule)}
              </span>
            )}
            {task.rolled_over_count > 0 && !task.completed && (
              <span className="text-xs" style={{ color: isStale ? '#f59e0b' : 'rgba(245, 158, 11, 0.5)' }}>
                {isStale ? '⚠️ ' : ''}Rolled over {task.rolled_over_count}x
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Focus/Pomodoro */}
          {!task.completed && (
            <button
              onClick={() => onFocus(task)}
              title="Focus on this task"
              className="p-1.5 rounded-lg transition-all duration-150 active:scale-90"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#8b5cf6'
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          {/* Reschedule */}
          {!task.completed && (
            <button
              onClick={handleReschedule}
              title="Move to tomorrow"
              className="p-1.5 rounded-lg transition-all duration-150 active:scale-90"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#60a5fa'
                e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg transition-all duration-150 active:scale-90"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f87171'
              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
