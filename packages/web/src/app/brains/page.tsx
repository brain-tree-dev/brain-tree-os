export const dynamic = 'force-dynamic'

import { listBrains, getDemoBrainPath, DEMO_BRAIN, scanBrainFiles } from '@/lib/local-data'
import { buildDepartmentColorMap } from '@/components/brain/department-colors'
import BrainsPageClient from './brains-page-client'

interface BrainCardData {
  id: string
  name: string
  description: string
  is_demo: boolean
  fileCount: number
  departmentCount: number
  agentCount: number
  rootFolderColors: string[]
}

function getBrainData(): { demos: BrainCardData[]; userBrains: BrainCardData[] } {
  const demoBrainPath = getDemoBrainPath()
  const demoFiles = scanBrainFiles(demoBrainPath)
  const rootFolders = new Set(demoFiles.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0]))
  const colorMap = buildDepartmentColorMap(demoFiles)
  const rootFolderColors = Array.from(rootFolders).sort().map((f) => colorMap.get(f) ?? '#64748B')

  const demo: BrainCardData = {
    id: 'demo',
    name: DEMO_BRAIN.name,
    description: DEMO_BRAIN.description,
    is_demo: true,
    fileCount: demoFiles.length,
    departmentCount: rootFolders.size,
    agentCount: demoFiles.filter((f) => f.path.startsWith('.braintree/agents/')).length,
    rootFolderColors,
  }

  const userBrains = listBrains().map((brain) => {
    const files = scanBrainFiles(brain.path)
    const folders = new Set(files.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0]))
    const cMap = buildDepartmentColorMap(files)
    return {
      id: brain.id,
      name: brain.name,
      description: brain.description,
      is_demo: false,
      fileCount: files.length,
      departmentCount: folders.size,
      agentCount: files.filter((f) => f.path.startsWith('.braintree/agents/')).length,
      rootFolderColors: Array.from(folders).sort().map((f) => cMap.get(f) ?? '#64748B'),
    }
  })

  return { demos: [demo], userBrains }
}

export default function BrainsPage() {
  const { demos, userBrains } = getBrainData()

  return (
    <div className="bg-mesh grain min-h-screen">
      <nav className="animate-fade-up relative z-50 flex items-center justify-between px-6 py-3 lg:px-12 lg:py-5">
        <div className="flex items-center gap-2 lg:gap-3">
          <img src="/logo.png" alt="BrainTree" className="h-8 lg:h-10" />
          <span className="text-[15px] font-semibold tracking-tight lg:text-[18px]">BrainTree OS</span>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-4 lg:px-12 lg:py-6">
        <div className="animate-fade-up animate-delay-1 mb-5">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Brains</h1>
          <p className="mt-1 text-[14px] text-text-secondary">Explore project brains or create your own.</p>
        </div>

        <BrainsPageClient initialDemos={demos} initialUserBrains={userBrains} />
      </main>
    </div>
  )
}
