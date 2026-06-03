import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

/**
 * Vercel Blob client-upload handler.
 * The browser calls this to get a short-lived upload token, then uploads
 * the image file directly to Vercel Blob CDN — never touching this function
 * with the actual image bytes (which would hit the 4.5MB payload limit).
 */
export async function POST(request) {
  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Nothing to do after upload — the challenge is created separately
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
