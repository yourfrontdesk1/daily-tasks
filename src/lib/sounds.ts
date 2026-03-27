class TaskSoundEngine {
  private enabled = true
  private volume = 0.5

  private getCtx() {
    return new AudioContext()
  }

  setEnabled(val: boolean) {
    this.enabled = val
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val))
  }

  // Soft pop for individual task completion
  taskComplete() {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    // Add slight randomization to prevent habituation
    const baseFreq = 520 + (Math.random() * 40 - 20)
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  }

  // Two-tone chime for all tasks done
  allComplete() {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    const spacing = 0.1

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.type = 'triangle'

      const startTime = ctx.currentTime + i * spacing
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)

      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })
  }

  // Undo sound
  undo() {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  }

  // Swish for delete/reschedule
  swish() {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.12)
    filter.Q.value = 1.5

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(ctx.currentTime)
  }
}

export const sounds = new TaskSoundEngine()
