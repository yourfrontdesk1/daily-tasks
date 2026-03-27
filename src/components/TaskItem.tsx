import { useState } from 'react'
import { motion } from 'framer-motion'
import { sounds } from '../lib/sounds'
import type { Task } from '../lib/types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReschedule: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete, onReschedule }: Props) {
  const [showParticles, setShowParticles] = useState(false)

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
      <div
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
          task.completed
            ? 'border-white/[0.03]'
            : 'border-white/[0.06] hover:border-white/[0.12]'
        }`}
        style={{
          background: task.completed
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(8px)',
        }}
      >
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

          {/* Particle burst on completion */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full animate-particle"
                  style={{
                    backgroundColor: ['#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#84cc16','#e11d48'][i],
                    // @ts-ignore
                    '--angle': `${i * 45}deg`,
                    '--distance': `${20 + Math.random() * 15}px`,
                    animationDelay: `${i * 0.02}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </button>

        {/* Task text */}
        <div className="flex-1 min-w-0">
          <motion.span
            animate={{
              color: task.completed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
            }}
            className={`text-sm block ${task.completed ? 'line-through' : ''}`}
          >
            {task.text}
          </motion.span>
          {task.rolled_over_count > 0 && !task.completed && (
            <span className="text-xs" style={{ color: 'rgba(245, 158, 11, 0.6)' }}>
              Rolled over {task.rolled_over_count}x
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
