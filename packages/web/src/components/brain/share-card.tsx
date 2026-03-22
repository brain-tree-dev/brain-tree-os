'use client';

import { forwardRef, useMemo } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceRadial,
  forceX,
  forceY,
} from 'd3-force';
import { scaleSqrt } from 'd3-scale';
import { max } from 'd3-array';
import { buildDepartmentColorMap } from './department-colors';

interface ShareCardProps {
  brainName: string;
  brainDescription: string;
  fileCount: number;
  departmentCount: number;
  linkCount: number;
  files: { id: string; path: string }[];
  links: { source_file_id: string; target_path: string }[];
  logoBase64: string | null;
}

interface SimNode {
  id: string;
  name: string;
  dept: string;
  color: string;
  linkCount: number;
  x?: number;
  y?: number;
  index?: number;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
}

function getDisplayName(path: string): string {
  const name = path.split('/').pop()?.replace(/\.md$/, '') ?? path;
  return name.length > 18 ? name.slice(0, 16) + '..' : name;
}

/** Escape text for use inside SVG XML */
function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard(
    {
      brainName,
      brainDescription,
      fileCount,
      departmentCount,
      linkCount,
      files,
      links,
      logoBase64,
    },
    ref
  ) {
    const graphSvgDataUrl = useMemo(() => {
      const colorMap = buildDepartmentColorMap(files);
      const fileIdSet = new Set(files.map((f) => f.id));

      // Build path -> id map with multiple lookup keys (matching graph-view.tsx)
      const pathToId = new Map<string, string>();
      for (const f of files) {
        pathToId.set(f.path, f.id);
        const noExt = f.path.replace(/\.md$/, '');
        if (!pathToId.has(noExt)) pathToId.set(noExt, f.id);
        const name = getDisplayName(f.path);
        if (!pathToId.has(name)) pathToId.set(name, f.id);
      }

      // Count connections per node and save original IDs before d3 mutates them
      const connectionCount = new Map<string, number>();
      const simLinks: SimLink[] = [];
      const linkSourceTargetIds: { sourceId: string; targetId: string }[] = [];
      for (const l of links) {
        const targetId =
          pathToId.get(l.target_path) ??
          pathToId.get(l.target_path.replace(/\.md$/, '')) ??
          pathToId.get(getDisplayName(l.target_path));
        if (targetId && fileIdSet.has(l.source_file_id)) {
          simLinks.push({ source: l.source_file_id, target: targetId });
          linkSourceTargetIds.push({ sourceId: l.source_file_id, targetId });
          connectionCount.set(l.source_file_id, (connectionCount.get(l.source_file_id) ?? 0) + 1);
          connectionCount.set(targetId, (connectionCount.get(targetId) ?? 0) + 1);
        }
      }

      const simNodes: SimNode[] = files.map((f) => {
        const root = f.path.split('/')[0];
        return {
          id: f.id,
          name: getDisplayName(f.path),
          dept: root,
          color: colorMap.get(root) ?? '#A1A09A',
          linkCount: connectionCount.get(f.id) ?? 0,
        };
      });

      const maxLinks = max(simNodes, (n) => n.linkCount) ?? 1;
      const rScale = scaleSqrt().domain([0, maxLinks]).range([5, 18]);

      // Department angular grouping (matching real graph "tidy brain" mode)
      const depts = Array.from(new Set(simNodes.map((n) => n.dept)));
      const deptAngle = new Map<string, number>();
      depts.forEach((d, i) => deptAngle.set(d, (i / depts.length) * Math.PI * 2));

      // Force simulation: spread out, clustered by connections
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sim = forceSimulation<SimNode>(simNodes as any)
        .force(
          'link',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forceLink<SimNode, SimLink>(simLinks as any)
            .id((d) => (d as SimNode).id)
            .distance(50)
            .strength(1.2)
        )
        .force('charge', forceManyBody().strength(-160))
        .force('radial', forceRadial<SimNode>(
          (d) => {
            const ratio = 1 - ((d as SimNode).linkCount / maxLinks);
            return 40 + ratio * 220;
          },
          0, 0
        ).strength(0.3))
        .force('x', forceX<SimNode>((d) => {
          const angle = deptAngle.get((d as SimNode).dept) ?? 0;
          const ratio = 1 - ((d as SimNode).linkCount / maxLinks);
          const r = 40 + ratio * 220;
          return Math.cos(angle) * r * 0.5;
        }).strength(0.15))
        .force('y', forceY<SimNode>((d) => {
          const angle = deptAngle.get((d as SimNode).dept) ?? 0;
          const ratio = 1 - ((d as SimNode).linkCount / maxLinks);
          const r = 40 + ratio * 220;
          return Math.sin(angle) * r * 0.3;
        }).strength(0.15))
        .force('collide', forceCollide<SimNode>((d) => rScale((d as SimNode).linkCount) + 8))
        .stop();

      for (let i = 0; i < 300; i++) sim.tick();

      const typedNodes = simNodes as (SimNode & { x: number; y: number })[];

      // Build edges from saved IDs
      const nodeById = new Map(typedNodes.map((n) => [n.id, n]));
      const resolvedEdges: { sx: number; sy: number; tx: number; ty: number }[] = [];
      for (const { sourceId, targetId } of linkSourceTargetIds) {
        const s = nodeById.get(sourceId);
        const t = nodeById.get(targetId);
        if (s && t && s.x != null && t.x != null) {
          resolvedEdges.push({ sx: s.x, sy: s.y, tx: t.x, ty: t.y });
        }
      }

      // Auto-fit viewBox centered on node CIRCLES (not labels)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of typedNodes) {
        const r = rScale(n.linkCount);
        minX = Math.min(minX, n.x - r);
        maxX = Math.max(maxX, n.x + r);
        minY = Math.min(minY, n.y - r);
        maxY = Math.max(maxY, n.y + r);
      }
      // Generous padding (includes room for labels on right side)
      const padH = 80; // horizontal pad (extra for labels)
      const padV = 40; // vertical pad
      const rawW = maxX - minX + padH * 2;
      const rawH = maxY - minY + padV * 2;
      // Target aspect ratio matches the card's graph area (~1120x480 = 2.33:1)
      const targetAR = 1120 / 480;
      let vbW = Math.max(rawW, 100);
      let vbH = Math.max(rawH, 60);
      if (vbW / vbH < targetAR) {
        vbW = vbH * targetAR;
      } else {
        vbH = vbW / targetAR;
      }
      // Center on node cluster center (not label-extended bounding box)
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const vbX = cx - vbW / 2;
      const vbY = cy - vbH / 2;
      const vb = `${vbX} ${vbY} ${vbW} ${vbH}`;

      // Build standalone SVG string (html-to-image can't capture nested SVG elements,
      // but handles <img> with SVG data URLs perfectly)
      const edgesSvg = resolvedEdges
        .map((e) => {
          const dx = e.tx - e.sx, dy = e.ty - e.sy;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
          return `<path d="M${e.sx},${e.sy}A${dr},${dr} 0 0,1 ${e.tx},${e.ty}" fill="none" stroke="#C5C4BC" stroke-opacity="0.5" stroke-width="1"/>`;
        })
        .join('');

      const nodesSvg = typedNodes
        .map((n) => {
          const r = rScale(n.linkCount);
          return [
            `<circle cx="${n.x}" cy="${n.y}" r="${r + 3}" fill="${n.color}" opacity="0.15"/>`,
            `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${n.color}" stroke="#fff" stroke-width="1.5" opacity="0.92"/>`,
            `<text x="${n.x}" y="${n.y}" dx="${r + 5}" dy="3" fill="#5A5950" font-size="10" font-weight="500" font-family="Inter, -apple-system, sans-serif">${escXml(n.name)}</text>`,
          ].join('');
        })
        .join('');

      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" width="1120" height="480">${edgesSvg}${nodesSvg}</svg>`;

      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
    }, [files, links]);

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 630,
          background: '#F2F1EA',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header bar: logo + brain name + stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 40px 16px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt=""
                style={{ height: 32, width: 32, borderRadius: 8 }}
              />
            ) : (
              <div
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 8,
                  background: '#5B9A65',
                }}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#2B2A25',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {brainName}
              </div>
              {brainDescription && (
                <div
                  style={{
                    fontSize: 14,
                    color: '#6B6A63',
                    marginTop: 2,
                    maxWidth: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {brainDescription}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 14,
              color: '#6B6A63',
              fontWeight: 500,
            }}
          >
            <span>{fileCount} files</span>
            <span>{departmentCount} folders</span>
            <span>{linkCount} links</span>
          </div>
        </div>

        {/* Graph area — rendered as img with SVG data URL for html-to-image compatibility */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={graphSvgDataUrl}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Bottom banner */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#5B9A65',
            padding: '10px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logoBase64 && (
              <img
                src={logoBase64}
                alt=""
                style={{ height: 18, width: 18, borderRadius: 4 }}
              />
            )}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              brain-tree.ai
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
            }}
          >
            Built with Braintree
          </span>
        </div>
      </div>
    );
  }
);
