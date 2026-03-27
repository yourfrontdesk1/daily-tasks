import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Streak } from '../lib/types'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function useStreak(userId: string) {
  const [streak, setStreak] = useState<Streak | null>(null)

  const fetchStreak = useCallback(async () => {
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) setStreak(data)
  }, [userId])

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  const checkAndUpdateStreak = useCallback(async (allTasksCompleted: boolean) => {
    if (!streak || !allTasksCompleted) return

    const today = getToday()
    if (streak.last_completed_date === today) return

    const yesterday = getYesterday()
    const isConsecutive = streak.last_completed_date === yesterday
    const newCurrent = isConsecutive ? streak.current_streak + 1 : 1
    const newLongest = Math.max(newCurrent, streak.longest_streak)

    const { error } = await supabase
      .from('streaks')
      .update({
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_completed_date: today
      })
      .eq('user_id', userId)

    if (!error) {
      setStreak(prev => prev ? {
        ...prev,
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_completed_date: today
      } : prev)
    }
  }, [streak, userId])

  return { streak, checkAndUpdateStreak, refetch: fetchStreak }
}
