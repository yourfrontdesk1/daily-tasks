import { motion, AnimatePresence } from 'framer-motion'

const accents = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
]

interface Props {
  show: boolean
  onClose: () => void
  currentAccent: string
  onSelect: (color: string) => void
}

export default function AccentPicker({ show, onClose, currentAccent, onSelect }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl p-5"
            style={{
              background: 'rgba(20, 18, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Accent color
            </p>
            <div className="flex items-center gap-2.5">
              {accents.map(a => (
                <motion.button
                  key={a.value}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelect(a.value)}
                  className="w-7 h-7 rounded-full transition-all duration-150"
                  style={{
                    background: a.value,
                    boxShadow: currentAccent === a.value
                      ? `0 0 0 2px #0a0a0f, 0 0 0 4px ${a.value}`
                      : 'none',
                    opacity: currentAccent === a.value ? 1 : 0.6,
                  }}
                  title={a.name}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
