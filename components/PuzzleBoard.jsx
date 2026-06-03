'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePuzzle } from '@/hooks/usePuzzle'
import Confetti from './Confetti'

export default function PuzzleBoard({ pieces, aspectRatio, gridSize, imageSrc, onSolved }) {
  const rows = gridSize
  const cols = gridSize

  const puzzle = usePuzzle(pieces, rows, cols)

  const [drag, setDrag] = useState(null)

  // pieceW and pieceH respect the image's aspect ratio
  const [dims, setDims] = useState({ pieceW: 80, pieceH: 80 })

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Maximum space we want the board to occupy
      const maxBoardW = Math.min(vw * 0.55, 640)
      const maxBoardH = vh * 0.75

      // Fit the board within that box while keeping the image's aspect ratio
      let boardW = maxBoardW
      let boardH = boardW / aspectRatio

      if (boardH > maxBoardH) {
        boardH = maxBoardH
        boardW = boardH * aspectRatio
      }

      setDims({
        pieceW: Math.floor(boardW / cols),
        pieceH: Math.floor(boardH / rows),
      })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [aspectRatio, rows, cols])

  useEffect(() => {
    if (puzzle.solved) onSolved?.()
  }, [puzzle.solved, onSolved])

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const startDrag = useCallback((e, pieceId) => {
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDrag({ pieceId, currentX: clientX, currentY: clientY })
  }, [])

  const onMove = useCallback((e) => {
    if (!drag) return
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDrag((d) => ({ ...d, currentX: clientX, currentY: clientY }))
  }, [drag])

  const onUp = useCallback((e) => {
    if (!drag) return
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY

    const ghost = document.getElementById('drag-ghost')
    if (ghost) ghost.style.visibility = 'hidden'
    const el = document.elementFromPoint(clientX, clientY)
    if (ghost) ghost.style.visibility = 'visible'

    const slotEl = el?.closest('[data-slot]')
    if (slotEl) {
      puzzle.placePiece(drag.pieceId, parseInt(slotEl.dataset.row, 10), parseInt(slotEl.dataset.col, 10))
    } else {
      if (puzzle.board.some((row) => row.includes(drag.pieceId))) {
        puzzle.returnToTray(drag.pieceId)
      }
    }
    setDrag(null)
  }, [drag, puzzle])

  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [onMove, onUp])

  const { pieceW, pieceH } = dims
  const boardW = pieceW * cols
  const boardH = pieceH * rows
  const draggingPiece = drag ? pieces.find((p) => p.id === drag.pieceId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, userSelect: drag ? 'none' : '' }}>
      {puzzle.solved && <Confetti />}

      {/* Progress bar */}
      <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 8, background: '#f0e8ff', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(puzzle.placedCount / puzzle.totalPieces) * 100}%`,
            background: 'linear-gradient(90deg, #e8547a, #9b72cf)',
            borderRadius: 99,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#7a5c7e', whiteSpace: 'nowrap' }}>
          {puzzle.placedCount}/{puzzle.totalPieces} pieces
        </span>
        <button onClick={puzzle.reset} style={btnStyle}>↺ Reset</button>
      </div>

      {puzzle.solved && (
        <div style={{
          background: 'linear-gradient(135deg, #e8547a, #9b72cf)',
          color: 'white', textAlign: 'center', padding: '14px',
          fontFamily: "'Playfair Display', serif", fontSize: '1.1rem',
        }}>
          ♡ You solved it! ♡
        </div>
      )}

      {/* Game area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', gap: 24, padding: 20, flexWrap: 'wrap',
      }}>
        {/* Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${pieceW}px)`,
          width: boardW,
          height: boardH,
          border: '2px solid #e8c8d0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 32px rgba(155,114,207,0.18)',
          flexShrink: 0,
        }}>
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const pid = puzzle.board[r]?.[c] ?? null
              const piece = pid !== null ? pieces.find((p) => p.id === pid) : null
              const beingDragged = drag?.pieceId === pid

              return (
                <div
                  key={`${r}-${c}`}
                  data-slot="true"
                  data-row={r}
                  data-col={c}
                  style={{ width: pieceW, height: pieceH, position: 'relative', overflow: 'hidden' }}
                >
                  {/* Ghost guide — background-size matches full board dimensions */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: `${boardW}px ${boardH}px`,
                    backgroundPosition: `-${c * pieceW}px -${r * pieceH}px`,
                    opacity: piece && !beingDragged ? 0 : 0.13,
                    transition: 'opacity 0.2s',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: '1px solid rgba(232,84,122,0.18)',
                    pointerEvents: 'none',
                  }} />

                  {piece && !beingDragged && (
                    <div
                      style={{
                        position: 'absolute', inset: 0, cursor: 'grab',
                        boxShadow: puzzle.isCorrect(pid, r, c)
                          ? 'inset 0 0 0 2.5px rgba(72,199,142,0.85)' : undefined,
                        zIndex: 2,
                      }}
                      onMouseDown={(e) => startDrag(e, pid)}
                      onTouchStart={(e) => startDrag(e, pid)}
                    >
                      <img src={piece.src} alt="" draggable={false}
                        style={{ width: '100%', height: '100%', display: 'block' }} />
                      {puzzle.isCorrect(pid, r, c) && (
                        <span style={{
                          position: 'absolute', top: 3, right: 4,
                          fontSize: '0.6rem', color: '#48c78e', fontWeight: 700,
                          textShadow: '0 1px 3px white', pointerEvents: 'none',
                        }}>✓</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Piece tray */}
        <div style={{
          background: 'white', border: '2px solid #e8c8d0', borderRadius: 16,
          padding: 14, minWidth: 160, maxWidth: 220,
          maxHeight: 'calc(100vh - 160px)', overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(155,114,207,0.12)', flexShrink: 0,
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#9b72cf', textAlign: 'center', marginBottom: 10,
          }}>
            Pieces
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
            {puzzle.tray.map((pid) => {
              const piece = pieces.find((p) => p.id === pid)
              const beingDragged = drag?.pieceId === pid
              return (
                <div
                  key={pid}
                  style={{
                    width: pieceW, height: pieceH,
                    borderRadius: 6, overflow: 'hidden', cursor: 'grab',
                    border: '2px solid transparent',
                    opacity: beingDragged ? 0.25 : 1,
                    transition: 'border-color 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseDown={(e) => !beingDragged && startDrag(e, pid)}
                  onTouchStart={(e) => !beingDragged && startDrag(e, pid)}
                  onMouseEnter={(e) => { if (!beingDragged) e.currentTarget.style.borderColor = '#e8547a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                >
                  {!beingDragged && (
                    <img src={piece.src} alt="" draggable={false}
                      style={{ width: '100%', height: '100%', display: 'block' }} />
                  )}
                </div>
              )
            })}
            {puzzle.tray.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#9b72cf', textAlign: 'center', fontStyle: 'italic', padding: 8 }}>
                All placed!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating drag ghost */}
      {drag && draggingPiece && (
        <img
          id="drag-ghost"
          src={draggingPiece.src}
          draggable={false}
          style={{
            position: 'fixed', pointerEvents: 'none', zIndex: 9999,
            width: pieceW, height: pieceH,
            left: drag.currentX - pieceW / 2,
            top: drag.currentY - pieceH / 2,
            borderRadius: 6,
            boxShadow: '0 8px 32px rgba(155,114,207,0.4)',
            transform: 'scale(1.08) rotate(2deg)',
            opacity: 0.95,
          }}
        />
      )}
    </div>
  )
}

const btnStyle = {
  background: 'none',
  border: '1.5px solid #e8c8d0',
  borderRadius: 8,
  padding: '5px 12px',
  fontSize: '0.8rem',
  color: '#7a5c7e',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
