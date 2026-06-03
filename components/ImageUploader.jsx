'use client'
import { useRef, useState } from 'react'

const GRID_OPTIONS = [
  { label: '3×3', sublabel: 'Easy · 9 pieces', value: 3 },
  { label: '4×4', sublabel: 'Medium · 16 pieces', value: 4 },
  { label: '5×5', sublabel: 'Hard · 25 pieces', value: 5 },
  { label: '6×6', sublabel: 'Expert · 36 pieces', value: 6 },
]

export default function ImageUploader({ onChallenge }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null) // base64 data URL
  const [gridSize, setGridSize] = useState(4)
  const [dragOver, setDragOver] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please choose a photo under 10MB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  async function handleCreate() {
    if (!preview) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageSrc: preview, gridSize }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create challenge')
      onChallenge(data.id, preview, gridSize)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'linear-gradient(135deg,#fff0f3 0%,#f5eeff 100%)',
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 520,
        boxShadow: '0 8px 48px rgba(155,114,207,0.18)',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>💝</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem', color: '#2d1b2e', margin: 0,
          }}>
            Love Puzzle
          </h1>
          <p style={{ color: '#7a5c7e', fontSize: '0.9rem', marginTop: 8, lineHeight: 1.5 }}>
            Turn a special photo into a puzzle and share it with your partner
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border: preview ? 'none' : `2px dashed ${dragOver ? '#e8547a' : '#e8c8d0'}`,
            borderRadius: 16,
            minHeight: preview ? 0 : 180,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            background: dragOver ? '#fff0f3' : preview ? 'transparent' : 'white',
            transition: 'all 0.2s',
            overflow: 'hidden',
          }}
        >
          {preview ? (
            <img
              src={preview} alt="Preview"
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14, display: 'block' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📷</div>
              <p style={{ fontWeight: 500, color: '#2d1b2e', margin: 0 }}>Drop your photo here</p>
              <p style={{ color: '#7a5c7e', fontSize: '0.85rem', marginTop: 4 }}>or click to browse</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {preview && (
          <button
            onClick={() => setPreview(null)}
            style={{
              alignSelf: 'center', background: 'none',
              border: '1px solid #e8c8d0', borderRadius: 8,
              padding: '5px 14px', fontSize: '0.82rem', color: '#7a5c7e', cursor: 'pointer',
              marginTop: -10,
            }}
          >
            Change photo
          </button>
        )}

        {/* Difficulty */}
        <div>
          <div style={{
            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: '#2d1b2e', marginBottom: 10,
          }}>
            Difficulty
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {GRID_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGridSize(opt.value)}
                style={{
                  background: gridSize === opt.value ? '#f0e8ff' : '#f9f3fb',
                  border: `1.5px solid ${gridSize === opt.value ? '#9b72cf' : '#e8c8d0'}`,
                  borderRadius: 10, padding: '10px 12px',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  fontSize: '0.95rem', fontWeight: gridSize === opt.value ? 700 : 500,
                  color: gridSize === opt.value ? '#6b4faa' : '#2d1b2e',
                }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7a5c7e', marginTop: 2 }}>{opt.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: '#e8547a', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          disabled={!preview || creating}
          onClick={handleCreate}
          style={{
            background: !preview || creating
              ? '#f0e0e5'
              : 'linear-gradient(135deg,#e8547a,#c23b61)',
            color: !preview || creating ? '#b88a95' : 'white',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: '1rem', fontWeight: 600, cursor: !preview || creating ? 'not-allowed' : 'pointer',
            boxShadow: !preview || creating ? 'none' : '0 4px 20px rgba(232,84,122,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {creating ? 'Creating challenge...' : 'Create Challenge ♡'}
        </button>
      </div>
    </div>
  )
}
