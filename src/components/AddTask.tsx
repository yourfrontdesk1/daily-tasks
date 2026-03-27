import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onAdd: (text: string) => void
}

export default function AddTask({ onAdd }: Props) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: press 'n' to focus when not already in input
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
    onAdd(trimmed)
    setText('')
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-2 mb-6"
    >
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Add a task... (press N)"
          className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${focused ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
            color: 'rgba(255, 255, 255, 0.9)',
            boxShadow: focused ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none',
          }}
        />
        {/* Subtle gradient border glow when focused */}
        {focused && (
          <div className="absolute inset-x-0 -bottom-px h-px rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5), transparent)' }} />
        )}
      </div>
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
    </motion.form>
  )
}
