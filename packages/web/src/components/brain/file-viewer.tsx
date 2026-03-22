'use client';

import { useMemo, useRef } from 'react';
import { Copy } from 'lucide-react';
import { useContextMenu } from '@/hooks/use-context-menu';
import { ContextMenu, type ContextMenuItem } from '@/components/ui/context-menu';

interface FileViewerProps {
  content: string;
  filePath: string;
  onWikilinkClick: (targetPath: string) => void;
}

interface Frontmatter {
  [key: string]: string | string[] | undefined;
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter | null; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: raw };

  const fm: Frontmatter = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    // Parse YAML arrays: [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim());
    } else {
      fm[key] = val;
    }
  }
  return { frontmatter: fm, body: match[2] };
}

function FrontmatterDisplay({ fm }: { fm: Frontmatter }) {
  const entries = Object.entries(fm);
  if (entries.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-border bg-text/[0.02] px-4 py-3">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-start gap-2 py-0.5">
          <span className="shrink-0 text-[11px] font-medium text-text-muted">
            {key}
          </span>
          <span className="text-[12px] text-text-secondary">
            {Array.isArray(val)
              ? val.map((v, i) => (
                  <span
                    key={i}
                    className="mr-1 inline-block rounded-full bg-leaf/10 px-2 py-0.5 text-[11px] text-leaf"
                  >
                    {v}
                  </span>
                ))
              : String(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Inline markdown: bold, italic, code, wikilinks
function renderInline(
  text: string,
  onWikilinkClick: (target: string) => void
): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Regex for: **bold**, *italic*, `code`, [[target|display]], [[target]]
  const re =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+?)`)|(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      tokens.push(
        <strong key={key++} className="font-semibold text-text">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic
      tokens.push(
        <em key={key++} className="italic">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Inline code
      tokens.push(
        <code
          key={key++}
          className="rounded bg-text/[0.06] px-1 py-0.5 font-mono text-[0.9em] text-text-secondary"
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // Wikilink
      const target = match[8];
      const display = match[9] || target;
      tokens.push(
        <button
          key={key++}
          onClick={() => onWikilinkClick(target)}
          className="text-leaf underline decoration-leaf/30 underline-offset-2 transition-colors hover:text-leaf-hover hover:decoration-leaf-hover/50"
        >
          {display}
        </button>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

interface MarkdownLine {
  type:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'hr'
    | 'blockquote'
    | 'ul'
    | 'ol'
    | 'checkbox'
    | 'code-start'
    | 'code-end'
    | 'table-row'
    | 'paragraph'
    | 'empty';
  content: string;
  indent?: number;
  checked?: boolean;
  lang?: string;
}

function classifyLine(line: string): MarkdownLine {
  // Empty line
  if (line.trim() === '') return { type: 'empty', content: '' };

  // Code fence (opening or closing)
  if (line.trim().startsWith('```')) {
    const lang = line.trim().slice(3).trim();
    return { type: 'code-start', content: '', lang: lang || undefined };
  }

  // Headings
  const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
  if (hMatch) {
    const level = hMatch[1].length;
    return {
      type: `h${level}` as MarkdownLine['type'],
      content: hMatch[2],
    };
  }

  // HR
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
    return { type: 'hr', content: '' };
  }

  // Blockquote
  if (line.trimStart().startsWith('> ')) {
    return { type: 'blockquote', content: line.trimStart().slice(2) };
  }

  // Checkbox
  const cbMatch = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.+)$/);
  if (cbMatch) {
    return {
      type: 'checkbox',
      content: cbMatch[3],
      indent: cbMatch[1].length,
      checked: cbMatch[2] !== ' ',
    };
  }

  // Unordered list
  const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
  if (ulMatch) {
    return {
      type: 'ul',
      content: ulMatch[2],
      indent: ulMatch[1].length,
    };
  }

  // Ordered list
  const olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
  if (olMatch) {
    return {
      type: 'ol',
      content: olMatch[2],
      indent: olMatch[1].length,
    };
  }

  // Table row
  if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
    return { type: 'table-row', content: line.trim() };
  }

  return { type: 'paragraph', content: line };
}

function MarkdownRenderer({
  body,
  onWikilinkClick,
}: {
  body: string;
  onWikilinkClick: (target: string) => void;
}) {
  const elements = useMemo(() => {
    const lines = body.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const classified = classifyLine(lines[i]);

      switch (classified.type) {
        case 'empty':
          i++;
          break;

        case 'h1':
          result.push(
            <h1
              key={key++}
              className="mb-3 mt-6 font-serif text-[24px] font-bold italic text-text first:mt-0"
            >
              {renderInline(classified.content, onWikilinkClick)}
            </h1>
          );
          i++;
          break;

        case 'h2':
          result.push(
            <h2
              key={key++}
              className="mb-2 mt-5 text-[18px] font-semibold text-text first:mt-0"
            >
              {renderInline(classified.content, onWikilinkClick)}
            </h2>
          );
          i++;
          break;

        case 'h3':
          result.push(
            <h3
              key={key++}
              className="mb-1.5 mt-4 text-[15px] font-semibold text-text first:mt-0"
            >
              {renderInline(classified.content, onWikilinkClick)}
            </h3>
          );
          i++;
          break;

        case 'h4':
        case 'h5':
        case 'h6':
          result.push(
            <h4
              key={key++}
              className="mb-1 mt-3 text-[14px] font-semibold text-text-secondary first:mt-0"
            >
              {renderInline(classified.content, onWikilinkClick)}
            </h4>
          );
          i++;
          break;

        case 'hr':
          result.push(
            <hr key={key++} className="my-4 border-border" />
          );
          i++;
          break;

        case 'blockquote': {
          const bqLines: string[] = [];
          while (i < lines.length) {
            const c = classifyLine(lines[i]);
            if (c.type !== 'blockquote') break;
            bqLines.push(c.content);
            i++;
          }
          result.push(
            <blockquote
              key={key++}
              className="my-2 border-l-2 border-leaf/40 pl-3 text-[13px] italic text-text-secondary"
            >
              {bqLines.map((line, j) => (
                <p key={j}>{renderInline(line, onWikilinkClick)}</p>
              ))}
            </blockquote>
          );
          break;
        }

        case 'code-start': {
          const codeLines: string[] = [];
          i++;
          while (i < lines.length) {
            if (lines[i].trim().startsWith('```')) {
              i++;
              break;
            }
            codeLines.push(lines[i]);
            i++;
          }
          result.push(
            <div key={key++} className="my-2 overflow-x-auto rounded-lg bg-[#2B2A25] px-4 py-3">
              {classified.lang && (
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-leaf/60">
                  {classified.lang}
                </span>
              )}
              <pre className="text-[12px] leading-relaxed text-[#F2F1EA]">
                <code>{codeLines.join('\n')}</code>
              </pre>
            </div>
          );
          break;
        }

        case 'checkbox':
        case 'ul': {
          const items: { content: string; indent: number; checked?: boolean; isCheckbox: boolean }[] = [];
          while (i < lines.length) {
            const c = classifyLine(lines[i]);
            if (c.type !== 'ul' && c.type !== 'checkbox') break;
            items.push({
              content: c.content,
              indent: c.indent ?? 0,
              checked: c.checked,
              isCheckbox: c.type === 'checkbox',
            });
            i++;
          }
          result.push(
            <ul key={key++} className="my-1.5 flex flex-col gap-0.5">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-1.5 text-[13px] text-text-secondary"
                  style={{ paddingLeft: `${Math.min(item.indent / 2, 3) * 12}px` }}
                >
                  {item.isCheckbox ? (
                    <span className="mt-0.5 shrink-0">
                      {item.checked ? (
                        <span className="text-leaf">&#9745;</span>
                      ) : (
                        <span className="text-text-muted">&#9744;</span>
                      )}
                    </span>
                  ) : (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                  )}
                  <span className={item.checked ? 'text-text-muted line-through' : ''}>
                    {renderInline(item.content, onWikilinkClick)}
                  </span>
                </li>
              ))}
            </ul>
          );
          break;
        }

        case 'ol': {
          const items: { content: string; indent: number }[] = [];
          while (i < lines.length) {
            const c = classifyLine(lines[i]);
            if (c.type !== 'ol') break;
            items.push({ content: c.content, indent: c.indent ?? 0 });
            i++;
          }
          result.push(
            <ol key={key++} className="my-1.5 flex flex-col gap-0.5">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-1.5 text-[13px] text-text-secondary"
                  style={{ paddingLeft: `${Math.min(item.indent / 2, 3) * 12}px` }}
                >
                  <span className="mt-0.5 shrink-0 text-[12px] text-text-muted">
                    {j + 1}.
                  </span>
                  <span>{renderInline(item.content, onWikilinkClick)}</span>
                </li>
              ))}
            </ol>
          );
          break;
        }

        case 'table-row': {
          const rows: string[][] = [];
          while (i < lines.length) {
            const c = classifyLine(lines[i]);
            if (c.type !== 'table-row') break;
            const cells = c.content
              .split('|')
              .slice(1, -1)
              .map((s) => s.trim());
            rows.push(cells);
            i++;
          }
          // Skip separator row (---|----|---)
          const headerRow = rows[0];
          const isSeparator = (row: string[]) =>
            row.every((c) => /^[-:]+$/.test(c));
          const dataRows = rows.filter((r, idx) => idx !== 0 && !isSeparator(r));
          const hasSeparator = rows.length > 1 && isSeparator(rows[1]);

          result.push(
            <div key={key++} className="my-2 overflow-x-auto">
              <table className="w-full text-[12px]">
                {hasSeparator && headerRow && (
                  <thead>
                    <tr className="border-b border-border">
                      {headerRow.map((cell, j) => (
                        <th
                          key={j}
                          className="px-2 py-1 text-left font-semibold text-text-secondary"
                        >
                          {renderInline(cell, onWikilinkClick)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {(hasSeparator ? dataRows : rows).map((row, j) => (
                    <tr key={j} className="border-b border-border/50">
                      {row.map((cell, k) => (
                        <td key={k} className="px-2 py-1 text-text-secondary">
                          {renderInline(cell, onWikilinkClick)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          break;
        }

        case 'paragraph':
        default: {
          // Collect consecutive paragraph lines
          const pLines: string[] = [];
          while (i < lines.length) {
            const c = classifyLine(lines[i]);
            if (c.type !== 'paragraph') break;
            pLines.push(c.content);
            i++;
          }
          result.push(
            <p key={key++} className="my-1.5 text-[13px] leading-relaxed text-text-secondary">
              {renderInline(pLines.join(' '), onWikilinkClick)}
            </p>
          );
          break;
        }
      }
    }

    return result;
  }, [body, onWikilinkClick]);

  return <>{elements}</>;
}

export default function FileViewer({
  content,
  filePath,
  onWikilinkClick,
}: FileViewerProps) {
  const { frontmatter, body } = useMemo(
    () => parseFrontmatter(content),
    [content]
  );

  const selectedTextRef = useRef('');
  const ctxMenu = useContextMenu<{ selectedText: string }>();

  const contextMenuItems = useMemo((): ContextMenuItem[] => {
    const sel = ctxMenu.state.context?.selectedText ?? '';
    return [
      {
        id: 'copy-selection',
        label: 'Copy selection',
        icon: <Copy size={14} />,
        disabled: sel.length === 0,
        onAction: () => {
          if (sel) navigator.clipboard.writeText(sel);
        },
      },
    ];
  }, [ctxMenu.state.context]);

  return (
    <div
      className="mx-auto w-full max-w-3xl px-6 pb-16 pt-6"
      onContextMenu={(e) => {
        const sel = window.getSelection();
        selectedTextRef.current = sel?.toString().trim() ?? '';
        ctxMenu.open(e, { selectedText: selectedTextRef.current }, 1);
      }}
    >
      <p className="mb-4 text-[11px] font-mono text-text-muted">{filePath}</p>
      {frontmatter && <FrontmatterDisplay fm={frontmatter} />}
      <div className="prose-sm">
        <MarkdownRenderer body={body} onWikilinkClick={onWikilinkClick} />
      </div>

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
