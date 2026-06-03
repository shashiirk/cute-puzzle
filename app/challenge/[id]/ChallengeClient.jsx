'use client'
import { useState, useEffect } from 'react'
import PuzzleGame from '@/components/PuzzleGame'
import Confetti from '@/components/Confetti'

const LS_KEY = 'cute-puzzle-completions'

function getCompletions() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

function markCompleted(challengeId) {
  const completions = getCompletions()
  completions[challengeId] = new Date().toISOString()
  localStorage.setItem(LS_KEY, JSON.stringify(completions))
}

const FALLBACK_MESSAGE = "Someone who cares about you made this puzzle just for you. Can you put the pieces together?"

export default function ChallengeClient({ challengeId, imageSrc, gridSize, message }) {
  const displayMessage = message && message.trim() ? message.trim() : FALLBACK_MESSAGE
  // 'intro' | 'playing' | 'won'
  const [stage, setStage] = useState('intro')
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const completions = getCompletions()
    if (completions[challengeId]) setAlreadyCompleted(true)
  }, [challengeId])

  function handleSolved() {
    markCompleted(challengeId)
    setStage('won')
    setShowConfetti(true)
  }

  if (stage === 'intro') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'linear-gradient(135deg,#fff0f3 0%,#f5eeff 100%)',
      }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '44px 40px',
          maxWidth: 460, width: '100%', textAlign: 'center',
          boxShadow: '0 8px 48px rgba(155,114,207,0.2)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div style={{ fontSize: '3rem' }}>💌</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem', color: '#2d1b2e',
          }}>
            A special puzzle is waiting for you
          </h1>
          <p style={{ color: '#7a5c7e', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {displayMessage}
          </p>

          {/* Blurred preview */}
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(155,114,207,0.2)',
          }}>
            <img
              src={imageSrc} alt="Puzzle preview"
              style={{
                width: '100%', height: 200, objectFit: 'cover', display: 'block',
                filter: 'blur(16px) brightness(0.85)',
                transform: 'scale(1.05)',
              }}
            />
          </div>

          {alreadyCompleted && (
            <p style={{
              background: '#f0fff4', border: '1.5px solid #48c78e',
              borderRadius: 10, padding: '10px 14px',
              fontSize: '0.85rem', color: '#2a7a56',
            }}>
              ✓ You've already solved this puzzle! Play again?
            </p>
          )}

          <button
            onClick={() => setStage('playing')}
            style={{
              background: 'linear-gradient(135deg,#e8547a,#c23b61)',
              color: 'white', border: 'none', borderRadius: 14, padding: '16px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(232,84,122,0.35)',
            }}
          >
            Start Solving ♡
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'won') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'linear-gradient(135deg,#fff0f3 0%,#f5eeff 100%)',
        flexDirection: 'column', gap: 24, textAlign: 'center',
      }}>
        {showConfetti && <Confetti />}
        <div style={{ fontSize: '4rem' }}>💝</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.2rem', color: '#2d1b2e',
        }}>
          You did it!
        </h1>
        <p style={{ color: '#7a5c7e', fontSize: '1rem', lineHeight: 1.6, maxWidth: 340 }}>
          You solved the puzzle ♡ This memory is now yours to keep.
        </p>
        <img
          src={imageSrc} alt="Solved puzzle"
          style={{
            width: '100%', maxWidth: 360, height: 260,
            objectFit: 'cover', borderRadius: 16,
            boxShadow: '0 8px 40px rgba(155,114,207,0.25)',
          }}
        />
        <button
          onClick={() => { setStage('playing'); setShowConfetti(false) }}
          style={{
            background: 'none', border: '1.5px solid #e8c8d0',
            borderRadius: 10, padding: '10px 24px',
            fontSize: '0.9rem', color: '#7a5c7e', cursor: 'pointer',
          }}
        >
          Play again
        </button>
      </div>
    )
  }

  // Playing
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'white',
        boxShadow: '0 2px 12px rgba(155,114,207,0.1)',
      }}>
        <button onClick={() => setStage('intro')} style={headerBtn}>← Back</button>
        <span style={{
          fontFamily: "'Playfair Display',serif", color: '#2d1b2e', fontSize: '1rem',
        }}>
          💝 Love Puzzle
        </span>
        <div style={{ width: 80 }} />
      </header>
      <PuzzleGame
        imageSrc={imageSrc}
        gridSize={gridSize}
        onSolved={handleSolved}
      />
    </div>
  )
}

const headerBtn = {
  background: 'none',
  border: '1.5px solid #e8c8d0',
  borderRadius: 8,
  padding: '6px 14px',
  fontSize: '0.82rem',
  color: '#7a5c7e',
  cursor: 'pointer',
}
