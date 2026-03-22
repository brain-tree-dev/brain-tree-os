'use client';

import { useRef, useEffect, useMemo } from 'react';
import { X, FileText, Network } from 'lucide-react';
import { useContextMenu } from '@/hooks/use-context-menu';
import { ContextMenu, type ContextMenuItem } from '@/components/ui/context-menu';

export interface Tab {
  id: string;
  label: string;
  path?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOthers?: (tabId: string) => void;
  onCloseToRight?: (tabId: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOthers,
  onCloseToRight,
}: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxMenu = useContextMenu<{ tabId: string; tabIndex: number }>();

  // Auto-scroll to active tab
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);

  const contextMenuItems = useMemo((): ContextMenuItem[] => {
    const ctx = ctxMenu.state.context;
    if (!ctx) return [];
    const { tabId, tabIndex } = ctx;
    const isGraph = tabId === 'graph';

    // Count closable tabs to the right (excluding graph)
    const tabsToRight = tabs.slice(tabIndex + 1).filter((t) => t.id !== 'graph');
    // Count closable other tabs (excluding graph and this tab)
    const otherTabs = tabs.filter((t) => t.id !== 'graph' && t.id !== tabId);

    return [
      {
        id: 'close',
        label: 'Close',
        disabled: isGraph,
        onAction: () => onCloseTab(tabId),
      },
      {
        id: 'close-others',
        label: 'Close Others',
        disabled: otherTabs.length === 0,
        onAction: () => onCloseOthers?.(tabId),
      },
      {
        id: 'close-to-right',
        label: 'Close to the Right',
        disabled: tabsToRight.length === 0,
        onAction: () => onCloseToRight?.(tabId),
      },
    ];
  }, [ctxMenu.state.context, tabs, onCloseTab, onCloseOthers, onCloseToRight]);

  return (
    <div
      ref={scrollRef}
      className="flex shrink-0 items-stretch overflow-x-auto border-b border-border bg-bg/60"
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        const isGraph = tab.id === 'graph';

        return (
          <button
            key={tab.id}
            data-active={isActive}
            onClick={() => onSelectTab(tab.id)}
            onContextMenu={(e) => {
              ctxMenu.open(e, { tabId: tab.id, tabIndex: index }, 3);
            }}
            className={`group flex items-center gap-1.5 border-r border-border px-3 py-1.5 text-[12px] transition-colors duration-150 ${
              isActive
                ? 'border-b-2 border-b-leaf bg-bg/80 text-text'
                : 'border-b-2 border-b-transparent text-text-muted hover:bg-text/5 hover:text-text-secondary'
            }`}
          >
            {isGraph ? (
              <Network className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="max-w-[120px] truncate whitespace-nowrap">
              {tab.label}
            </span>
            {!isGraph && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-0.5 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-text/10"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}

      {ctxMenu.state.isOpen && (
        <ContextMenu
          ref={ctxMenu.menuRef}
          items={contextMenuItems}
          position={ctxMenu.state.adjustedPosition}
          onClose={ctxMenu.close}
        />
      )}
    </div>
  );
}
