import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' }
  if (hour < 21) return { text: 'Good evening', emoji: '🌙' }
  return { text: 'Working late?', emoji: '🦉' }
}

function getDayContext() {
  const day = new Date().getDay()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  if (day === 1) return "Let's plan the week."
  if (day === 5) return 'Almost the weekend.'
  if (day === 0 || day === 6) return 'Keep it light today.'
  return `Happy ${dayNames[day]}.`
}

export default function Greeting({ taskCount, completedCount }: { taskCount: number; completedCount: number }) {
  const [greeting] = useState(getGreeting)

  let subtitle = getDayContext()
  if (taskCount > 0 && completedCount === taskCount) {
    subtitle = 'All done! You crushed it today. 💪'
  } else if (taskCount > 0) {
    subtitle = `${completedCount} of ${taskCount} tasks complete.`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{greeting.emoji}</span>
        <h1 className="text-xl font-semibold tracking-tight"
          style={{ color: '#faf5ff' }}>
          {greeting.text}
        </h1>
      </div>
      <p className="text-sm" style={{ color: '#7c7394' }}>
        {subtitle}
      </p>
    </motion.div>
  )
}
