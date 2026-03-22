import { NextResponse } from 'next/server'
import { listBrains, getDemoBrainPath, DEMO_BRAIN, scanBrainFiles } from '@/lib/local-data'
import { buildDepartmentColorMap } from '@/components/brain/department-colors'

export async function GET() {
  const userBrains = listBrains()
  const demoBrainPath = getDemoBrainPath()

  // Build demo brain card data
  const demoFiles = scanBrainFiles(demoBrainPath)
  const rootFolders = new Set(demoFiles.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0]))
  const colorMap = buildDepartmentColorMap(demoFiles)
  const rootFolderColors = Array.from(rootFolders).sort().map((f) => colorMap.get(f) ?? '#64748B')

  const demo = {
    ...DEMO_BRAIN,
    path: demoBrainPath,
    fileCount: demoFiles.length,
    departmentCount: rootFolders.size,
    agentCount: demoFiles.filter((f) => f.path.startsWith('.claude/agents/')).length,
    rootFolderColors,
    is_demo: true,
  }

  // Enrich user brains
  const enriched = userBrains.map((brain) => {
    const files = scanBrainFiles(brain.path)
    const folders = new Set(files.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0]))
    const cMap = buildDepartmentColorMap(files)
    return {
      ...brain,
      fileCount: files.length,
      departmentCount: folders.size,
      agentCount: files.filter((f) => f.path.startsWith('.claude/agents/')).length,
      rootFolderColors: Array.from(folders).sort().map((f) => cMap.get(f) ?? '#64748B'),
      is_demo: false,
    }
  })

  return NextResponse.json({ demos: [demo], userBrains: enriched })
}
