import { motion } from 'framer-motion'

interface Props {
  total: number
  completed: number
}

export default function ProgressBar({ total, completed }: Props) {
  if (total === 0) return null

  const percent = (completed / total) * 100
  const allDone = completed === total

  return (
    <div className="mb-6">
      {/* Segmented progress */}
      <div className="flex gap-1 mb-2">
        {[...Array(total)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i < completed
                ? allDone
                  ? '#10b981'
                  : 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                : 'rgba(255, 255, 255, 0.06)',
              boxShadow: i < completed
                ? allDone
                  ? '0 0 8px rgba(16, 185, 129, 0.4)'
                  : '0 0 8px rgba(139, 92, 246, 0.3)'
                : 'none',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Shimmer bar underneath */}
      <div className="relative h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <motion.div
          className="h-full rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            background: allDone
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
          }}
        >
          <div className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
