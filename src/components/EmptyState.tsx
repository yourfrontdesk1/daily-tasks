import { motion } from 'framer-motion'

export default function EmptyState({ isToday }: { isToday: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-16"
    >
      <div className="relative inline-block">
        <div className="animate-float">
          <span className="text-6xl block mb-4">
            {isToday ? '🎯' : '📋'}
          </span>
        </div>
        <div className="absolute -bottom-1 left-1/2 w-12 h-3 rounded-full blur-sm animate-float-shadow"
          style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <h3 className="text-base font-medium mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {isToday ? 'Nothing planned yet' : 'No tasks for this day'}
      </h3>
      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {isToday ? 'Add your first task to get started' : ''}
      </p>
    </motion.div>
  )
}
