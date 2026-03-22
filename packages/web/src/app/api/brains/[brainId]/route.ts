import { NextRequest, NextResponse } from 'next/server'
import { getBrain, getDemoBrainPath, DEMO_BRAIN, scanBrainFiles, parseBrainLinks, getExecutionSteps, getHandoffs } from '@/lib/local-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brainId: string }> }
) {
  const { brainId } = await params

  let brainPath: string
  let brainName: string
  let brainDescription: string
  let isDemo = false

  if (brainId === 'demo') {
    brainPath = getDemoBrainPath()
    brainName = DEMO_BRAIN.name
    brainDescription = DEMO_BRAIN.description
    isDemo = true
  } else {
    const brain = getBrain(brainId)
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 })
    }
    brainPath = brain.path
    brainName = brain.name
    brainDescription = brain.description
  }

  const files = scanBrainFiles(brainPath)
  const links = parseBrainLinks(brainPath, files)
  const executionSteps = getExecutionSteps(brainPath, files)
  const handoffs = getHandoffs(brainPath, files)

  return NextResponse.json({
    brain: { id: brainId, name: brainName, description: brainDescription, is_demo: isDemo },
    files,
    links,
    executionSteps,
    handoffs,
  })
}
