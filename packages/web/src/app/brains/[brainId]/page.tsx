import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBrain, getDemoBrainPath, DEMO_BRAIN, scanBrainFiles, parseBrainLinks, getExecutionSteps, getHandoffs } from '@/lib/local-data'
import { BrainLayout } from '@/components/brain/brain-layout'

async function getBrainData(brainId: string) {
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
    if (!brain) return null
    brainPath = brain.path
    brainName = brain.name
    brainDescription = brain.description
  }

  const files = scanBrainFiles(brainPath)
  const links = parseBrainLinks(brainPath, files)
  const executionSteps = getExecutionSteps(brainPath, files)
  const handoffs = getHandoffs(brainPath, files)

  return {
    brain: { id: brainId, name: brainName, description: brainDescription, is_demo: isDemo },
    files,
    links,
    executionSteps,
    handoffs,
  }
}

export default async function BrainPage({ params }: { params: Promise<{ brainId: string }> }) {
  const { brainId } = await params
  const data = await getBrainData(brainId)

  if (!data) notFound()

  const { brain, files, links, executionSteps, handoffs } = data

  return (
    <div className="bg-mesh grain flex h-full flex-col overflow-hidden">
      <nav className="relative z-50 flex shrink-0 items-center justify-between border-b border-border px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.png" alt="BrainTree" className="h-6 sm:h-7" />
          </Link>
          <span className="text-text-muted">/</span>
          <Link href="/brains" className="hidden text-[13px] text-text-secondary transition-colors hover:text-text sm:inline">Brains</Link>
          <span className="hidden text-text-muted sm:inline">/</span>
          <span className="truncate text-[13px] font-medium">{brain.name}</span>
        </div>
      </nav>

      <BrainLayout
        brainId={brainId}
        files={files}
        links={links}
        executionSteps={executionSteps}
        handoffs={handoffs}
        isDemo={brain.is_demo ?? false}
        brainName={brain.name}
        brainDescription={brain.description ?? ''}
      />
    </div>
  )
}
