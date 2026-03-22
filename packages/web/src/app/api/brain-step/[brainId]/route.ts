import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { getBrain, scanBrainFiles } from '@/lib/local-data'
import { isExecutionPlanFile } from '@/lib/execution-plan-parser'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brainId: string }> }
) {
  const { brainId } = await params
  const body = await request.json()
  const { stepId, status } = body as { stepId: string; status: string }

  if (!stepId || !status) {
    return NextResponse.json({ error: 'Missing stepId or status' }, { status: 400 })
  }

  let brainPath: string
  if (brainId === 'demo') {
    // Demo brain is read-only
    return NextResponse.json({ error: 'Demo brain is read-only' }, { status: 403 })
  } else {
    const brain = getBrain(brainId)
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 })
    }
    brainPath = brain.path
  }

  // Find the execution plan file
  const files = scanBrainFiles(brainPath)
  const execFile = files.find((f) => isExecutionPlanFile(f.path))
  if (!execFile) {
    return NextResponse.json({ error: 'No execution plan found' }, { status: 404 })
  }

  const fullPath = path.join(brainPath, execFile.path)
  try {
    let content = fs.readFileSync(fullPath, 'utf8')

    // Parse step index from stepId (format: "step-N")
    const stepIndex = parseInt(stepId.replace('step-', ''), 10)
    if (isNaN(stepIndex)) {
      return NextResponse.json({ error: 'Invalid stepId' }, { status: 400 })
    }

    // Update the status in the markdown
    // This is a best-effort approach: find status markers and update them
    const statusMap: Record<string, string> = {
      completed: 'COMPLETED',
      in_progress: 'IN PROGRESS',
      not_started: 'NOT STARTED',
      blocked: 'BLOCKED',
    }

    const newStatusText = statusMap[status] ?? status.toUpperCase()

    // For table format, update the status column
    const lines = content.split('\n')
    let stepCount = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Check for table rows with step numbers
      if (line.trim().startsWith('|') && !line.trim().match(/^\|[\s\-|]+\|$/) && !/step/i.test(line)) {
        const cells = line.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2 && /^\d/.test(cells[0])) {
          stepCount++
          if (stepCount === stepIndex) {
            // Replace the status cell (typically the last cell)
            const statusCellIdx = cells.length - 1
            cells[statusCellIdx] = newStatusText.toLowerCase().replace(/\s+/g, '_')
            lines[i] = '| ' + cells.join(' | ') + ' |'
            break
          }
        }
      }

      // Also handle header format: "- **Status**: ..."
      const statusMatch = line.match(/^(\s*-\s+\*\*Status\*\*:\s*)(.+)/i)
      if (statusMatch) {
        stepCount++
        if (stepCount === stepIndex) {
          lines[i] = statusMatch[1] + newStatusText
          break
        }
      }
    }

    content = lines.join('\n')
    fs.writeFileSync(fullPath, content, 'utf8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update step'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
