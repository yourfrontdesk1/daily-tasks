import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../lib/types'

function loadTasks(date: string): Task[] {
  const stored = localStorage.getItem(`tasks-${date}`)
  return stored ? JSON.parse(stored) : []
}

function saveTasks(date: string, tasks: Task[]) {
  localStorage.setItem(`tasks-${date}`, JSON.stringify(tasks))
}

export function useTasks(userId: string, date: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(() => {
    setTasks(loadTasks(date))
    setLoading(false)
  }, [date])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!loading) saveTasks(date, tasks)
  }, [tasks, date, loading])

  const addTask = async (text: string) => {
    const maxPos = tasks.length > 0 ? Math.max(...tasks.map(t => t.position)) + 1 : 0
    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: userId,
      text,
      completed: false,
      priority: 0,
      position: maxPos,
      due_date: date,
      created_at: new Date().toISOString(),
      completed_at: null,
      is_recurring: false,
      recurrence_rule: null,
      rolled_over_count: 0,
    }
    setTasks(prev => [...prev, newTask])
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

    // Remove from current date
    setTasks(prev => prev.filter(t => t.id !== id))

    // Add to new date
    const targetTasks = loadTasks(newDate)
    targetTasks.push({ ...task, due_date: newDate, rolled_over_count: task.rolled_over_count + 1 })
    saveTasks(newDate, targetTasks)
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, rescheduleTask, refetch: fetchTasks }
}
