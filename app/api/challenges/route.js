import { NextResponse } from 'next/server'
import { saveChallenge } from '@/lib/storage'

export const maxDuration = 30

export async function POST(request) {
  try {
    const body = await request.json()
    const { imageSrc, imageUrl, gridSize } = body

    const gs = Number(gridSize)
    if (!gs || gs < 2 || gs > 8) {
      return NextResponse.json({ error: 'gridSize must be between 2 and 8' }, { status: 400 })
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel: image was uploaded directly to Blob by the browser
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
        return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
      }
      const id = await saveChallenge(imageUrl, gs)
      return NextResponse.json({ id })
    } else {
      // Local dev: image arrives as a base64 data URL
      if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.startsWith('data:image/')) {
        return NextResponse.json({ error: 'imageSrc is required' }, { status: 400 })
      }
      const id = await saveChallenge(imageSrc, gs)
      return NextResponse.json({ id })
    }
  } catch (err) {
    console.error('POST /api/challenges', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
