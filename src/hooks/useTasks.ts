import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/types'

export function useTasks(userId: string, date: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('due_date', date)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data) setTasks(data)
    setLoading(false)
  }, [userId, date])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = async (text: string) => {
    const maxPos = tasks.length > 0 ? Math.max(...tasks.map(t => t.position)) + 1 : 0
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        text,
        due_date: date,
        position: maxPos,
      })
      .select()
      .single()

    if (!error && data) setTasks(prev => [...prev, data])
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const completed = !task.completed
    const completed_at = completed ? new Date().toISOString() : null

    const { error } = await supabase
      .from('tasks')
      .update({ completed, completed_at })
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, completed_at } : t))
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const rescheduleTask = async (id: string, newDate: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const { error } = await supabase
      .from('tasks')
      .update({
        due_date: newDate,
        rolled_over_count: task.rolled_over_count + 1
      })
      .eq('id', id)

    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, rescheduleTask, refetch: fetchTasks }
}
