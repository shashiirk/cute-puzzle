import { NextResponse } from 'next/server'
import { getChallenge } from '@/lib/storage'

export async function GET(request, { params }) {
  const challenge = await getChallenge(params.id)
  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: challenge.id,
    imageSrc: challenge.imageSrc,
    gridSize: challenge.gridSize,
    createdAt: challenge.createdAt,
  })
}
