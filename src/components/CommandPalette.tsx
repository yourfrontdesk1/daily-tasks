import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Command {
  id: string
  label: string
  shortcut?: string
  icon: string
  action: () => void
}

interface Props {
  commands: Command[]
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ commands, isOpen, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].action()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, filtered, selectedIndex, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(20, 18, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center px-4 gap-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 py-3.5 text-sm bg-transparent outline-none"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                />
              </div>

              {/* Commands */}
              <div className="max-h-64 overflow-y-auto py-1">
                {filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose() }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: i === selectedIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: i === selectedIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="text-base w-6 text-center">{cmd.icon}</span>
                    <span className="flex-1 text-sm">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.3)',
                        }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No commands found
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
