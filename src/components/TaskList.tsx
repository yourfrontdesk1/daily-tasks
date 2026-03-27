import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Reorder } from 'framer-motion'
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
import PomodoroTimer from './PomodoroTimer'
import CommandPalette from './CommandPalette'
import WeeklyStats from './WeeklyStats'
import StaleTaskWarning from './StaleTaskWarning'
import MorningPlanning from './MorningPlanning'
import ShutdownReview from './ShutdownReview'
import AmbientSounds from './AmbientSounds'
import AccentPicker from './AccentPicker'
import type { Task } from '../lib/types'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function shouldShowMorningPlanning(): boolean {
  const today = getToday()
  const dismissed = localStorage.getItem(`planning-dismissed-${today}`)
  if (dismissed) return false
  const hour = new Date().getHours()
  return hour < 12
}

export default function TaskList({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(getToday())
  const { tasks, loading, addTask, toggleTask, deleteTask, rescheduleTask, reorderTasks, setMIT } = useTasks(userId, currentDate)
  const { streak, checkAndUpdateStreak } = useStreak(userId)

  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showWeeklyStats, setShowWeeklyStats] = useState(false)
  const [showStaleWarning, setShowStaleWarning] = useState(true)
  const [showMorningPlanning, setShowMorningPlanning] = useState(shouldShowMorningPlanning)
  const [showShutdownReview, setShowShutdownReview] = useState(false)
  const [showAccentPicker, setShowAccentPicker] = useState(false)
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent-color') || '#8b5cf6')

  // Sort: MITs first, then uncompleted, then completed
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.position - b.position
    })
  }, [tasks])

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const isToday = currentDate === getToday()
  const mitCount = tasks.filter(t => t.priority === 1 && !t.completed).length

  // Update streak when all tasks completed today
  useEffect(() => {
    if (allDone && isToday) {
      checkAndUpdateStreak(true)
    }
  }, [allDone, isToday, checkAndUpdateStreak])

  // Show morning planning when tasks load
  useEffect(() => {
    if (!loading && tasks.length > 0 && shouldShowMorningPlanning()) {
      setShowMorningPlanning(true)
    }
  }, [loading, tasks.length])

  // Save accent color
  useEffect(() => {
    localStorage.setItem('accent-color', accentColor)
  }, [accentColor])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          ;(document.activeElement as HTMLElement).blur()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        setCurrentDate(d => shiftDate(d, -1))
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        setCurrentDate(d => shiftDate(d, 1))
      } else if (e.key === 't') {
        setCurrentDate(getToday())
      } else if (e.key === 'w') {
        setShowWeeklyStats(true)
      } else if (e.key === 'r') {
        setShowShutdownReview(true)
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowWeeklyStats(false)
        setShowShutdownReview(false)
        setShowAccentPicker(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleReschedule = (id: string) => {
    const tomorrow = shiftDate(currentDate, 1)
    rescheduleTask(id, tomorrow)
  }

  const dismissMorningPlanning = () => {
    localStorage.setItem(`planning-dismissed-${getToday()}`, 'true')
    setShowMorningPlanning(false)
  }

  // Command palette commands
  const commands = [
    { id: 'today', label: 'Go to today', shortcut: 'T', icon: '📅', action: () => setCurrentDate(getToday()) },
    { id: 'new', label: 'New task', shortcut: 'N', icon: '➕', action: () => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }},
    { id: 'stats', label: 'Weekly stats', shortcut: 'W', icon: '📊', action: () => setShowWeeklyStats(true) },
    { id: 'review', label: 'Day review', shortcut: 'R', icon: '🌙', action: () => setShowShutdownReview(true) },
    { id: 'plan', label: 'Morning planning', icon: '🌅', action: () => setShowMorningPlanning(true) },
    { id: 'accent', label: 'Change accent color', icon: '🎨', action: () => setShowAccentPicker(true) },
    { id: 'prev', label: 'Previous day', shortcut: '←', icon: '⬅️', action: () => setCurrentDate(d => shiftDate(d, -1)) },
    { id: 'next', label: 'Next day', shortcut: '→', icon: '➡️', action: () => setCurrentDate(d => shiftDate(d, 1)) },
    { id: 'yesterday', label: 'Go to yesterday', icon: '🔙', action: () => setCurrentDate(shiftDate(getToday(), -1)) },
    { id: 'tomorrow', label: 'Go to tomorrow', icon: '🔜', action: () => setCurrentDate(shiftDate(getToday(), 1)) },
  ]

  return (
    <Background>
      <div className="max-w-lg mx-auto px-4 py-8 pb-20 min-h-screen">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-2">
          <Greeting taskCount={totalCount} completedCount={completedCount} />
          <div className="flex items-center gap-2">
            {streak && <StreakBadge currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />}
            <AmbientSounds />

            {/* Stats button */}
            <button
              onClick={() => setShowWeeklyStats(true)}
              className="p-2 rounded-lg transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Weekly stats (W)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            {/* Review button */}
            <button
              onClick={() => setShowShutdownReview(true)}
              className="p-2 rounded-lg transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Day review (R)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
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

        {/* Stale task warning */}
        <StaleTaskWarning
          tasks={tasks}
          onReschedule={handleReschedule}
          onDelete={deleteTask}
          onDismiss={() => setShowStaleWarning(false)}
          show={showStaleWarning && isToday}
        />

        {/* Celebration */}
        <Celebration show={allDone} />

        {/* MIT indicator */}
        {mitCount > 0 && !allDone && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xs" style={{ color: 'rgba(245, 158, 11, 0.6)' }}>
              ⭐ {mitCount} top priorit{mitCount === 1 ? 'y' : 'ies'}
            </span>
          </div>
        )}

        {/* Add task */}
        <AddTask onAdd={addTask} currentDate={currentDate} />

        {/* Task list with drag and drop */}
        <Reorder.Group
          axis="y"
          values={sortedTasks}
          onReorder={reorderTasks}
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {sortedTasks.map(task => (
              <Reorder.Item
                key={task.id}
                value={task}
                whileDrag={{
                  scale: 1.03,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.3)',
                  zIndex: 50,
                  cursor: 'grabbing',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="list-none"
              >
                <TaskItem
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onReschedule={handleReschedule}
                  onFocus={setFocusTask}
                  onSetMIT={setMIT}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

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

        {/* Keyboard hint bar */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full text-xs"
          style={{
            background: 'rgba(20, 18, 30, 0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span><kbd className="font-mono">N</kbd> new</span>
          <span><kbd className="font-mono">←→</kbd> days</span>
          <span><kbd className="font-mono">T</kbd> today</span>
          <span><kbd className="font-mono">W</kbd> stats</span>
          <span><kbd className="font-mono">R</kbd> review</span>
          <span><kbd className="font-mono">⌘K</kbd> cmds</span>
        </div>
      </div>

      {/* Morning Planning */}
      <MorningPlanning
        tasks={tasks}
        onSetMIT={setMIT}
        onDismiss={dismissMorningPlanning}
        show={showMorningPlanning && isToday && totalCount > 0}
      />

      {/* Shutdown Review */}
      <ShutdownReview
        tasks={tasks}
        onReschedule={handleReschedule}
        onDelete={deleteTask}
        onClose={() => setShowShutdownReview(false)}
        show={showShutdownReview}
      />

      {/* Pomodoro Timer */}
      <AnimatePresence>
        {focusTask && (
          <PomodoroTimer
            taskName={focusTask.text}
            onComplete={() => {
              toggleTask(focusTask.id)
              setFocusTask(null)
            }}
            onClose={() => setFocusTask(null)}
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Weekly Stats */}
      <WeeklyStats
        isOpen={showWeeklyStats}
        onClose={() => setShowWeeklyStats(false)}
      />

      {/* Accent Picker */}
      <AccentPicker
        show={showAccentPicker}
        onClose={() => setShowAccentPicker(false)}
        currentAccent={accentColor}
        onSelect={(color) => {
          setAccentColor(color)
          setShowAccentPicker(false)
        }}
      />
    </Background>
  )
}
