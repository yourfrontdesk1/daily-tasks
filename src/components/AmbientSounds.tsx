import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type SoundType = 'rain' | 'brown' | 'cafe' | null

export default function AmbientSounds() {
  const [active, setActive] = useState<SoundType>(null)
  const [volume, setVolume] = useState(0.3)
  const [showPanel, setShowPanel] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ source?: AudioBufferSourceNode | AudioWorkletNode | OscillatorNode; gain?: GainNode; interval?: ReturnType<typeof setInterval> }>({})

  const stopSound = useCallback(() => {
    try {
      if (nodesRef.current.interval) clearInterval(nodesRef.current.interval)
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close()
      }
    } catch {
      // ignore
    }
    ctxRef.current = null
    nodesRef.current = {}
    setActive(null)
  }, [])

  const createBrownNoise = useCallback((ctx: AudioContext, gain: GainNode) => {
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut + 0.02 * white) / 1.02
      data[i] = lastOut * 3.5
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    nodesRef.current.source = source
  }, [])

  const createRain = useCallback((ctx: AudioContext, gain: GainNode) => {
    // Base rain noise
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1500

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 200

    source.connect(lp)
    lp.connect(hp)
    hp.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    nodesRef.current.source = source

    // Random droplets
    const droplet = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.connect(g)
      g.connect(ctx.destination)
      const freq = 2000 + Math.random() * 4000
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + 0.05)
      osc.type = 'sine'
      g.gain.setValueAtTime(0.015 * Math.random() * volume, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    }

    const interval = setInterval(droplet, 50 + Math.random() * 200)
    nodesRef.current.interval = interval
  }, [volume])

  const createCafe = useCallback((ctx: AudioContext, gain: GainNode) => {
    // Cafe: brown noise + occasional murmurs (filtered noise bursts)
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut + 0.03 * white) / 1.03
      data[i] = lastOut * 3
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 800
    bp.Q.value = 0.5

    source.connect(bp)
    bp.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    nodesRef.current.source = source

    // Occasional murmurs
    const murmur = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      const f = ctx.createBiquadFilter()
      osc.connect(f)
      f.connect(g)
      g.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(100 + Math.random() * 200, ctx.currentTime)
      f.type = 'lowpass'
      f.frequency.value = 500 + Math.random() * 300
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.01 * volume, ctx.currentTime + 0.1)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3 + Math.random() * 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    }

    const interval = setInterval(murmur, 300 + Math.random() * 1500)
    nodesRef.current.interval = interval
  }, [volume])

  const playSound = useCallback((type: SoundType) => {
    stopSound()
    if (!type) return

    const ctx = new AudioContext()
    ctxRef.current = ctx
    const gain = ctx.createGain()
    gain.gain.value = volume

    switch (type) {
      case 'brown': createBrownNoise(ctx, gain); break
      case 'rain': createRain(ctx, gain); break
      case 'cafe': createCafe(ctx, gain); break
    }

    setActive(type)
  }, [volume, stopSound, createBrownNoise, createRain, createCafe])

  const sounds: { type: SoundType; label: string; icon: string }[] = [
    { type: 'rain', label: 'Rain', icon: '🌧️' },
    { type: 'brown', label: 'Brown noise', icon: '🔈' },
    { type: 'cafe', label: 'Cafe', icon: '☕' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 rounded-lg transition-all duration-150"
        style={{
          color: active ? '#8b5cf6' : 'rgba(255,255,255,0.25)',
          background: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
        title="Ambient sounds"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl p-3 z-30"
            style={{
              background: 'rgba(20, 18, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Focus sounds
            </p>
            <div className="space-y-1 mb-3">
              {sounds.map(s => (
                <button
                  key={s.label}
                  onClick={() => playSound(active === s.type ? null : s.type)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: active === s.type ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: active === s.type ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  }}
                  onMouseEnter={e => {
                    if (active !== s.type) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    if (active !== s.type) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-xs flex-1">{s.label}</span>
                  {active === s.type && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Vol</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  setVolume(v)
                  if (nodesRef.current && ctxRef.current) {
                    // Restart with new volume
                    if (active) playSound(active)
                  }
                }}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #8b5cf6 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
