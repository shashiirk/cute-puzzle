'use client'
import { useState, useEffect } from 'react'
import { cutImageIntoPieces } from '@/lib/puzzleUtils'
import PuzzleBoard from './PuzzleBoard'

export default function PuzzleGame({ imageSrc, gridSize, onSolved }) {
  const [result, setResult] = useState(null)  // { pieces, aspectRatio }
  const [error, setError] = useState(null)

  useEffect(() => {
    setResult(null)
    setError(null)
    cutImageIntoPieces(imageSrc, gridSize, gridSize)
      .then(setResult)
      .catch(() => setError('Could not load the image. Please try another photo.'))
  }, [imageSrc, gridSize])

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#e8547a' }}>
        <p>{error}</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        color: '#7a5c7e', fontSize: '1rem',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e8c8d0',
          borderTopColor: '#e8547a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p>Cutting your puzzle pieces...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <PuzzleBoard
      pieces={result.pieces}
      aspectRatio={result.aspectRatio}
      gridSize={gridSize}
      imageSrc={imageSrc}
      onSolved={onSolved}
    />
  )
}
