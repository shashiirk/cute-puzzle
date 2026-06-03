import { NextResponse } from 'next/server'
import { saveChallenge } from '@/lib/storage'

export const maxDuration = 30

export async function POST(request) {
  try {
    const body = await request.json()
    const { imageSrc, gridSize } = body

    if (!imageSrc || typeof imageSrc !== 'string') {
      return NextResponse.json({ error: 'imageSrc is required' }, { status: 400 })
    }
    if (!imageSrc.startsWith('data:image/')) {
      return NextResponse.json({ error: 'imageSrc must be a data URL' }, { status: 400 })
    }

    const size = Math.round(imageSrc.length * 0.75) // approx bytes
    if (size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 8MB)' }, { status: 413 })
    }

    const gs = Number(gridSize)
    if (!gs || gs < 2 || gs > 8) {
      return NextResponse.json({ error: 'gridSize must be between 2 and 8' }, { status: 400 })
    }

    const id = await saveChallenge(imageSrc, gs)
    return NextResponse.json({ id })
  } catch (err) {
    console.error('POST /api/challenges', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
