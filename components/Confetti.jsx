'use client'

const COLORS = ['#e8547a', '#9b72cf', '#f9c74f', '#90be6d', '#4cc9f0']
const SHAPES = ['♡', '✦', '★', '♥', '✿']

export default function Confetti() {
  const particles = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: (i / 70) * 100 + (Math.random() - 0.5) * 8,
    delay: (Math.random() * 2.5).toFixed(2),
    duration: (2.5 + Math.random() * 2.5).toFixed(2),
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    size: 12 + Math.floor(Math.random() * 14),
    drift: Math.round((Math.random() - 0.5) * 80),
  }))

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9998 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -40,
            left: `${p.x}%`,
            color: p.color,
            fontSize: p.size,
            animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.shape}
        </span>
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
