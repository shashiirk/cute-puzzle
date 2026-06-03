'use client'
import { useState } from 'react'

export default function ShareModal({ challengeId, onClose, onPlaySelf }) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/challenge/${challengeId}`
      : `/challenge/${challengeId}`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(45,27,46,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 24, padding: '40px 36px',
        maxWidth: 460, width: '100%',
        boxShadow: '0 16px 64px rgba(155,114,207,0.25)',
        display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem' }}>💌</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.6rem', color: '#2d1b2e', margin: 0,
        }}>
          Your puzzle is ready!
        </h2>
        <p style={{ color: '#7a5c7e', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
          Share this link with your special someone. They can solve the puzzle on any device — no account needed.
        </p>

        <div style={{
          background: '#f9f3fb', border: '1.5px solid #e8c8d0',
          borderRadius: 10, padding: '10px 14px',
          fontSize: '0.82rem', color: '#2d1b2e',
          wordBreak: 'break-all', textAlign: 'left', fontFamily: 'monospace',
        }}>
          {url}
        </div>

        <button
          onClick={copyLink}
          style={{
            background: copied
              ? 'linear-gradient(135deg,#48c78e,#27ae60)'
              : 'linear-gradient(135deg,#e8547a,#c23b61)',
            color: 'white', border: 'none', borderRadius: 12,
            padding: '14px', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(232,84,122,0.3)',
          }}
        >
          {copied ? '✓ Link copied!' : '📋 Copy link'}
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onPlaySelf} style={secondaryBtn}>
            Play it yourself
          </button>
          <button onClick={onClose} style={secondaryBtn}>
            Make another
          </button>
        </div>
      </div>
    </div>
  )
}

const secondaryBtn = {
  flex: 1,
  background: 'none',
  border: '1.5px solid #e8c8d0',
  borderRadius: 10,
  padding: '10px',
  fontSize: '0.85rem',
  color: '#7a5c7e',
  cursor: 'pointer',
}
