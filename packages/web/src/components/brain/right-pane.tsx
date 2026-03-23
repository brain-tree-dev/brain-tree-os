'use client';

import { useState, useMemo } from 'react';
import {
  ListChecks,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  PanelRightClose,
  PanelRightOpen,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';

interface ExecutionStep {
  id: string;
  phase_number: number;
  phase_title: string;
  step_number: number;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  tasks_json: Array<{ done: boolean; text: string }> | null;
}

interface Handoff {
  id: string;
  session_number: number;
  date: string;
  created_at: string | null;
  duration_seconds: number | null;
  summary: string;
  file_path: string;
}

interface RightPaneProps {
  executionSteps: ExecutionStep[];
  handoffs: Handoff[];
  onToggleStep?: (stepId: string, currentStatus: string) => void;
  onSelectHandoff?: (fileId: string, filePath: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const STATUS_BADGE: Record<
  ExecutionStep['status'],
  { label: string; bg: string }
> = {
  completed: { label: 'COMPLETE', bg: '#5B9A65' },
  in_progress: { label: 'IN PROGRESS', bg: '#E8A830' },
  not_started: { label: 'NOT STARTED', bg: '#9B9A92' },
  blocked: { label: 'BLOCKED', bg: '#D95B5B' },
};

interface PhaseGroup {
  phase: number;
  title: string;
  steps: ExecutionStep[];
  completedCount: number;
}

function groupByPhase(steps: ExecutionStep[]): PhaseGroup[] {
  const map = new Map<number, ExecutionStep[]>();
  for (const step of steps) {
    const list = map.get(step.phase_number) ?? [];
    list.push(step);
    map.set(step.phase_number, list);
  }

  const groups: PhaseGroup[] = [];
  for (const [phase, phaseSteps] of map) {
    phaseSteps.sort((a, b) => a.step_number - b.step_number);
    // Derive phase title from step data (all steps in a phase share the same phase_title)
    const phaseTitle = phaseSteps[0]?.phase_title || `Phase ${phase}`;
    groups.push({
      phase,
      title: phaseTitle,
      steps: phaseSteps,
      completedCount: phaseSteps.filter((s) => s.status === 'completed').length,
    });
  }
  groups.sort((a, b) => a.phase - b.phase);
  return groups;
}

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : (completed / total) * 100;
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-text/5">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: '#5B9A65' }}
      />
    </div>
  );
}

function StepRow({
  step,
  expanded,
  onToggleExpand,
  onToggleStep,
}: {
  step: ExecutionStep;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleStep?: (stepId: string, currentStatus: string) => void;
}) {
  const badge = STATUS_BADGE[step.status];
  const hasTasks =
    step.tasks_json !== null && step.tasks_json.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-text/5">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStep?.(step.id, step.status);
          }}
          className="shrink-0 text-text-muted transition-colors hover:text-leaf"
        >
          {step.status === 'completed' ? (
            <CheckSquare className="h-3.5 w-3.5 text-leaf" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Expandable row content */}
        <button
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          {hasTasks && (
            expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-text-muted" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-text-muted" />
            )
          )}
          {!hasTasks && <span className="w-3 shrink-0" />}
          <span className="shrink-0 text-[11px] text-text-muted">
            {step.phase_number}.{step.step_number}
          </span>
          <span className="min-w-0 truncate text-[12px] text-text-secondary">
            {step.title}
          </span>
        </button>

        {/* Status badge */}
        <span
          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold leading-none text-white"
          style={{ backgroundColor: badge.bg }}
        >
          {badge.label}
        </span>
      </div>

      {/* Sub-tasks */}
      {expanded && hasTasks && (
        <div className="ml-7 border-l border-border pb-1 pl-2">
          {step.tasks_json?.map((task, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 py-0.5"
            >
              {task.done ? (
                <CheckSquare className="mt-0.5 h-3 w-3 shrink-0 text-leaf" />
              ) : (
                <Square className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" />
              )}
              <span
                className={`text-[11px] leading-snug ${
                  task.done
                    ? 'text-text-muted line-through'
                    : 'text-text-secondary'
                }`}
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResumeBrainCta() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cmd = 'claude /resume-braintree';

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-2 mt-2 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-bg-section px-3 py-2.5 text-left transition-colors hover:bg-text/5"
      >
        <Terminal className="h-4 w-4 shrink-0 text-text-muted" />
        <span className="flex-1 text-[12px] font-semibold text-text">
          Continue with Claude
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="mt-1.5 rounded-xl border border-border bg-bg-section px-3 pb-3 pt-2.5">
          <p className="text-[11px] leading-relaxed text-text-secondary mb-2.5">
            Pick up where you left off. Run this in your terminal:
          </p>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#2B2A25] px-3 py-2.5">
            <code className="flex-1 text-[13px] font-mono text-[#E8E6E0]">
              <span className="text-[#27C93F]">$</span> {cmd}
            </code>
            <button
              onClick={handleCopy}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: copied ? '#5B9A65' : '#4A7FE5' }}
              title="Copy command"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-white" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionPlanView({
  phases,
  expandedSteps,
  onToggleExpand,
  onToggleStep,
}: {
  phases: PhaseGroup[];
  expandedSteps: Set<string>;
  onToggleExpand: (stepId: string) => void;
  onToggleStep?: (stepId: string, currentStatus: string) => void;
}) {
  if (phases.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-3 py-8">
        <p className="text-[12px] text-text-muted">No execution steps yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      {/* Resume brain CTA */}
      <ResumeBrainCta />

      {phases.map((group) => (
        <div key={group.phase}>
          {/* Phase header */}
          <div className="px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Phase {group.phase}: {group.title}
            </p>
            <ProgressBar
              completed={group.completedCount}
              total={group.steps.length}
            />
            <p className="mt-0.5 text-[10px] text-text-muted">
              {group.completedCount}/{group.steps.length} complete
            </p>
          </div>

          {/* Steps */}
          <div className="mt-1 flex flex-col gap-0.5">
            {group.steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                expanded={expandedSteps.has(step.id)}
                onToggleExpand={() => onToggleExpand(step.id)}
                onToggleStep={onToggleStep}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionLogView({
  handoffs,
  onSelectHandoff,
}: {
  handoffs: Handoff[];
  onSelectHandoff?: (fileId: string, filePath: string) => void;
}) {
  if (handoffs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-3 py-8">
        <p className="text-[12px] text-text-muted">No sessions yet</p>
      </div>
    );
  }

  const sorted = [...handoffs].sort(
    (a, b) => b.session_number - a.session_number
  );

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {sorted.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelectHandoff?.(h.id, h.file_path)}
          className="flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-text/5"
        >
          <div className="flex items-center gap-2">
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
              style={{ backgroundColor: '#5B9A65' }}
            >
              Session {h.session_number}
            </span>
            <span className="text-[10px] text-text-muted">
              {formatDateTime(h.created_at, h.date)}
            </span>
            {h.duration_seconds != null && (
              <span className="text-[10px] text-text-muted">
                {formatDuration(h.duration_seconds)}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
            {h.summary}
          </p>
        </button>
      ))}
    </div>
  );
}

function formatDateTime(createdAt: string | null, dateFallback: string): string {
  try {
    if (createdAt) {
      const d = new Date(createdAt);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    const d = new Date(dateFallback);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateFallback;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

type ViewMode = 'plan' | 'log';

export default function RightPane({
  executionSteps,
  handoffs,
  onToggleStep,
  onSelectHandoff,
  collapsed,
  onToggleCollapsed,
}: RightPaneProps) {
  const [activeView, setActiveView] = useState<ViewMode>('plan');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    new Set()
  );

  const phases = useMemo(
    () => groupByPhase(executionSteps),
    [executionSteps]
  );

  function toggleExpandStep(stepId: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  return (
    <aside
      className="flex h-full shrink-0 flex-col border-l border-border bg-bg/80 backdrop-blur-sm lg:bg-bg/50 lg:backdrop-blur-none"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-2">
        <button
          onClick={onToggleCollapsed}
          className="rounded p-1 text-text-muted transition-colors hover:bg-text/5 hover:text-text-secondary"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </button>
        {!collapsed && (
          <>
            <button
              onClick={() => setActiveView('plan')}
              className="rounded p-1 transition-colors hover:bg-text/5"
              title="Execution Plan"
            >
              <ListChecks
                className="h-4 w-4"
                style={{ color: activeView === 'plan' ? '#5B9A65' : '#9B9A92' }}
              />
            </button>
            <button
              onClick={() => setActiveView('log')}
              className="rounded p-1 transition-colors hover:bg-text/5"
              title="Session Log"
            >
              <Clock
                className="h-4 w-4"
                style={{ color: activeView === 'log' ? '#5B9A65' : '#9B9A92' }}
              />
            </button>
          </>
        )}
      </div>

      {/* Content area */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {activeView === 'plan' ? (
            <ExecutionPlanView
              phases={phases}
              expandedSteps={expandedSteps}
              onToggleExpand={toggleExpandStep}
              onToggleStep={onToggleStep}
            />
          ) : (
            <SessionLogView
              handoffs={handoffs}
              onSelectHandoff={onSelectHandoff}
            />
          )}
        </div>
      )}
    </aside>
  );
}
