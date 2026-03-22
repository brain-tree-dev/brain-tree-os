'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { select } from 'd3-selection';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
  type Simulation,
} from 'd3-force';
import { zoom as d3Zoom, zoomIdentity, type ZoomTransform, type ZoomBehavior } from 'd3-zoom';
import { drag as d3Drag } from 'd3-drag';
import { scaleSqrt } from 'd3-scale';
import { max } from 'd3-array';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  FileText,
  ExternalLink,
  Link,
} from 'lucide-react';
import { useContextMenu } from '@/hooks/use-context-menu';
import { ContextMenu, type ContextMenuItem } from '@/components/ui/context-menu';

import { buildDepartmentColorMap } from './department-colors';

const DEFAULT_COLOR = '#A1A09A';

const MINIMAP_W = 150;
const MINIMAP_H = 110;
const MINIMAP_PAD = 12;

function getDepartment(path: string): string {
  return path.split('/')[0];
}

function getDisplayName(path: string): string {
  const name = path.split('/').pop() ?? path;
  return name.replace(/\.md$/, '');
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  path: string;
  name: string;
  color: string;
  dept: string;
  linkCount: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

type GraphContextTarget =
  | { type: 'node'; node: SimNode }
  | { type: 'canvas' };

interface GraphViewProps {
  files: Array<{ id: string; path: string }>;
  links: Array<{ source_file_id: string; target_path: string }>;
  onSelectFile: (fileId: string, filePath: string) => void;
  onOpenInNewTab?: (fileId: string, filePath: string) => void;
}

function ToolbarBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 hover:bg-black/[0.06] active:bg-black/[0.1]"
      style={active ? { backgroundColor: 'rgba(91,154,101,0.12)' } : undefined}
    >
      {children}
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{
          backgroundColor: '#2B2A25',
          color: '#FAFAF5',
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function GraphView({ files, links, onSelectFile, onOpenInNewTab }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const nodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const mainSizeRef = useRef({ w: 0, h: 0 });
  const radiusScaleRef = useRef<ReturnType<typeof scaleSqrt<number, number>> | null>(null);
  const [isTidy, setIsTidy] = useState(false);
  const isInitialBuildRef = useRef(true);
  const rebuildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSelectFileRef = useRef(onSelectFile);
  onSelectFileRef.current = onSelectFile;
  const onOpenInNewTabRef = useRef(onOpenInNewTab);
  onOpenInNewTabRef.current = onOpenInNewTab;

  const ctxMenu = useContextMenu<GraphContextTarget>();

  // ── Minimap ────────────────────────────────────────────────
  const drawMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = nodesRef.current;
    const simLinks = simLinksRef.current;
    const t = transformRef.current;
    const { w: mainW, h: mainH } = mainSizeRef.current;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINIMAP_W * dpr;
    canvas.height = MINIMAP_H * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.roundRect(0, 0, MINIMAP_W, MINIMAP_H, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(43,42,37,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, MINIMAP_W - 1, MINIMAP_H - 1, 8);
    ctx.stroke();

    if (nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const nx = n.x ?? 0;
      const ny = n.y ?? 0;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    }

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const innerW = MINIMAP_W - MINIMAP_PAD * 2;
    const innerH = MINIMAP_H - MINIMAP_PAD * 2;
    const sc = Math.min(innerW / rangeX, innerH / rangeY);
    const ox = MINIMAP_PAD + (innerW - rangeX * sc) / 2;
    const oy = MINIMAP_PAD + (innerH - rangeY * sc) / 2;

    const mapX = (x: number) => ox + (x - minX) * sc;
    const mapY = (y: number) => oy + (y - minY) * sc;

    ctx.strokeStyle = 'rgba(180,178,170,0.35)';
    ctx.lineWidth = 0.5;
    for (const l of simLinks) {
      const s = l.source as SimNode;
      const tg = l.target as SimNode;
      ctx.beginPath();
      ctx.moveTo(mapX(s.x ?? 0), mapY(s.y ?? 0));
      ctx.lineTo(mapX(tg.x ?? 0), mapY(tg.y ?? 0));
      ctx.stroke();
    }

    for (const n of nodes) {
      const cx = mapX(n.x ?? 0);
      const cy = mapY(n.y ?? 0);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, n.linkCount * 0.4 + 1.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (mainW > 0 && mainH > 0) {
      const vLeft = -t.x / t.k;
      const vTop = -t.y / t.k;
      const vRight = (mainW - t.x) / t.k;
      const vBottom = (mainH - t.y) / t.k;
      const rx = mapX(vLeft);
      const ry = mapY(vTop);
      const rw = (vRight - vLeft) * sc;
      const rh = (vBottom - vTop) * sc;
      ctx.strokeStyle = 'rgba(91,154,101,0.7)';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(91,154,101,0.06)';
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.fill();
      ctx.stroke();
    }
  }, []);

  // ── Build Graph ────────────────────────────────────────────
  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    // Save current node positions for smooth incremental updates
    const isUpdate = !isInitialBuildRef.current && !!simulationRef.current;
    const savedPositions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    if (isUpdate && simulationRef.current) {
      for (const n of simulationRef.current.nodes()) {
        savedPositions.set(n.id, { x: n.x ?? 0, y: n.y ?? 0, vx: n.vx ?? 0, vy: n.vy ?? 0 });
      }
    }
    simulationRef.current?.stop();

    mainSizeRef.current = { w: width, h: height };

    // Build path -> id map
    const pathToId = new Map<string, string>();
    for (const f of files) {
      pathToId.set(f.path, f.id);
      const noExt = f.path.replace(/\.md$/, '');
      if (!pathToId.has(noExt)) pathToId.set(noExt, f.id);
      const name = getDisplayName(f.path);
      if (!pathToId.has(name)) pathToId.set(name, f.id);
    }

    // Build unique color map for departments — shared with file-tree for consistency
    const deptColorMap = buildDepartmentColorMap(files);

    const linkCountMap = new Map<string, number>();
    const resolvedLinks: Array<{ sourceId: string; targetId: string }> = [];

    for (const link of links) {
      const targetId =
        pathToId.get(link.target_path) ??
        pathToId.get(link.target_path.replace(/\.md$/, '')) ??
        pathToId.get(getDisplayName(link.target_path));
      if (!targetId) continue;
      resolvedLinks.push({ sourceId: link.source_file_id, targetId });
      linkCountMap.set(link.source_file_id, (linkCountMap.get(link.source_file_id) ?? 0) + 1);
      linkCountMap.set(targetId, (linkCountMap.get(targetId) ?? 0) + 1);
    }

    const newNodeIds = new Set<string>();
    const nodes: SimNode[] = files.map((f) => {
      const saved = savedPositions.get(f.id);
      if (!saved && isUpdate) newNodeIds.add(f.id);
      const node: SimNode = {
        id: f.id,
        path: f.path,
        name: getDisplayName(f.path),
        color: deptColorMap.get(getDepartment(f.path)) ?? DEFAULT_COLOR,
        dept: getDepartment(f.path),
        linkCount: linkCountMap.get(f.id) ?? 0,
      };
      if (saved) {
        node.x = saved.x; node.y = saved.y;
        node.vx = saved.vx; node.vy = saved.vy;
      } else if (isUpdate) {
        // Place new node near a connected existing node for smooth appearance
        const connLink = resolvedLinks.find(
          (l) => (l.sourceId === f.id && savedPositions.has(l.targetId)) ||
                 (l.targetId === f.id && savedPositions.has(l.sourceId))
        );
        if (connLink) {
          const connId = connLink.sourceId === f.id ? connLink.targetId : connLink.sourceId;
          const connPos = savedPositions.get(connId);
          if (connPos) {
            node.x = connPos.x + (Math.random() - 0.5) * 60;
            node.y = connPos.y + (Math.random() - 0.5) * 60;
          }
        } else {
          node.x = (Math.random() - 0.5) * 100;
          node.y = (Math.random() - 0.5) * 100;
        }
      }
      return node;
    });
    nodesRef.current = nodes;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = resolvedLinks
      .filter((l) => nodeMap.has(l.sourceId) && nodeMap.has(l.targetId))
      .map((l) => ({ source: l.sourceId, target: l.targetId }));
    simLinksRef.current = simLinks;

    // Clear
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Defs
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter').attr('id', 'node-glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    glowFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    const g = svg.append('g');

    // Zoom
    const zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        transformRef.current = event.transform;
        drawMinimap();
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Canvas right-click (empty space)
    svg.on('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      ctxMenu.open(event, { type: 'canvas' }, 1);
    });

    if (isUpdate) {
      // Preserve user's zoom/pan on incremental updates
      svg.call(zoom.transform, transformRef.current);
    } else {
      const initialScale = Math.min(width, height) / 600;
      const initT = zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.max(0.5, Math.min(initialScale, 1.2)));
      svg.call(zoom.transform, initT);
      transformRef.current = initT;
    }

    // Curved links
    const link = g.append('g').selectAll('path').data(simLinks).join('path')
      .attr('fill', 'none')
      .attr('stroke', '#C5C4BC')
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', 0.8);

    // Nodes
    const node = g.append('g').selectAll<SVGGElement, SimNode>('g').data(nodes).join('g')
      .style('cursor', 'pointer');

    const radiusScale = scaleSqrt()
      .domain([0, max(nodes, (n) => n.linkCount) ?? 1])
      .range([5, 18]);
    radiusScaleRef.current = radiusScale;

    node.append('circle').attr('class', 'glow')
      .attr('r', (d) => radiusScale(d.linkCount) + 3)
      .attr('fill', (d) => d.color).attr('opacity', 0.15).attr('filter', 'url(#node-glow)');

    node.append('circle').attr('class', 'main')
      .attr('r', (d) => radiusScale(d.linkCount))
      .attr('fill', (d) => d.color).attr('stroke', '#fff').attr('stroke-width', 1.5).attr('opacity', 0.92);

    node.append('text')
      .text((d) => (d.name.length > 18 ? d.name.slice(0, 16) + '..' : d.name))
      .attr('dx', (d) => radiusScale(d.linkCount) + 5).attr('dy', 3)
      .attr('fill', '#5A5950').attr('font-size', '10px').attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif').attr('pointer-events', 'none');

    node.on('click', (_event, d) => { onSelectFileRef.current(d.id, d.path); });

    // Node right-click
    node.on('contextmenu', (event: MouseEvent, d: SimNode) => {
      event.stopPropagation();
      ctxMenu.open(event, { type: 'node', node: d }, 3);
    });

    node
      .on('mouseenter', (_event, d) => {
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        simLinks.forEach((l) => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          if (src === d.id) connectedIds.add(tgt);
          if (tgt === d.id) connectedIds.add(src);
        });
        node.select('circle.main').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        node.select('circle.glow').attr('opacity', (n) => connectedIds.has(n.id) ? 0.25 : 0.03);
        node.select('text').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        link
          .attr('stroke-opacity', (l) => { const src = typeof l.source === 'object' ? l.source.id : l.source; const tgt = typeof l.target === 'object' ? l.target.id : l.target; return src === d.id || tgt === d.id ? 0.7 : 0.06; })
          .attr('stroke-width', (l) => { const src = typeof l.source === 'object' ? l.source.id : l.source; const tgt = typeof l.target === 'object' ? l.target.id : l.target; return src === d.id || tgt === d.id ? 1.8 : 0.8; })
          .attr('stroke', (l) => { const src = typeof l.source === 'object' ? l.source.id : l.source; const tgt = typeof l.target === 'object' ? l.target.id : l.target; return src === d.id || tgt === d.id ? d.color : '#C5C4BC'; });
        select(_event.currentTarget as SVGGElement).select('circle.main').attr('stroke', '#2B2A25').attr('stroke-width', 2);
      })
      .on('mouseleave', () => {
        node.select('circle.main').attr('opacity', 0.92).attr('stroke', '#fff').attr('stroke-width', 1.5);
        node.select('circle.glow').attr('opacity', 0.15);
        node.select('text').attr('opacity', 1);
        link.attr('stroke-opacity', 0.45).attr('stroke', '#C5C4BC').attr('stroke-width', 0.8);
      });

    const drag = d3Drag<SVGGElement, SimNode>()
      .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    node.call(drag);

    // Fade in new nodes smoothly
    if (isUpdate && newNodeIds.size > 0) {
      node.filter((d) => newNodeIds.has(d.id))
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    }

    function linkPath(d: SimLink) {
      const s = d.source as SimNode;
      const tgt = d.target as SimNode;
      const sx = s.x ?? 0, sy = s.y ?? 0, tx = tgt.x ?? 0, ty = tgt.y ?? 0;
      const dx = tx - sx, dy = ty - sy;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
      return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
    }

    const simulation = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(80))
      .force('charge', forceManyBody().strength(-120))
      .force('center', forceCenter(0, 0))
      .force('collision', forceCollide<SimNode>().radius((d) => radiusScale(d.linkCount) + 6))
      .on('tick', () => {
        link.attr('d', linkPath);
        node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        drawMinimap();
      });

    // Use gentle alpha for incremental updates so existing nodes barely move
    if (isUpdate) {
      simulation.alpha(0.15).alphaDecay(0.05);
    }

    simulationRef.current = simulation;
    isInitialBuildRef.current = false;
    setIsTidy(false);
  }, [files, links, drawMinimap]);

  // ── Toolbar actions ────────────────────────────────────────

  const handleFitView = useCallback(() => {
    const svgEl = svgRef.current;
    const zoomBehavior = zoomRef.current;
    const nodes = nodesRef.current;
    if (!svgEl || !zoomBehavior || nodes.length === 0) return;

    const { w, h } = mainSizeRef.current;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const nx = n.x ?? 0, ny = n.y ?? 0;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    }
    const pad = 60;
    const rangeX = (maxX - minX) || 1;
    const rangeY = (maxY - minY) || 1;
    const scale = Math.min((w - pad * 2) / rangeX, (h - pad * 2) / rangeY, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const t = zoomIdentity.translate(w / 2 - cx * scale, h / 2 - cy * scale).scale(scale);
    select(svgEl).transition().duration(400).call(zoomBehavior.transform, t);
  }, []);

  const handleZoomIn = useCallback(() => {
    const svgEl = svgRef.current;
    const zoomBehavior = zoomRef.current;
    if (!svgEl || !zoomBehavior) return;
    select(svgEl).transition().duration(250).call(zoomBehavior.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    const svgEl = svgRef.current;
    const zoomBehavior = zoomRef.current;
    if (!svgEl || !zoomBehavior) return;
    select(svgEl).transition().duration(250).call(zoomBehavior.scaleBy, 1 / 1.4);
  }, []);

  const handleTidyUp = useCallback(() => {
    const sim = simulationRef.current;
    const nodes = nodesRef.current;
    if (!sim || nodes.length === 0) return;

    if (isTidy) {
      // Reset to normal forces
      sim
        .force('radial', null)
        .force('x', null)
        .force('y', null)
        .force('charge', forceManyBody().strength(-120))
        .force('center', forceCenter(0, 0));
      for (const n of nodes) { n.fx = null; n.fy = null; }
      sim.alpha(0.8).restart();
      setIsTidy(false);
      return;
    }

    // "Brain" layout: high-connection nodes pulled to center,
    // low-connection nodes pushed to outer ring, grouped by department
    const depts = Array.from(new Set(nodes.map((n) => n.dept)));
    const deptAngle = new Map<string, number>();
    depts.forEach((d, i) => deptAngle.set(d, (i / depts.length) * Math.PI * 2));

    const maxLinks = max(nodes, (n) => n.linkCount) ?? 1;

    // Radial force: highly connected nodes near center, leaf nodes on the edge
    sim
      .force('center', null)
      .force('charge', forceManyBody().strength(-60))
      .force('radial', forceRadial<SimNode>(
        (d) => {
          const ratio = 1 - (d.linkCount / maxLinks);
          return 30 + ratio * 160;
        },
        0, 0
      ).strength(0.8))
      // Department grouping: nudge nodes toward their department's angle sector
      .force('x', forceX<SimNode>((d) => {
        const angle = deptAngle.get(d.dept) ?? 0;
        const ratio = 1 - (d.linkCount / maxLinks);
        const r = 30 + ratio * 160;
        return Math.cos(angle) * r * 0.4;
      }).strength(0.3))
      .force('y', forceY<SimNode>((d) => {
        const angle = deptAngle.get(d.dept) ?? 0;
        const ratio = 1 - (d.linkCount / maxLinks);
        const r = 30 + ratio * 160;
        return Math.sin(angle) * r * 0.4;
      }).strength(0.3));

    for (const n of nodes) { n.fx = null; n.fy = null; }
    sim.alpha(1).restart();
    setIsTidy(true);

    // Fit view after settling
    setTimeout(() => handleFitView(), 1200);
  }, [isTidy, handleFitView]);

  // ── Minimap click ──────────────────────────────────────────
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = minimapCanvasRef.current;
    const svgEl = svgRef.current;
    if (!canvas || !svgEl || !zoomRef.current) return;
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const nx = n.x ?? 0, ny = n.y ?? 0;
      if (nx < minX) minX = nx; if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny; if (ny > maxY) maxY = ny;
    }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const innerW = MINIMAP_W - MINIMAP_PAD * 2;
    const innerH = MINIMAP_H - MINIMAP_PAD * 2;
    const sc = Math.min(innerW / rangeX, innerH / rangeY);
    const ox = MINIMAP_PAD + (innerW - rangeX * sc) / 2;
    const oy = MINIMAP_PAD + (innerH - rangeY * sc) / 2;
    const graphX = (clickX - ox) / sc + minX;
    const graphY = (clickY - oy) / sc + minY;

    const { w: mainW, h: mainH } = mainSizeRef.current;
    const t = transformRef.current;
    const newT = zoomIdentity.translate(mainW / 2 - graphX * t.k, mainH / 2 - graphY * t.k).scale(t.k);
    select(svgEl).transition().duration(300).call(zoomRef.current.transform, newT);
  }, []);

  // ── Mount / data updates (debounced during streaming) ─────
  useEffect(() => {
    if (rebuildTimerRef.current) clearTimeout(rebuildTimerRef.current);
    const delay = isInitialBuildRef.current ? 0 : 250;
    rebuildTimerRef.current = setTimeout(() => buildGraph(), delay);
    return () => { if (rebuildTimerRef.current) clearTimeout(rebuildTimerRef.current); };
  }, [buildGraph]);

  // ── Resize (update dimensions without full rebuild) ───────
  useEffect(() => {
    const handleResize = () => {
      if (!svgRef.current || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      mainSizeRef.current = { w, h };
      select(svgRef.current).attr('width', w).attr('height', h);
      drawMinimap();
    };
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); simulationRef.current?.stop(); };
  }, [drawMinimap]);

  // ── Context menu items ─────────────────────────────────────
  const contextMenuItems = useMemo((): ContextMenuItem[] => {
    const ctx = ctxMenu.state.context;
    if (!ctx) return [];

    if (ctx.type === 'node') {
      const { node } = ctx;
      return [
        {
          id: 'open-viewer',
          label: 'Open in viewer',
          icon: <FileText size={14} />,
          onAction: () => onSelectFileRef.current(node.id, node.path),
        },
        {
          id: 'open-new-tab',
          label: 'Open in new tab',
          icon: <ExternalLink size={14} />,
          onAction: () => onOpenInNewTabRef.current?.(node.id, node.path),
        },
        {
          id: 'copy-link',
          label: 'Copy link',
          icon: <Link size={14} />,
          onAction: () => { navigator.clipboard.writeText(node.path); },
        },
      ];
    }

    return [
      {
        id: 'zoom-to-fit',
        label: 'Zoom to fit',
        icon: <Maximize2 size={14} />,
        onAction: handleFitView,
      },
    ];
  }, [ctxMenu.state.context, handleFitView]);

  // ── Toolbar button style ───────────────────────────────────
  const btnColor = '#4A4940';

  return (
    <div ref={containerRef} className="relative h-full w-full" style={{ backgroundColor: '#F2F1EA' }}>
      <svg ref={svgRef} className="h-full w-full" />

      {/* Context menu */}
      {ctxMenu.state.isOpen && (
        <ContextMenu
          ref={ctxMenu.menuRef}
          items={contextMenuItems}
          position={ctxMenu.state.adjustedPosition}
          onClose={ctxMenu.close}
        />
      )}

      {/* Toolbar + Minimap */}
      <div className="absolute bottom-3 left-3 flex flex-col items-center gap-1.5">
        {/* Toolbar */}
        <div
          className="flex items-center gap-0.5 rounded-lg px-1 py-0.5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(43,42,37,0.1)',
          }}
        >
          <ToolbarBtn label="Fit view" onClick={handleFitView}>
            <Maximize2 size={15} color={btnColor} strokeWidth={2} />
          </ToolbarBtn>
          <ToolbarBtn label="Zoom in" onClick={handleZoomIn}>
            <ZoomIn size={15} color={btnColor} strokeWidth={2} />
          </ToolbarBtn>
          <ToolbarBtn label="Zoom out" onClick={handleZoomOut}>
            <ZoomOut size={15} color={btnColor} strokeWidth={2} />
          </ToolbarBtn>
          <ToolbarBtn
            label={isTidy ? 'Reset layout' : 'Tidy up'}
            onClick={handleTidyUp}
            active={isTidy}
          >
            <Sparkles size={15} color={isTidy ? '#5B9A65' : btnColor} strokeWidth={2} />
          </ToolbarBtn>
        </div>

        {/* Minimap (hidden on small screens) */}
        <canvas
          ref={minimapCanvasRef}
          onClick={handleMinimapClick}
          className="hidden cursor-pointer sm:block"
          style={{ width: MINIMAP_W, height: MINIMAP_H, borderRadius: 8 }}
        />
      </div>
    </div>
  );
}
