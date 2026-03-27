import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '../lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

function getWeekDates(): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short' })
}

function loadTasks(date: string): Task[] {
  const stored = localStorage.getItem(`tasks-${date}`)
  return stored ? JSON.parse(stored) : []
}

export default function WeeklyStats({ isOpen, onClose }: Props) {
  const weekDates = useMemo(getWeekDates, [])

  const weekData = useMemo(() => {
    return weekDates.map(date => {
      const tasks = loadTasks(date)
      return {
        date,
        day: getDayName(date),
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
      }
    })
  }, [weekDates])

  const totalCompleted = weekData.reduce((sum, d) => sum + d.completed, 0)
  const totalTasks = weekData.reduce((sum, d) => sum + d.total, 0)
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
  const maxTasks = Math.max(...weekData.map(d => d.total), 1)
  const bestDay = weekData.reduce((best, d) => d.completed > best.completed ? d : best, weekData[0])
  const today = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-4 z-50 max-w-lg mx-auto rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(20, 18, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header sheen */}
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)' }} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ color: '#faf5ff' }}>
                  Weekly Review
                </h2>
                <button onClick={onClose} className="p-1 rounded-lg"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{totalCompleted}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Completed</p>
                </div>
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#34d399' }}>{completionRate}%</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Rate</p>
                </div>
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{totalTasks}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Total</p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-28 mb-4">
                {weekData.map((d, i) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '80px' }}>
                      {/* Completed bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: d.total > 0 ? `${(d.completed / maxTasks) * 100}%` : '0%' }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                        className="w-full max-w-[28px] rounded-t-md"
                        style={{
                          background: d.date === today
                            ? 'linear-gradient(180deg, #8b5cf6, #6d28d9)'
                            : d.completed === d.total && d.total > 0
                              ? 'linear-gradient(180deg, #10b981, #059669)'
                              : 'rgba(255,255,255,0.15)',
                          boxShadow: d.date === today
                            ? '0 0 12px rgba(139, 92, 246, 0.3)'
                            : 'none',
                          minHeight: d.total > 0 ? '4px' : '0',
                        }}
                      />
                      {/* Remaining bar (lighter) */}
                      {d.total > d.completed && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${((d.total - d.completed) / maxTasks) * 100}%` }}
                          transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
                          className="w-full max-w-[28px]"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            minHeight: '2px',
                          }}
                        />
                      )}
                    </div>
                    <span className="text-xs" style={{
                      color: d.date === today ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                      fontWeight: d.date === today ? 600 : 400,
                    }}>
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Insight */}
              {bestDay.completed > 0 && (
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Best day: {getDayName(bestDay.date)} ({bestDay.completed} tasks)
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
