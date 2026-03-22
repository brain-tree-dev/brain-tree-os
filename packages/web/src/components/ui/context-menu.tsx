'use client';

import React, { forwardRef } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onAction: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  function ContextMenu({ items, position, onClose }, ref) {
    return (
      <div
        ref={ref}
        className="fixed z-[9999] min-w-[180px] select-none rounded-lg border border-border bg-bg py-1 font-sans text-[13px] text-text shadow-lg"
        style={{ left: position.x, top: position.y }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item) => (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onAction();
                onClose();
              }
            }}
            className={`flex w-full items-center gap-2.5 px-3.5 py-[7px] text-left text-[13px] leading-5 transition-colors ${
              item.disabled
                ? 'cursor-default text-text-muted opacity-50'
                : 'cursor-pointer text-text hover:bg-text/[0.06]'
            }`}
          >
            {item.icon && (
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center ${
                item.disabled ? 'text-text-muted' : 'text-text-secondary'
              }`}>
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  }
);
