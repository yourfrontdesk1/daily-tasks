import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sounds } from '../lib/sounds'

interface Props {
  show: boolean
}

export default function Celebration({ show }: Props) {
  const hasPlayed = useRef(false)

  useEffect(() => {
    if (show && !hasPlayed.current) {
      hasPlayed.current = true
      sounds.allComplete()

      // Fire confetti from both sides
      const defaults = { startVelocity: 25, spread: 55, ticks: 60, zIndex: 100 }

      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: 0.2, y: 0.7 },
        colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
      })

      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: 0.8, y: 0.7 },
        colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
      })

      // Second wave
      setTimeout(() => {
        confetti({
          particleCount: 25,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#8b5cf6', '#10b981', '#f59e0b'],
          startVelocity: 35,
          ticks: 80,
          zIndex: 100,
        })
      }, 300)
    }

    if (!show) {
      hasPlayed.current = false
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative rounded-2xl p-5 mb-6 overflow-hidden text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          {/* Gradient sheen at top */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(16, 185, 129, 0.4), transparent)' }} />

          {/* Emoji burst */}
          <div className="relative h-10 mb-2">
            {['🎉', '⭐', '🔥', '✨', '💪'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-xl animate-emoji-rise"
                style={{
                  left: `${15 + i * 17}%`,
                  animationDelay: `${i * 0.1}s`,
                  bottom: 0,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <p className="text-base font-semibold" style={{ color: '#10b981' }}>
            All tasks complete!
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            You crushed it today
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
