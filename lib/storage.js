/**
 * Challenge storage — auto-selects implementation based on environment.
 *
 * Local dev  → files in data/challenges/{id}.json  (no extra setup needed)
 * Vercel     → Vercel Blob only  (one service, one env var: BLOB_READ_WRITE_TOKEN)
 *
 * On Vercel the image is uploaded directly from the browser to Vercel Blob CDN
 * (via /api/blob-upload). By the time saveChallenge() is called, the image is
 * already stored — we just save the metadata JSON that points to it.
 *
 * Interface:
 *   saveChallenge(imageData, gridSize) → Promise<string>  (challenge ID)
 *     - Vercel: imageData is a Blob CDN URL  (https://...)
 *     - Local:  imageData is a base64 data URL
 *
 *   getChallenge(id) → Promise<{ id, imageSrc, gridSize, createdAt } | null>
 *     - imageSrc is always something <img> and canvas.drawImage can consume
 */

import { nanoid } from 'nanoid'

function isValidId(id) {
  return /^[a-zA-Z0-9_-]{6,24}$/.test(id)
}

const USE_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN

// ─── File-based (local dev) ───────────────────────────────────────────────────

async function saveLocal(imageSrc, gridSize) {
  const fs   = (await import('fs')).default
  const path = (await import('path')).default

  const DIR = path.join(process.cwd(), 'data', 'challenges')
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })

  const id = nanoid(10)
  fs.writeFileSync(
    path.join(DIR, `${id}.json`),
    JSON.stringify({ id, imageSrc, gridSize, createdAt: new Date().toISOString() }),
    'utf8'
  )
  return id
}

async function getLocal(id) {
  if (!isValidId(id)) return null
  const fs   = (await import('fs')).default
  const path = (await import('path')).default

  const file = path.join(process.cwd(), 'data', 'challenges', `${id}.json`)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

// ─── Vercel Blob only ─────────────────────────────────────────────────────────
//
// The image is already in Blob (uploaded directly by the browser).
// saveVercel only needs to store a small metadata JSON.

async function saveVercel(imageUrl, gridSize) {
  const { put } = await import('@vercel/blob')

  const id = nanoid(10)
  const meta = { id, imageUrl, gridSize, createdAt: new Date().toISOString() }

  await put(`challenges/${id}/meta`, JSON.stringify(meta), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })

  return id
}

async function getVercel(id) {
  if (!isValidId(id)) return null
  const { list } = await import('@vercel/blob')

  const { blobs } = await list({ prefix: `challenges/${id}/meta` })
  if (!blobs.length) return null

  try {
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return null
    const meta = await res.json()
    return {
      id:        meta.id,
      imageSrc:  meta.imageUrl,
      gridSize:  meta.gridSize,
      createdAt: meta.createdAt,
    }
  } catch {
    return null
  }
}

// ─── Exported interface ───────────────────────────────────────────────────────

export const saveChallenge = USE_VERCEL ? saveVercel : saveLocal
export const getChallenge  = USE_VERCEL ? getVercel  : getLocal
