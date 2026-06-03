/**
 * Cuts an image data URL into a grid of piece data URLs using canvas.
 * Returns an array of piece objects ordered row-by-row.
 */
export async function cutImageIntoPieces(imageSrc, rows, cols) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // required when imageSrc is a CDN URL (Vercel Blob)
    img.onload = () => {
      const pieceW = Math.floor(img.width / cols)
      const pieceH = Math.floor(img.height / rows)
      const pieces = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas')
          canvas.width = pieceW
          canvas.height = pieceH
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH)
          pieces.push({
            id: r * cols + c,
            correctRow: r,
            correctCol: c,
            src: canvas.toDataURL('image/jpeg', 0.92),
          })
        }
      }
      resolve(pieces)
    }
    img.onerror = reject
    img.src = imageSrc
  })
}
