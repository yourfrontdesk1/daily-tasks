import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function loadTasks(date: string): Task[] {
  const stored = localStorage.getItem(`tasks-${date}`)
  return stored ? JSON.parse(stored) : []
}

function saveTasks(date: string, tasks: Task[]) {
  localStorage.setItem(`tasks-${date}`, JSON.stringify(tasks))
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = getToday()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(getToday()))
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    setTasks(loadTasks(currentDate))
  }, [currentDate])

  useEffect(() => {
    saveTasks(currentDate, tasks)
  }, [tasks, currentDate])

  const addTask = () => {
    const text = newTask.trim()
    if (!text) return
    setTasks(prev => [...prev, {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const completedCount = tasks.filter(t => t.completed).length
  const isToday = currentDate === getToday()
  const isFuture = currentDate > getToday()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              {tasks.length === 0
                ? 'No tasks yet'
                : `${completedCount} of ${tasks.length} done`}
            </p>
          </div>
          <button
            onClick={() => setCurrentDate(d => shiftDate(d, 1))}
            disabled={isFuture}
            className="p-2 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        )}

        {/* Add task */}
        {(isToday || isFuture) && (
          <form
            onSubmit={e => { e.preventDefault(); addTask() }}
            className="flex gap-2 mb-6"
          >
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600 placeholder:text-gray-600"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              Add
            </button>
          </form>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition ${
                task.completed
                  ? 'bg-gray-900/50 border-gray-800/50'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
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
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">
              {isToday ? '🎯' : '📋'}
            </p>
            <p className="text-sm">
              {isToday ? 'What do you need to get done today?' : 'No tasks were logged this day'}
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
