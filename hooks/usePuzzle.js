'use client'
import { useReducer, useCallback } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeBoard(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(null))
}

function reducer(state, action) {
  const { board, tray, rows, cols } = state

  switch (action.type) {
    case 'PLACE': {
      const { pieceId, toRow, toCol } = action
      const newBoard = board.map((r) => [...r])
      const newTray = tray.filter((id) => id !== pieceId)

      const displaced = newBoard[toRow][toCol]

      // Find and clear the piece's current board position
      let vacatedRow = null
      let vacatedCol = null
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (newBoard[r][c] === pieceId) {
            newBoard[r][c] = null
            vacatedRow = r
            vacatedCol = c
          }
        }
      }

      // Handle displaced piece
      if (displaced !== null && displaced !== pieceId) {
        if (vacatedRow !== null) {
          // Board → Board: swap the displaced piece into the vacated slot
          newBoard[vacatedRow][vacatedCol] = displaced
        } else {
          // Tray → Board: displaced piece goes back to tray
          newTray.push(displaced)
        }
      }

      newBoard[toRow][toCol] = pieceId
      return { ...state, board: newBoard, tray: newTray }
    }

    case 'RETURN_TO_TRAY': {
      const { pieceId } = action
      const newBoard = board.map((r) => [...r])
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (newBoard[r][c] === pieceId) newBoard[r][c] = null
        }
      }
      return {
        ...state,
        board: newBoard,
        tray: tray.includes(pieceId) ? tray : [...tray, pieceId],
      }
    }

    case 'RESET': {
      return {
        ...state,
        board: makeBoard(rows, cols),
        tray: shuffle(action.pieceIds),
      }
    }

    default:
      return state
  }
}

/**
 * pieces must be the real, loaded pieces array — not empty.
 * Call this hook only after the image has been cut into pieces.
 */
export function usePuzzle(pieces, rows, cols) {
  const [state, dispatch] = useReducer(
    reducer,
    { pieces, rows, cols },
    ({ pieces, rows, cols }) => ({
      board: makeBoard(rows, cols),
      tray: shuffle(pieces.map((p) => p.id)),
      rows,
      cols,
    })
  )

  const { board, tray } = state

  const placePiece = useCallback(
    (pieceId, toRow, toCol) => dispatch({ type: 'PLACE', pieceId, toRow, toCol }),
    []
  )
  const returnToTray = useCallback(
    (pieceId) => dispatch({ type: 'RETURN_TO_TRAY', pieceId }),
    []
  )
  const reset = useCallback(
    () => dispatch({ type: 'RESET', pieceIds: pieces.map((p) => p.id) }),
    [pieces]
  )
  const isCorrect = useCallback(
    (pieceId, row, col) => {
      const p = pieces.find((p) => p.id === pieceId)
      return p?.correctRow === row && p?.correctCol === col
    },
    [pieces]
  )

  const placedCount = board.flat().filter((id) => id !== null).length
  const totalPieces = rows * cols
  const solved =
    placedCount === totalPieces &&
    board.every((row, r) =>
      row.every((id, c) => {
        if (id === null) return false
        return isCorrect(id, r, c)
      })
    )

  return { board, tray, placePiece, returnToTray, reset, solved, placedCount, totalPieces, isCorrect }
}
