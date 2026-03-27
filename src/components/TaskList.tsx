import { useState, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useStreak } from '../hooks/useStreak'
import { supabase } from '../lib/supabase'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = getToday()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function TaskList({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [newTask, setNewTask] = useState('')
  const [justCompleted, setJustCompleted] = useState<string | null>(null)
  const { tasks, loading, addTask, toggleTask, deleteTask, rescheduleTask } = useTasks(userId, currentDate)
  const { streak, checkAndUpdateStreak } = useStreak(userId)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const isToday = currentDate === getToday()

  // Check streak when all tasks completed
  useEffect(() => {
    if (allDone && isToday) {
      checkAndUpdateStreak(true)
    }
  }, [allDone, isToday, checkAndUpdateStreak])

  const handleAdd = async () => {
    const text = newTask.trim()
    if (!text) return
    await addTask(text)
    setNewTask('')
  }

  const handleToggle = async (id: string) => {
    setJustCompleted(id)
    await toggleTask(id)
    setTimeout(() => setJustCompleted(null), 600)
  }

  const handleReschedule = async (id: string) => {
    const tomorrow = shiftDate(currentDate, 1)
    await rescheduleTask(id, tomorrow)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          {streak && streak.current_streak > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-400">
              <span>🔥</span>
              <span>{streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
              }}
              className="text-xs text-gray-600 hover:text-gray-400 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <button
            onClick={() => setCurrentDate(d => shiftDate(d, -1))}
            className="p-2 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{formatDate(currentDate)}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? 'Loading...'
                : totalCount === 0
                  ? 'No tasks yet'
                  : `${completedCount} of ${totalCount} done`}
            </p>
          </div>
          <button
            onClick={() => setCurrentDate(d => shiftDate(d, 1))}
            className="p-2 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* All done celebration */}
        {allDone && (
          <div className="text-center py-4 mb-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-emerald-400 text-sm font-medium">All tasks complete!</p>
          </div>
        )}

        {/* Add task */}
        <form
          onSubmit={e => { e.preventDefault(); handleAdd() }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Add
          </button>
        </form>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                justCompleted === task.id
                  ? 'scale-[0.98] opacity-80'
                  : ''
              } ${
                task.completed
                  ? 'bg-gray-900/50 border-gray-800/50'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => handleToggle(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  task.completed
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-gray-600 hover:border-emerald-500'
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span className={`text-sm block ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                  {task.text}
                </span>
                {task.rolled_over_count > 0 && !task.completed && (
                  <span className="text-xs text-amber-500/70">
                    Rolled over {task.rolled_over_count}x
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {!task.completed && (
                  <button
                    onClick={() => handleReschedule(task.id)}
                    title="Move to tomorrow"
                    className="p-1 text-gray-600 hover:text-blue-400 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-gray-600 hover:text-red-400 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && totalCount === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">
              {isToday ? '🎯' : '📋'}
            </p>
            <p className="text-sm">
              {isToday ? 'What do you need to get done today?' : 'No tasks for this day'}
            </p>
          </div>
        )}

        {/* Jump to today */}
        {!isToday && (
          <button
            onClick={() => setCurrentDate(getToday())}
            className="mt-8 w-full py-2 text-sm text-gray-500 hover:text-white transition"
          >
            Jump to today
          </button>
        )}
      </div>
    </div>
  )
}
