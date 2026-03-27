import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTasks } from '../hooks/useTasks'
import { useStreak } from '../hooks/useStreak'
import Background from './Background'
import Greeting from './Greeting'
import StreakBadge from './StreakBadge'
import DateNav from './DateNav'
import ProgressBar from './ProgressBar'
import Celebration from './Celebration'
import AddTask from './AddTask'
import TaskItem from './TaskItem'
import EmptyState from './EmptyState'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function TaskList({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(getToday())
  const { tasks, loading, addTask, toggleTask, deleteTask, rescheduleTask } = useTasks(userId, currentDate)
  const { streak, checkAndUpdateStreak } = useStreak(userId)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const isToday = currentDate === getToday()

  // Update streak when all tasks completed today
  useEffect(() => {
    if (allDone && isToday) {
      checkAndUpdateStreak(true)
    }
  }, [allDone, isToday, checkAndUpdateStreak])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return

      if (e.key === 'ArrowLeft' || e.key === 'h') {
        setCurrentDate(d => shiftDate(d, -1))
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        setCurrentDate(d => shiftDate(d, 1))
      } else if (e.key === 't') {
        setCurrentDate(getToday())
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleReschedule = (id: string) => {
    const tomorrow = shiftDate(currentDate, 1)
    rescheduleTask(id, tomorrow)
  }

  return (
    <Background>
      <div className="max-w-lg mx-auto px-4 py-8 min-h-screen">
        {/* Top bar: streak + greeting */}
        <div className="flex items-start justify-between mb-2">
          <Greeting taskCount={totalCount} completedCount={completedCount} />
          {streak && <StreakBadge currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />}
        </div>

        {/* Date navigation */}
        <DateNav
          currentDate={currentDate}
          onPrev={() => setCurrentDate(d => shiftDate(d, -1))}
          onNext={() => setCurrentDate(d => shiftDate(d, 1))}
          onToday={() => setCurrentDate(getToday())}
          isToday={isToday}
        />

        {/* Progress */}
        <ProgressBar total={totalCount} completed={completedCount} />

        {/* Celebration */}
        <Celebration show={allDone} />

        {/* Add task */}
        <AddTask onAdd={addTask} />

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onReschedule={handleReschedule}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {!loading && totalCount === 0 && (
          <EmptyState isToday={isToday} />
        )}

        {/* Jump to today */}
        {!isToday && (
          <button
            onClick={() => setCurrentDate(getToday())}
            className="mt-8 w-full py-2.5 text-sm rounded-xl transition-all duration-200"
            style={{
              color: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            }}
          >
            Jump to today (T)
          </button>
        )}

        {/* Keyboard hint */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full text-xs"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span><kbd className="font-mono">N</kbd> new</span>
          <span><kbd className="font-mono">←→</kbd> navigate</span>
          <span><kbd className="font-mono">T</kbd> today</span>
        </div>
      </div>
    </Background>
  )
}
