import { NextRequest, NextResponse } from 'next/server'
import { getBrain, getDemoBrainPath, readBrainFile } from '@/lib/local-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brainId: string }> }
) {
  const { brainId } = await params
  const filePath = request.nextUrl.searchParams.get('path')

  if (!filePath) {
    return new NextResponse('Missing path parameter', { status: 400 })
  }

  let brainPath: string
  if (brainId === 'demo') {
    brainPath = getDemoBrainPath()
  } else {
    const brain = getBrain(brainId)
    if (!brain) {
      return new NextResponse('Brain not found', { status: 404 })
    }
    brainPath = brain.path
  }

  try {
    const content = readBrainFile(brainPath, filePath)
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read file'
    return new NextResponse(message, { status: 404 })
  }
}
