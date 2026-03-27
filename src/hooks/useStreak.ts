import { useState, useEffect, useCallback } from 'react'
import type { Streak } from '../lib/types'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function loadStreak(): Streak {
  const stored = localStorage.getItem('streak')
  if (stored) return JSON.parse(stored)
  return {
    id: 'local',
    user_id: 'local',
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
  }
}

function saveStreak(streak: Streak) {
  localStorage.setItem('streak', JSON.stringify(streak))
}

export function useStreak(userId: string) {
  const [streak, setStreak] = useState<Streak>(loadStreak)

  useEffect(() => {
    saveStreak(streak)
  }, [streak])

  const checkAndUpdateStreak = useCallback((allTasksCompleted: boolean) => {
    if (!allTasksCompleted) return

    const today = getToday()
    if (streak.last_completed_date === today) return

    const yesterday = getYesterday()
    const isConsecutive = streak.last_completed_date === yesterday
    const newCurrent = isConsecutive ? streak.current_streak + 1 : 1
    const newLongest = Math.max(newCurrent, streak.longest_streak)

    setStreak(prev => ({
      ...prev,
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_completed_date: today,
    }))
  }, [streak])

  return { streak, checkAndUpdateStreak, refetch: () => {} }
}
