'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ContextMenuState<T> {
  isOpen: boolean;
  position: { x: number; y: number };
  adjustedPosition: { x: number; y: number };
  context: T | null;
}

const MENU_WIDTH_ESTIMATE = 200;
const MENU_HEIGHT_ITEM = 36;
const VIEWPORT_PADDING = 8;

export function useContextMenu<T>() {
  const [state, setState] = useState<ContextMenuState<T>>({
    isOpen: false,
    position: { x: 0, y: 0 },
    adjustedPosition: { x: 0, y: 0 },
    context: null,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const open = useCallback((event: MouseEvent | React.MouseEvent, context: T, itemCount = 3) => {
    event.preventDefault();
    event.stopPropagation();

    const x = event.clientX;
    const y = event.clientY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const estimatedHeight = itemCount * MENU_HEIGHT_ITEM + 16;

    const adjustedX = x + MENU_WIDTH_ESTIMATE + VIEWPORT_PADDING > vw
      ? x - MENU_WIDTH_ESTIMATE
      : x;
    const adjustedY = y + estimatedHeight + VIEWPORT_PADDING > vh
      ? y - estimatedHeight
      : y;

    setState({
      isOpen: true,
      position: { x, y },
      adjustedPosition: { x: adjustedX, y: adjustedY },
      context,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, context: null }));
  }, []);

  // Refine position after menu renders and we know its actual size
  useEffect(() => {
    if (!state.isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { x, y } = state.position;
    if (x + rect.width + VIEWPORT_PADDING > vw) x = x - rect.width;
    if (y + rect.height + VIEWPORT_PADDING > vh) y = y - rect.height;
    if (x < VIEWPORT_PADDING) x = VIEWPORT_PADDING;
    if (y < VIEWPORT_PADDING) y = VIEWPORT_PADDING;

    if (x !== state.adjustedPosition.x || y !== state.adjustedPosition.y) {
      setState((prev) => ({ ...prev, adjustedPosition: { x, y } }));
    }
  }, [state.isOpen, state.position, state.adjustedPosition.x, state.adjustedPosition.y]);

  // Close on Escape
  useEffect(() => {
    if (!state.isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.isOpen, close]);

  // Close on click outside
  useEffect(() => {
    if (!state.isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    window.addEventListener('mousedown', onClick, true);
    return () => window.removeEventListener('mousedown', onClick, true);
  }, [state.isOpen, close]);

  return { state, menuRef, open, close };
}
