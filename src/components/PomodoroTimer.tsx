import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sounds } from '../lib/sounds'

interface Props {
  taskName: string
  onComplete: () => void
  onClose: () => void
}

const WORK_DURATION = 25 * 60 // 25 minutes
const BREAK_DURATION = 5 * 60 // 5 minutes

export default function PomodoroTimer({ taskName, onComplete, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current)
      sounds.allComplete()

      if (!isBreak) {
        setSessions(prev => prev + 1)
        setIsBreak(true)
        setTimeLeft(BREAK_DURATION)
        setIsRunning(false)
      } else {
        setIsBreak(false)
        setTimeLeft(WORK_DURATION)
        setIsRunning(false)
      }
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, isBreak])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isBreak
    ? (BREAK_DURATION - timeLeft) / BREAK_DURATION
    : (WORK_DURATION - timeLeft) / WORK_DURATION

  const circumference = 2 * Math.PI * 54

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="text-center max-w-sm w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Status */}
        <p className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: isBreak ? '#10b981' : '#8b5cf6' }}>
          {isBreak ? 'Break time' : 'Focus mode'}
        </p>

        {/* Task name */}
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {taskName}
        </p>

        {/* Circular timer */}
        <div className="relative inline-block mb-8">
          <svg width="140" height="140" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={isBreak ? '#10b981' : '#8b5cf6'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 8px ${isBreak ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.4)'})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light tabular-nums" style={{ color: '#faf5ff', letterSpacing: '-0.02em' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3 rounded-xl text-sm font-medium"
            style={{
              background: isRunning
                ? 'rgba(255,255,255,0.08)'
                : `linear-gradient(135deg, ${isBreak ? '#10b981' : '#8b5cf6'}, ${isBreak ? '#059669' : '#7c3aed'})`,
              color: 'white',
              boxShadow: !isRunning ? `0 4px 16px ${isBreak ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}` : 'none',
            }}
          >
            {isRunning ? 'Pause' : timeLeft === WORK_DURATION || timeLeft === BREAK_DURATION ? 'Start' : 'Resume'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setTimeLeft(isBreak ? BREAK_DURATION : WORK_DURATION)
              setIsRunning(false)
            }}
            className="px-4 py-3 rounded-xl text-sm"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}
          >
            Reset
          </motion.button>
        </div>

        {/* Session count */}
        {sessions > 0 && (
          <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {sessions} session{sessions !== 1 ? 's' : ''} completed today
          </p>
        )}

        {/* Complete task button */}
        {!isBreak && (
          <button
            onClick={() => { onComplete(); onClose() }}
            className="mt-4 text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
          >
            Mark task as done
          </button>
        )}
      </div>
    </motion.div>
  )
}
