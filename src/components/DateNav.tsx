import { motion } from 'framer-motion'

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface Props {
  currentDate: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  isToday: boolean
}

export default function DateNav({ currentDate, onPrev, onNext, onToday, isToday }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPrev}
        className="p-2 rounded-lg transition-colors duration-150"
        style={{ color: 'rgba(255,255,255,0.4)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <div className="text-center">
        <motion.h2
          key={currentDate}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold tracking-tight cursor-pointer"
          style={{ color: '#faf5ff' }}
          onClick={!isToday ? onToday : undefined}
        >
          {formatDate(currentDate)}
        </motion.h2>
        {!isToday && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-0.5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            {formatFullDate(currentDate)}
          </motion.p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNext}
        className="p-2 rounded-lg transition-colors duration-150"
        style={{ color: 'rgba(255,255,255,0.4)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  )
}
