'use client'
import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ShareModal from '@/components/ShareModal'
import PuzzleGame from '@/components/PuzzleGame'

export default function HomePage() {
  // 'upload' | 'share' | 'play'
  const [stage, setStage] = useState('upload')
  const [challengeId, setChallengeId] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [gridSize, setGridSize] = useState(4)

  function handleChallenge(id, src, size) {
    setChallengeId(id)
    setImageSrc(src)
    setGridSize(size)
    setStage('share')
  }

  if (stage === 'play') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', background: 'white',
          boxShadow: '0 2px 12px rgba(155,114,207,0.1)',
        }}>
          <button
            onClick={() => setStage('upload')}
            style={headerBtn}
          >
            ← New Puzzle
          </button>
          <span style={{ fontFamily: "'Playfair Display',serif", color: '#2d1b2e', fontSize: '1rem' }}>
            💝 Love Puzzle
          </span>
          <button onClick={() => setStage('share')} style={headerBtn}>Share link</button>
        </header>
        <PuzzleGame imageSrc={imageSrc} gridSize={gridSize} />
      </div>
    )
  }

  return (
    <>
      <ImageUploader onChallenge={handleChallenge} />
      {stage === 'share' && challengeId && (
        <ShareModal
          challengeId={challengeId}
          onClose={() => setStage('upload')}
          onPlaySelf={() => setStage('play')}
        />
      )}
    </>
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
