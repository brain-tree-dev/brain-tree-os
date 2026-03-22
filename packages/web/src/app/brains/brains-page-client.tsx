'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useBrainsList } from '@/hooks/use-brains-list'

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

interface BrainsPageClientProps {
  initialDemos: BrainCardData[]
  initialUserBrains: BrainCardData[]
}

function BrainCard({ brain }: { brain: BrainCardData }) {
  return (
    <Link
      href={`/brains/${brain.id}`}
      className="glass group flex flex-col rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-text/15"
    >
      <div className="mb-4 flex items-start justify-between">
        {brain.is_demo ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
            <Image src="/clsh-dev-logo.png" alt="clsh.dev" width={40} height={40} className="object-contain" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/10">
            <svg className="h-5 w-5 text-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        )}
        {brain.is_demo && (
          <span className="rounded-full bg-leaf/10 px-2.5 py-0.5 text-[11px] font-medium text-leaf">Demo</span>
        )}
      </div>
      <h3 className="mb-1 text-[15px] font-semibold tracking-tight group-hover:text-leaf transition-colors duration-200">{brain.name}</h3>
      {brain.description && (
        <p className="mb-3 line-clamp-4 text-[13px] leading-relaxed text-text-secondary">{brain.description}</p>
      )}
      <div className="mt-auto">
        {brain.rootFolderColors.length > 0 && (
          <div className="mb-3 flex items-center gap-1">
            {brain.rootFolderColors.map((color, i) => (
              <span key={i} className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          {brain.fileCount} files
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          {brain.departmentCount} folders
        </span>
        {brain.agentCount > 0 && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {brain.agentCount} agents
          </span>
        )}
      </div>
    </Link>
  )
}

function CreateBrainCard() {
  return (
    <div className="glass group flex flex-col items-center justify-center rounded-2xl border-dashed p-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-text/5">
        <svg className="h-6 w-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span className="text-[14px] font-medium text-text-secondary">Create your own</span>
      <span className="mt-1 text-center text-[12px] text-text-muted">
        Run <code className="rounded bg-bg-card px-1 font-mono text-[11px]">/init-braintree</code> in Claude Code
      </span>
    </div>
  )
}

export default function BrainsPageClient({ initialDemos, initialUserBrains }: BrainsPageClientProps) {
  const { demos, userBrains } = useBrainsList({
    demos: initialDemos,
    userBrains: initialUserBrains,
  })

  return (
    <>
      <div className="animate-fade-up animate-delay-2 grid auto-rows-[1fr] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((brain) => <BrainCard key={brain.id} brain={brain} />)}
        {userBrains.map((brain) => <BrainCard key={brain.id} brain={brain} />)}
        <CreateBrainCard />
      </div>

      {userBrains.length === 0 && demos.length > 0 && (
        <p className="animate-fade-up animate-delay-3 mt-6 text-center text-[13px] text-text-muted">
          Click the demo brain to explore, or create your own to get started.
        </p>
      )}
    </>
  )
}
