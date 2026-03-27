import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseTaskInput } from '../lib/dateParser'
import type { RecurrenceRule } from '../lib/recurrence'

interface Props {
  onAdd: (text: string, options?: { recurring?: RecurrenceRule; targetDate?: string }) => void
  currentDate: string
}

const recurrenceOptions: { value: RecurrenceRule; label: string }[] = [
  { value: null, label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function AddTask({ onAdd, currentDate }: Props) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [recurring, setRecurring] = useState<RecurrenceRule>(null)
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parsed = text ? parseTaskInput(text) : null
  const hasDate = parsed?.dueDate && parsed.dueDate !== currentDate

  // Keyboard shortcut: press 'n' to focus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'n' && !focused && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [focused])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    if (parsed && parsed.dueDate) {
      onAdd(parsed.text, { recurring, targetDate: parsed.dueDate })
    } else {
      onAdd(trimmed, { recurring })
    }
    setText('')
    setRecurring(null)
    setShowOptions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-6"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder='Add a task... (try "call dentist tomorrow")'
            className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 outline-none"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${focused ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
              color: 'rgba(255, 255, 255, 0.9)',
              boxShadow: focused ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none',
            }}
          />
          {focused && (
            <div className="absolute inset-x-0 -bottom-px h-px rounded-full"
              style={{ background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5), transparent)' }} />
          )}
        </div>

        {/* Recurrence toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOptions(!showOptions)}
          className="p-3 rounded-xl transition-all duration-200"
          style={{
            background: recurring ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${recurring ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
            color: recurring ? '#a78bfa' : 'rgba(255,255,255,0.3)',
          }}
          title="Set recurrence"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>

        <motion.button
          type="submit"
          disabled={!text.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
              : 'rgba(255, 255, 255, 0.04)',
            color: 'white',
            boxShadow: text.trim() ? '0 4px 16px rgba(139, 92, 246, 0.3)' : 'none',
          }}
        >
          Add
        </motion.button>
      </form>

      {/* Parsed date indicator */}
      <AnimatePresence>
        {hasDate && parsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-2"
          >
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
              📅 Scheduled for {new Date(parsed.dueDate! + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurrence options */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-1.5 flex-wrap"
          >
            {recurrenceOptions.map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setRecurring(opt.value)}
                className="text-xs px-2.5 py-1 rounded-full transition-all duration-200"
                style={{
                  background: recurring === opt.value
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${recurring === opt.value ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                  color: recurring === opt.value ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
