export interface Task {
  id: string
  user_id: string
  text: string
  completed: boolean
  priority: number
  position: number
  due_date: string
  created_at: string
  completed_at: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  rolled_over_count: number
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
}
