import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  currentStreak: number
  longestStreak: number
}

export default function StreakBadge({ currentStreak, longestStreak }: Props) {
  const [displayCount, setDisplayCount] = useState(currentStreak)

  useEffect(() => {
    if (displayCount === currentStreak) return
    const start = displayCount
    const end = currentStreak
    const duration = 400
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayCount(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [currentStreak])

  if (currentStreak === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      <span className={`text-lg ${currentStreak >= 3 ? 'animate-fire-pulse' : ''}`}>
        🔥
      </span>
      <span className="text-lg font-bold tabular-nums"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        {displayCount}
      </span>
      <AnimatePresence>
        {currentStreak >= 7 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            ON FIRE
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
