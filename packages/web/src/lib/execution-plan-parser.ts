/**
 * Parse Execution-Plan.md markdown into structured steps.
 * Handles both table format (| Step | Title | Status |) and
 * header format (#### Step 1.1: Title).
 */

export interface ParsedStep {
  phase: number
  stepNumber: string
  title: string
  status: string
  tasks: Array<{ done: boolean; text: string }>
}

export function parseExecutionPlan(content: string): ParsedStep[] {
  const steps: ParsedStep[] = []
  let currentPhase = 0
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Detect phase headers: "## Phase 1: ..." or "# Phase 1: ..."
    const phaseMatch = line.match(/^#{1,3}\s+Phase\s+(\d+)\s*[:-]/i)
    if (phaseMatch) {
      currentPhase = parseInt(phaseMatch[1], 10)
      i++

      // Check if next lines contain a markdown table with steps
      while (i < lines.length) {
        const tl = lines[i].trim()
        if (tl === '') {
          i++
          continue
        }
        // Check for table header row with Step/Title columns
        if (tl.startsWith('|') && /step/i.test(tl) && /title/i.test(tl)) {
          const headers = tl
            .split('|')
            .map((h) => h.trim().toLowerCase())
            .filter(Boolean)
          const stepCol = headers.indexOf('step')
          const titleCol = headers.indexOf('title')
          const statusCol = headers.indexOf('status')

          // Skip separator row
          i++
          if (i < lines.length && lines[i].trim().match(/^\|[\s\-|]+\|$/)) {
            i++
          }

          // Parse data rows
          while (i < lines.length) {
            const row = lines[i].trim()
            if (!row.startsWith('|') || row.match(/^#{1,3}\s/)) break
            const cells = row
              .split('|')
              .map((c) => c.trim())
              .filter(Boolean)
            if (cells.length < Math.max(stepCol, titleCol) + 1) {
              i++
              continue
            }

            const stepNum = cells[stepCol]?.trim()
            const title = cells[titleCol]?.trim()
            const status =
              statusCol >= 0 && cells[statusCol]
                ? cells[statusCol].trim().toLowerCase().replace(/\s+/g, '_')
                : 'not_started'

            if (stepNum && title && /^\d/.test(stepNum)) {
              steps.push({
                phase: currentPhase,
                stepNumber: stepNum,
                title,
                status: ['completed', 'in_progress', 'not_started', 'blocked'].includes(status)
                  ? status
                  : 'not_started',
                tasks: [],
              })
            }
            i++
          }
          break
        }
        if (tl.match(/^#{2,5}\s/) || tl.match(/^#\s+Phase/i)) break
        i++
      }
      continue
    }

    // Detect step headers: "#### Step 1.1: Title"
    const stepMatch = line.match(/^#{2,5}\s+Step\s+([\d]+\.[\d]+[a-z]?):\s*(.+)/i)
    if (stepMatch) {
      const stepNumber = stepMatch[1]
      const title = stepMatch[2].trim()
      let status = 'not_started'
      const tasks: Array<{ done: boolean; text: string }> = []

      i++
      while (i < lines.length) {
        const subLine = lines[i]
        if (subLine.match(/^#{2,5}\s+Step/) || subLine.match(/^#{1,3}\s+Phase/i)) break

        const statusMatch = subLine.match(/^-\s+\*\*Status\*\*:\s*(.+)/i)
        if (statusMatch) {
          const rawStatus = statusMatch[1].trim().toUpperCase()
          if (rawStatus.startsWith('COMPLETE')) status = 'completed'
          else if (rawStatus.startsWith('IN PROGRESS') || rawStatus.startsWith('IN_PROGRESS'))
            status = 'in_progress'
          else if (rawStatus.startsWith('BLOCKED')) status = 'blocked'
          else status = 'not_started'
          i++
          continue
        }

        const taskMatch = subLine.match(/^\s+-\s+\[(x| )\]\s+(.+)/)
        if (taskMatch) {
          tasks.push({ done: taskMatch[1] === 'x', text: taskMatch[2].trim() })
        }
        i++
      }

      steps.push({ phase: currentPhase, stepNumber, title, status, tasks })
      continue
    }

    i++
  }

  return steps
}

export function isExecutionPlanFile(path: string): boolean {
  const lower = path.toLowerCase()
  return lower.endsWith('execution-plan.md') || lower.endsWith('execution_plan.md')
}
