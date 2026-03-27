import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../lib/types'
import { getNextOccurrence, type RecurrenceRule } from '../lib/recurrence'

function loadTasks(date: string): Task[] {
  const stored = localStorage.getItem(`tasks-${date}`)
  return stored ? JSON.parse(stored) : []
}

function saveTasks(date: string, tasks: Task[]) {
  localStorage.setItem(`tasks-${date}`, JSON.stringify(tasks))
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

// Check for tasks that need rolling over from yesterday
function checkRollover(date: string): Task[] {
  if (date !== getToday()) return []

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayTasks = loadTasks(yesterdayStr)
  const todayTasks = loadTasks(date)
  const todayIds = new Set(todayTasks.map(t => t.id))

  const toRollOver = yesterdayTasks.filter(t =>
    !t.completed && !todayIds.has(t.id) && !t.is_recurring
  )

  if (toRollOver.length > 0) {
    const rolledTasks = toRollOver.map(t => ({
      ...t,
      due_date: date,
      rolled_over_count: t.rolled_over_count + 1,
    }))
    return rolledTasks
  }

  return []
}

export function useTasks(userId: string, date: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(() => {
    let loaded = loadTasks(date)

    // Auto-rollover incomplete tasks from yesterday
    const rolledOver = checkRollover(date)
    if (rolledOver.length > 0) {
      loaded = [...loaded, ...rolledOver]
      saveTasks(date, loaded)
    }

    // Spawn recurring tasks for today if not already present
    if (date === getToday()) {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('tasks-'))
      const existingIds = new Set(loaded.map(t => t.id))

      for (const key of allKeys) {
        const dayTasks: Task[] = JSON.parse(localStorage.getItem(key) || '[]')
        for (const t of dayTasks) {
          if (t.is_recurring && t.recurrence_rule && t.completed) {
            const nextDate = getNextOccurrence(t.recurrence_rule as RecurrenceRule, t.due_date)
            if (nextDate === date && !existingIds.has(`recurring-${t.text}-${date}`)) {
              loaded.push({
                id: `recurring-${t.text}-${date}`,
                user_id: userId,
                text: t.text,
                completed: false,
                priority: t.priority,
                position: loaded.length,
                due_date: date,
                created_at: new Date().toISOString(),
                completed_at: null,
                is_recurring: true,
                recurrence_rule: t.recurrence_rule,
                rolled_over_count: 0,
              })
              existingIds.add(`recurring-${t.text}-${date}`)
            }
          }
        }
      }
      saveTasks(date, loaded)
    }

    setTasks(loaded)
    setLoading(false)
  }, [date, userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!loading) saveTasks(date, tasks)
  }, [tasks, date, loading])

  const addTask = async (text: string, options?: { recurring?: RecurrenceRule; targetDate?: string }) => {
    const targetDate = options?.targetDate || date
    const maxPos = tasks.length > 0 ? Math.max(...tasks.map(t => t.position)) + 1 : 0
    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: userId,
      text,
      completed: false,
      priority: 0,
      position: maxPos,
      due_date: targetDate,
      created_at: new Date().toISOString(),
      completed_at: null,
      is_recurring: !!options?.recurring,
      recurrence_rule: options?.recurring || null,
      rolled_over_count: 0,
    }

    if (targetDate === date) {
      setTasks(prev => [...prev, newTask])
    } else {
      // Save to a different date
      const otherTasks = loadTasks(targetDate)
      otherTasks.push(newTask)
      saveTasks(targetDate, otherTasks)
    }
  }

  const toggleTask = async (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null }
        : t
    ))
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const rescheduleTask = async (id: string, newDate: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    setTasks(prev => prev.filter(t => t.id !== id))

    const targetTasks = loadTasks(newDate)
    targetTasks.push({ ...task, due_date: newDate, rolled_over_count: task.rolled_over_count + 1 })
    saveTasks(newDate, targetTasks)
  }

  const reorderTasks = (newOrder: Task[]) => {
    const reordered = newOrder.map((t, i) => ({ ...t, position: i }))
    setTasks(reordered)
  }

  const setMIT = (id: string) => {
    setTasks(prev => prev.map(t => ({
      ...t,
      priority: t.id === id ? (t.priority === 1 ? 0 : 1) : t.priority,
    })))
  }

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    rescheduleTask,
    reorderTasks,
    setMIT,
    refetch: fetchTasks,
  }
}
