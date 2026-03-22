'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { FileTree } from './file-tree';
import TabBar, { type Tab } from './tab-bar';
import FileViewer from './file-viewer';
import RightPane from './right-pane';
import { ConnectionStatusIndicator } from './connection-status';
import { ShareButton } from './share-button';
import BrainLoader from './brain-loader';
import { useBrainRealtime } from '@/hooks/use-brain-realtime';

const GraphView = dynamic(() => import('./graph-view'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: '#F2F1EA' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-text/5" />
        <p className="text-[13px] text-text-muted">Loading graph...</p>
      </div>
    </div>
  ),
});

interface BrainFile { id: string; path: string; }
interface BrainLink { source_file_id: string; target_path: string; }
interface ExecutionStep {
  id: string; phase_number: number; step_number: number; title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  tasks_json: Array<{ done: boolean; text: string }> | null;
}
interface Handoff {
  id: string; session_number: number; date: string; created_at: string | null;
  duration_seconds: number | null; summary: string; file_path: string;
}

interface BrainLayoutProps {
  brainId: string; files: BrainFile[]; links: BrainLink[];
  executionSteps: ExecutionStep[]; handoffs: Handoff[];
  isDemo?: boolean; brainName?: string; brainDescription?: string;
}

const GRAPH_TAB: Tab = { id: 'graph', label: 'Graph View' };

export function BrainLayout({
  brainId, files: initialFiles, links: initialLinks,
  executionSteps: initialSteps, handoffs: initialHandoffs,
  isDemo = false, brainName = '', brainDescription = '',
}: BrainLayoutProps) {
  const initialData = useMemo(() => ({
    files: initialFiles, links: initialLinks,
    executionSteps: initialSteps, handoffs: initialHandoffs,
  }), [initialFiles, initialLinks, initialSteps, initialHandoffs]);

  const { files, links, executionSteps, handoffs, connectionStatus, isStreaming, optimisticUpdateStep } =
    useBrainRealtime(brainId, initialData);

  // Brain is "building" when it has very few files (init-braintree is running)
  const isBuilding = !isDemo && files.length > 0 && files.length < 5;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPaneOpen, setRightPaneOpen] = useState(false);
  const [rightPaneCollapsed, setRightPaneCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) setSidebarOpen(false);
  }, []);

  const [tabs, setTabs] = useState<Tab[]>([GRAPH_TAB]);
  const [activeTabId, setActiveTabId] = useState('graph');
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const handleToggleStep = useCallback(
    async (stepId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      optimisticUpdateStep(stepId, newStatus as 'not_started' | 'completed');
      try {
        const res = await fetch(`/api/brain-step/${brainId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, status: newStatus }),
        });
        if (!res.ok) {
          optimisticUpdateStep(stepId, currentStatus as ExecutionStep['status']);
        }
      } catch {
        optimisticUpdateStep(stepId, currentStatus as ExecutionStep['status']);
      }
    },
    [brainId, optimisticUpdateStep]
  );

  const pathToFile = new Map<string, BrainFile>();
  for (const f of files) {
    pathToFile.set(f.path, f);
    const noExt = f.path.replace(/\.md$/, '');
    if (!pathToFile.has(noExt)) pathToFile.set(noExt, f);
    const name = f.path.split('/').pop()?.replace(/\.md$/, '') ?? '';
    if (name && !pathToFile.has(name)) pathToFile.set(name, f);
  }

  function openFileTab(fileId: string, filePath: string) {
    const existing = tabs.find((t) => t.id === fileId);
    if (!existing) {
      const label = filePath.split('/').pop()?.replace(/\.md$/, '') ?? filePath;
      setTabs((prev) => [...prev, { id: fileId, label, path: filePath }]);
    }
    setActiveTabId(fileId);
    if (!fileContents.has(fileId)) loadFileContent(fileId, filePath);
  }

  async function loadFileContent(fileId: string, filePath: string) {
    setLoadingFile(fileId);
    try {
      const res = await fetch(`/api/brain-file/${brainId}?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const text = await res.text();
        setFileContents((prev) => new Map(prev).set(fileId, text));
      } else {
        setFileContents((prev) => new Map(prev).set(fileId, '*Unable to load file content.*'));
      }
    } catch {
      setFileContents((prev) => new Map(prev).set(fileId, '*Unable to load file content.*'));
    }
    setLoadingFile(null);
  }

  function handleCloseTab(tabId: string) {
    if (tabId === 'graph') return;
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTabId === tabId) setActiveTabId('graph');
  }

  function handleCloseOthers(tabId: string) {
    setTabs((prev) => prev.filter((t) => t.id === 'graph' || t.id === tabId));
    if (activeTabId !== tabId && activeTabId !== 'graph') setActiveTabId(tabId);
  }

  function handleCloseToRight(tabId: string) {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      if (idx === -1) return prev;
      return prev.slice(0, idx + 1);
    });
    const idx = tabs.findIndex((t) => t.id === tabId);
    const activeIdx = tabs.findIndex((t) => t.id === activeTabId);
    if (activeIdx > idx) setActiveTabId(tabId);
  }

  function handleWikilinkClick(targetPath: string) {
    const file = pathToFile.get(targetPath);
    if (file) openFileTab(file.id, file.path);
  }

  function handleSelectHandoff(fileId: string, filePath: string) {
    openFileTab(fileId, filePath);
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeFileContent = activeTabId !== 'graph' ? fileContents.get(activeTabId) : null;

  return (
    <div className="flex flex-1 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {rightPaneOpen && <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={() => setRightPaneOpen(false)} />}

      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'} fixed z-30 flex h-[calc(100vh-82px)] w-[250px] flex-col border-r border-border bg-bg/80 backdrop-blur-sm transition-transform duration-200 md:relative md:z-auto md:h-auto ${!sidebarOpen ? 'md:w-0 md:border-r-0' : ''}`}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[12px] font-medium uppercase tracking-wider text-text-muted">Files</span>
          <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-text-muted transition-colors hover:bg-text/5 hover:text-text-secondary">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-8">
          <FileTree files={files} selectedFileId={activeTabId !== 'graph' ? activeTabId : null} onSelectFile={(id, path) => { openFileTab(id, path); if (isMobile) setSidebarOpen(false); }} />
        </div>
      </aside>

      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="fixed left-2 top-[60px] z-20 rounded-md border border-border bg-bg/80 p-1.5 text-text-muted shadow-sm backdrop-blur-sm transition-colors hover:bg-text/5 hover:text-text-secondary md:relative md:left-0 md:top-0 md:mt-2 md:ml-2">
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <TabBar tabs={tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} onCloseTab={handleCloseTab} onCloseOthers={handleCloseOthers} onCloseToRight={handleCloseToRight} />

        {isDemo && (
          <div className="flex items-center gap-2 border-b border-[var(--color-leaf)]/20 bg-[var(--color-leaf)]/[0.08] px-3 py-2 sm:px-4 sm:py-2.5">
            <p className="flex-1 text-[12px] text-text-secondary sm:text-[13px]">
              <span className="mr-1.5 inline-block rounded bg-[var(--color-leaf)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-[11px]">Demo</span>{' '}
              This is a demo brain from the <span className="font-semibold text-[var(--color-leaf)]">clsh.dev</span> project.
            </p>
          </div>
        )}

        <div className="relative flex-1 overflow-y-auto">
          {activeTabId === 'graph' && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              {connectionStatus === 'connected' && !isStreaming && (
                <ShareButton brainName={brainName} brainDescription={brainDescription} fileCount={files.length}
                  departmentCount={new Set(files.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0])).size}
                  linkCount={links.length} files={files} links={links} />
              )}
              <ConnectionStatusIndicator status={connectionStatus} isStreaming={isStreaming} fileCount={isStreaming ? files.length : undefined} />
            </div>
          )}
          {activeTabId === 'graph' && isBuilding ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <BrainLoader />
              <p className="mt-2 text-[14px] font-medium text-text-secondary">Your brain is being built...</p>
              <p className="text-[12px] text-text-muted">{files.length} files created so far. Watching for changes.</p>
            </div>
          ) : activeTabId === 'graph' ? (
            <GraphView files={files} links={links} onSelectFile={openFileTab} />
          ) : loadingFile === activeTabId ? (
            <BrainLoader />
          ) : activeFileContent ? (
            <FileViewer content={activeFileContent} filePath={activeTab?.path ?? ''} onWikilinkClick={handleWikilinkClick} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-text-muted">Select a file to view</p>
            </div>
          )}
        </div>
      </main>

      <button onClick={() => setRightPaneOpen(!rightPaneOpen)} className="fixed bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-text/5 lg:hidden" title="Execution Plan">
        {rightPaneOpen ? <PanelRightClose className="h-4 w-4 text-leaf" /> : <PanelRightOpen className="h-4 w-4 text-text-muted" />}
      </button>

      <div className={`${rightPaneOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} fixed right-0 top-0 z-30 h-full transition-all duration-200 lg:relative lg:z-auto lg:h-auto ${rightPaneCollapsed ? 'lg:w-auto' : 'w-[280px]'}`}>
        <RightPane executionSteps={executionSteps} handoffs={handoffs} onToggleStep={handleToggleStep}
          onSelectHandoff={(id, path) => { handleSelectHandoff(id, path); setRightPaneOpen(false); }}
          collapsed={rightPaneCollapsed} onToggleCollapsed={() => setRightPaneCollapsed((c) => !c)} />
      </div>
    </div>
  );
}
