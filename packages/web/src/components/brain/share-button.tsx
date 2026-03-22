'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Copy, Download, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ShareCard } from './share-card';

interface ShareButtonProps {
  brainName: string;
  brainDescription: string;
  fileCount: number;
  departmentCount: number;
  linkCount: number;
  files: { id: string; path: string }[];
  links: { source_file_id: string; target_path: string }[];
}

export function ShareButton({
  brainName,
  brainDescription,
  fileCount,
  departmentCount,
  linkCount,
  files,
  links,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'downloading'>('idle');
  const cardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-fetch logo as base64
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setLogoBase64(canvas.toDataURL('image/png'));
      }
    };
    img.src = '/logo.png';
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const capture = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      width: 1200,
      height: 630,
      pixelRatio: 2,
    });
  }, []);

  const handleCopy = useCallback(async () => {
    setStatus('copying');
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setStatus('copied');
      setTimeout(() => {
        setStatus('idle');
        setOpen(false);
      }, 1500);
    } catch {
      setStatus('idle');
    }
  }, [capture]);

  const handleDownload = useCallback(async () => {
    setStatus('downloading');
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${brainName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-brain.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus('idle');
      setOpen(false);
    } catch {
      setStatus('idle');
    }
  }, [capture, brainName]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-bg/90 px-2.5 py-1 shadow-sm backdrop-blur-sm transition-colors hover:bg-text/5"
      >
        <Share2 className="h-3 w-3 text-text-muted" />
        <span className="text-[10px] font-medium text-text-muted">Share</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-bg shadow-lg"
          style={{ animation: 'fade-up 0.15s ease-out' }}
        >
          <button
            onClick={handleCopy}
            disabled={status === 'copying'}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-text-secondary transition-colors hover:bg-text/5 disabled:opacity-50"
          >
            {status === 'copied' ? (
              <Check className="h-3.5 w-3.5 text-[#5B9A65]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {status === 'copied' ? 'Copied!' : status === 'copying' ? 'Copying...' : 'Copy image'}
          </button>
          <button
            onClick={handleDownload}
            disabled={status === 'downloading'}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-text-secondary transition-colors hover:bg-text/5 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {status === 'downloading' ? 'Saving...' : 'Download PNG'}
          </button>
        </div>
      )}

      {/* Off-screen share card for capture */}
      <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }}>
        <ShareCard
          ref={cardRef}
          brainName={brainName}
          brainDescription={brainDescription}
          fileCount={fileCount}
          departmentCount={departmentCount}
          linkCount={linkCount}
          files={files}
          links={links}
          logoBase64={logoBase64}
        />
      </div>
    </div>
  );
}
