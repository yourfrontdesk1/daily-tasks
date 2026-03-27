export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full animate-orb-1 pointer-events-none"
        style={{ background: 'rgba(139, 92, 246, 0.08)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full animate-orb-2 pointer-events-none"
        style={{ background: 'rgba(16, 185, 129, 0.06)', filter: 'blur(100px)' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full animate-orb-3 pointer-events-none"
        style={{ background: 'rgba(59, 130, 246, 0.06)', filter: 'blur(80px)' }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
