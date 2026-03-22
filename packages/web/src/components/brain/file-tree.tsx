'use client';

import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from 'lucide-react';

import { buildDepartmentColorMap } from './department-colors';

interface FileEntry {
  id: string;
  path: string;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  fileId: string | null;
}

function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      let existing = current.find((n) => n.name === part);
      if (!existing) {
        existing = { name: part, path: currentPath, children: [], fileId: isFile ? file.id : null };
        current.push(existing);
      }
      if (!isFile) current = existing.children;
    }
  }
  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      const aIsFolder = a.children.length > 0 || a.fileId === null;
      const bIsFolder = b.children.length > 0 || b.fileId === null;
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children.length > 0) sortNodes(node.children);
    }
  }
  sortNodes(root);
  return root;
}

function TreeNodeItem({
  node, depth, selectedFileId, onSelectFile, colorMap,
}: {
  node: TreeNode; depth: number; selectedFileId: string | null;
  onSelectFile: (fileId: string, path: string) => void;
  colorMap: Map<string, string>;
}) {
  const isFolder = node.children.length > 0 || node.fileId === null;
  const [expanded, setExpanded] = useState(depth === 0);
  const isSelected = node.fileId !== null && node.fileId === selectedFileId;
  const color = depth === 0 ? (colorMap.get(node.name) ?? null) : null;

  if (isFolder) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors duration-150 hover:bg-text/5"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />}
          {color && <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
          {expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-text-secondary" /> : <Folder className="h-4 w-4 shrink-0 text-text-secondary" />}
          <span className="truncate font-medium text-text-secondary">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <TreeNodeItem key={child.path} node={child} depth={depth + 1} selectedFileId={selectedFileId} onSelectFile={onSelectFile} colorMap={colorMap} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.fileId && onSelectFile(node.fileId, node.path)}
      className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors duration-150 ${isSelected ? 'bg-leaf/10 text-leaf' : 'text-text-secondary hover:bg-text/5'}`}
      style={{ paddingLeft: `${depth * 12 + 6}px` }}
    >
      <span className="w-3.5 shrink-0" />
      <File className={`h-4 w-4 shrink-0 ${isSelected ? 'text-leaf' : 'text-text-muted'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface FileTreeProps {
  files: FileEntry[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string, path: string) => void;
}

export function FileTree({ files, selectedFileId, onSelectFile }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);
  const colorMap = useMemo(() => buildDepartmentColorMap(files), [files]);

  return (
    <nav className="flex flex-col gap-0.5 overflow-y-auto py-2 px-1">
      {tree.map((node) => (
        <TreeNodeItem key={node.path} node={node} depth={0} selectedFileId={selectedFileId} onSelectFile={onSelectFile} colorMap={colorMap} />
      ))}
    </nav>
  );
}
