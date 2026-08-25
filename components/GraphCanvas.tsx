'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  url: string;
  desc: string;
  r?: number;
  targetAngle?: number;
  targetRadius?: number;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  relation: string;
}

const colorMap: Record<string, string> = {
  person: '#74b9ff',   // 祖师：天青蓝
  book: '#fd79a8',     // 经典：朱砂粉红
  concept: '#e0aaff',  // 概念：紫玉
  method: '#4ecdc4',   // 法门：翡翠碧绿
  koan: '#ffd700',     // 公案：流金
};

const baseRadiusMap: Record<string, number> = {
  person: 14,
  book: 11,
  concept: 10,
  method: 10,
  koan: 9,
};

// 关系强度权重：数值越高关联越强
const relationWeight: Record<string, number> = {
  '法脉': 3,
  '著述': 3,
  '阐扬': 2,
  '行持': 2,
  '问答': 1,
};

// 每个节点最多保留的连线数（按关系强度优先）
const MAX_LINKS_PER_NODE = 3;

// 根据关联度数计算节点半径：关联越多节点越大
const nodeRadius = (n: NodeData) => n.r ?? baseRadiusMap[n.type] ?? 10;

const typeLabelMap: Record<string, string> = {
  person: '祖师',
  book: '经典',
  concept: '概念',
  method: '法门',
  koan: '公案'
};

const FILTER_TYPES = ['person', 'book', 'concept', 'method', 'koan'] as const;

const shortLabel = (t: string, n = 8) => (t.length > n ? t.slice(0, n) + '…' : t);

// 排除在下方《世系图表》中已独立展示且会导致图谱分裂为双星团的早期达摩至五祖系节点
const EXCLUDE_GRAPH_IDS = new Set([
  'bodhidharma', 'huike', 'sengcan', 'daoxin', 'hongren',
  'xuemaicong', 'wuxinglun', 'poxianglun', 'wuxinlun', 'sixingguan',
  'koan-11', 'koan-12'
]);

/* ---- Nodes & links generated dynamically from taxonomy + manifest ---- */
function getGraphData() {
  const allNodes: NodeData[] = [
    ...ZEN_PERSONS.filter(p => !EXCLUDE_GRAPH_IDS.has(p.id)).map((p) => ({ id: p.id, name: p.name, type: 'person', url: `/persons/${p.id}`, desc: `${p.title} · ${p.era}` })),
    ...manifest.filter(b => !EXCLUDE_GRAPH_IDS.has(b.id)).map((b) => ({ id: b.id, name: shortLabel(b.title), type: 'book', url: `/classics/${b.id}`, desc: `${b.author} · ${b.category}` })),
    ...ZEN_CONCEPTS.filter(c => !EXCLUDE_GRAPH_IDS.has(c.id)).map((c) => ({ id: c.id, name: c.title, type: 'concept', url: `/concepts/${c.id}`, desc: c.summary.slice(0, 50) + '…' })),
    ...ZEN_METHODS.filter(m => !EXCLUDE_GRAPH_IDS.has(m.id)).map((m) => ({ id: m.id, name: m.title, type: 'method', url: `/methods/${m.id}`, desc: m.summary.slice(0, 50) + '…' })),
    ...ZEN_KOANS.filter(q => !EXCLUDE_GRAPH_IDS.has(q.id)).map((q) => ({ id: q.id, name: shortLabel(q.question, 7), type: 'koan', url: `/koan/${q.id}`, desc: `${q.master} · ${q.source}` })),
  ];

  const nodeIdSet = new Set(allNodes.map((n) => n.id));
  const linkDedupe = new Set<string>();
  const allLinks: LinkData[] = [];
  const addLink = (source: string, target: string, relation: string) => {
    if (!nodeIdSet.has(source) || !nodeIdSet.has(target) || source === target) return;
    const key = [source, target].sort().join('::');
    if (linkDedupe.has(key)) return;
    linkDedupe.add(key);
    allLinks.push({ source, target, relation });
  };

  ZEN_PERSONS.forEach((p) => {
    p.relatedPersons.forEach((t) => addLink(p.id, t, '法脉'));
    p.relatedConcepts.forEach((t) => addLink(p.id, t, '阐扬'));
    p.relatedMethods.forEach((t) => addLink(p.id, t, '行持'));
    p.relatedBooks.forEach((t) => addLink(p.id, t, '著述'));
  });
  ZEN_CONCEPTS.forEach((c) => {
    c.relatedPersons.forEach((t) => addLink(t, c.id, '阐扬'));
  });
  ZEN_METHODS.forEach((m) => {
    m.relatedPersons.forEach((t) => addLink(t, m.id, '行持'));
  });
  ZEN_KOANS.forEach((q) => {
    q.relatedPersons.forEach((t) => addLink(t, q.id, '问答'));
  });

  // 用全部连线统计度数，作为节点重要性与大小的依据
  const degree = new Map<string, number>();
  allLinks.forEach((l) => {
    degree.set(l.source as string, (degree.get(l.source as string) || 0) + 1);
    degree.set(l.target as string, (degree.get(l.target as string) || 0) + 1);
  });
  allNodes.forEach((n) => {
    const d = degree.get(n.id) || 0;
    const base = baseRadiusMap[n.type] || 10;
    n.r = Math.min(base * 3.2, base + d * 2.8);
  });

  // 每个节点只保留最强的若干条连线，避免连线过密
  const linksByNode = new Map<string, LinkData[]>();
  allLinks.forEach((l) => {
    [l.source as string, l.target as string].forEach((id) => {
      if (!linksByNode.has(id)) linksByNode.set(id, []);
      linksByNode.get(id)!.push(l);
    });
  });
  const keptLinks = new Set<LinkData>();
  linksByNode.forEach((arr) => {
    arr
      .slice()
      .sort((a, b) => (relationWeight[b.relation] || 1) - (relationWeight[a.relation] || 1))
      .slice(0, MAX_LINKS_PER_NODE)
      .forEach((l) => keptLinks.add(l));
  });
  const strongLinks = allLinks.filter((l) => keptLinks.has(l));

  return { allNodes, allLinks: strongLinks };
}

/**
 * 八瓣莲花花瓣方位角映射：
 * 赋予不同类别及核心度的节点对应的“莲花花瓣”角度分布，
 * 使图谱整体聚类自然呈现莲花绽放的几何之美。
 */
function getLotusPetalTarget(node: NodeData, index: number, total: number) {
  // 核心概念处于中心花蕊区域
  const isCore = ['buddha-nature', 'self-nature', 'mind-is-buddha', 'prajna', 'emptiness', 'huineng', 'mazu'].includes(node.id);
  if (isCore) {
    return { targetRadius: 35 + Math.random() * 45, targetAngle: (index / total) * Math.PI * 2 };
  }

  // 8 个主花瓣角度基准 (0, 45, 90, 135, 180, 225, 270, 315 度)
  let baseAngle = 0;
  let radius = 140 + Math.random() * 160;

  switch (node.type) {
    case 'book': // 经典著作：分布于上方与左右上花瓣 (270°, 225°, 315°)
      baseAngle = [-Math.PI * 0.5, -Math.PI * 0.75, -Math.PI * 0.25][index % 3];
      radius = 160 + Math.random() * 150;
      break;
    case 'method': // 修持法门：分布于左右横向花瓣 (0°, 180°)
      baseAngle = [0, Math.PI][index % 2];
      radius = 150 + Math.random() * 140;
      break;
    case 'person': // 历代祖师：分布于下方及斜下方花瓣 (90°, 45°, 135°)
      baseAngle = [Math.PI * 0.5, Math.PI * 0.25, Math.PI * 0.75][index % 3];
      radius = 170 + Math.random() * 160;
      break;
    case 'koan': // 公案机锋：分布于四隅花瓣尖端 (45°, 135°, 225°, 315°)
      baseAngle = [Math.PI * 0.25, Math.PI * 0.75, -Math.PI * 0.75, -Math.PI * 0.25][index % 4];
      radius = 210 + Math.random() * 180;
      break;
    case 'concept': // 核心概念：均匀环绕中心花心
    default:
      baseAngle = (index * (Math.PI / 4)) + (Math.random() - 0.5) * 0.3;
      radius = 110 + Math.random() * 130;
      break;
  }

  // 增加微小的自然散射角度
  const angle = baseAngle + (Math.random() - 0.5) * 0.35;
  return { targetRadius: radius, targetAngle: angle };
}

export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentNodesRef = useRef<NodeData[]>([]);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    person: true,
    book: true,
    concept: true,
    method: true,
    koan: true,
  });

  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, name: string, type: string, desc: string, color: string}>({
    show: false, x: 0, y: 0, name: '', type: '', desc: '', color: ''
  });

  // 鼠标滚轮缩放提示（当用户在画布上直接滚动时短暂显示）
  const [scrollHint, setScrollHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerScrollHint = useCallback(() => {
    setScrollHint(true);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setScrollHint(false);
    }, 1600);
  }, []);

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;
    const cx = width / 2;
    const cy = height / 2;

    d3.select(containerRef.current).selectAll('svg.graph-canvas-svg').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('class', 'graph-canvas-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('display', 'block')
      .style('overflow', 'hidden');

    svgRef.current = svg;

    // 绘制 SVG Defs（渐变、光晕滤镜、莲花花瓣图腾）
    const defs = svg.append('defs');

    // 1. 金色莲花微光渐变
    const goldGrad = defs.append('linearGradient')
      .attr('id', 'lotus-gold-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffd700').attr('stop-opacity', 0.6);
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ff9f43').attr('stop-opacity', 0.15);

    // 2. 青莲微光渐变
    const cyanGrad = defs.append('radialGradient')
      .attr('id', 'lotus-center-glow')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    cyanGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255, 215, 0, 0.45)');
    cyanGrad.append('stop').attr('offset', '40%').attr('stop-color', 'rgba(78, 205, 196, 0.2)');
    cyanGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(11, 19, 41, 0)');

    // 3. 柔和高斯模糊发光滤镜
    const filter = defs.append('filter')
      .attr('id', 'lotus-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    // ==========================================
    // 底层：精美禅意八瓣莲花曼陀罗（Lotus Mandala）
    // ==========================================
    const lotusGroup = g.append('g')
      .attr('class', 'lotus-mandala-group')
      .attr('transform', `translate(${cx}, ${cy})`)
      .style('pointer-events', 'none')
      .style('opacity', 0.38)
      .style('transition', 'opacity 0.3s ease');

    // 1. 中心光晕大圆盘
    lotusGroup.append('circle')
      .attr('r', 280)
      .attr('fill', 'url(#lotus-center-glow)');

    // 2. 同心神圣金环
    [65, 130, 200, 275].forEach((r, idx) => {
      lotusGroup.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', idx === 0 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', idx % 2 === 1 ? '4,6' : 'none');
    });

    // 3. 内层八瓣初开莲花 (Inner 8 Petals)
    for (let i = 0; i < 8; i++) {
      const angle = (i * 360) / 8;
      lotusGroup.append('path')
        .attr('d', 'M 0 0 C -16 -30 -24 -70 0 -105 C 24 -70 16 -30 0 0 Z')
        .attr('transform', `rotate(${angle})`)
        .attr('fill', 'url(#lotus-gold-grad)')
        .attr('stroke', 'rgba(255, 215, 0, 0.45)')
        .attr('stroke-width', 1.2)
        .attr('filter', 'url(#lotus-glow)');
    }

    // 4. 外层八瓣舒展大莲花瓣 (Outer 8 Petals - 交错 22.5 度)
    for (let i = 0; i < 8; i++) {
      const angle = (i * 360) / 8 + 22.5;
      lotusGroup.append('path')
        .attr('d', 'M 0 -35 C -24 -80 -38 -150 0 -210 C 38 -150 24 -80 0 -35 Z')
        .attr('transform', `rotate(${angle})`)
        .attr('fill', 'rgba(116, 185, 255, 0.04)')
        .attr('stroke', 'rgba(116, 185, 255, 0.22)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,3');
    }

    // 5. 莲花花蕊放射金线
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      lotusGroup.append('line')
        .attr('x1', Math.cos(angle) * 15)
        .attr('y1', Math.sin(angle) * 15)
        .attr('x2', Math.cos(angle) * 125)
        .attr('y2', Math.sin(angle) * 125)
        .attr('stroke', 'rgba(255, 215, 0, 0.25)')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', '2,4');
    }

    // 6. 中心花蕊核心
    lotusGroup.append('circle')
      .attr('r', 12)
      .attr('fill', 'rgba(255, 215, 0, 0.75)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#lotus-glow)');

    // ==========================================
    // D3 Zoom 缩放配置与滚轮解耦
    // ==========================================
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .filter((event) => {
        // 关键：对鼠标滚轮进行智能拦截
        if (event.type === 'wheel') {
          // 仅当按住 Ctrl (Windows) 或 Cmd (Mac) 时才缩放图谱
          const isZoomModifier = event.ctrlKey || event.metaKey;
          if (!isZoomModifier) {
            triggerScrollHint(); // 弹出提示条
            return false; // 放行滚轮事件，让页面正常顺畅滚动！
          }
          return true; // 按住快捷键时缩放
        }
        // 允许左键拖拽平移、触控板手势、双击等
        return !event.button;
      })
      .on('zoom', (event) => {
        const transform = event.transform;
        g.attr('transform', transform);

        // 动态计算莲花图腾与文字 LOD
        const k = transform.k;
        
        // 缩小时（远距离视角）增强莲花图腾，放大时淡化
        // 当 k < 0.6 时 opacity 接近 0.55，放大到 k > 1.2 时降至 0.08
        const lotusOpacity = Math.max(0.06, Math.min(0.55, 0.52 - (k - 0.35) * 0.45));
        lotusGroup.style('opacity', lotusOpacity);

        // 文字 LOD：缩至极小 (k < 0.4) 时淡化文字，突出莲花星芒形态
        const textOpacity = k < 0.35 ? 0.2 : (k < 0.55 ? ((k - 0.35) / 0.2) * 0.8 + 0.2 : 1);
        g.selectAll('.node-label').style('opacity', textOpacity);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    /* ---- filter nodes/links by active types ---- */
    const { allNodes, allLinks } = getGraphData();
    const nodesData = allNodes.filter((n) => visible[n.type]);
    const visibleIds = new Set(nodesData.map((n) => n.id));
    const linksData = allLinks.filter((l) => visibleIds.has(l.source as string) && visibleIds.has(l.target as string));

    // 过滤掉没有任何连线的孤立节点
    const nodesWithLinks = new Set<string>();
    linksData.forEach(l => {
      nodesWithLinks.add(l.source as string);
      nodesWithLinks.add(l.target as string);
    });
    
    const finalNodesData = nodesData.filter(n => nodesWithLinks.has(n.id));

    // 为每个节点计算“莲花花瓣”初始坐标与导向引力
    const nodes: NodeData[] = finalNodesData.map((d, idx) => {
      const petal = getLotusPetalTarget(d, idx, finalNodesData.length);
      const initX = cx + Math.cos(petal.targetAngle) * petal.targetRadius * (0.8 + Math.random() * 0.4);
      const initY = cy + Math.sin(petal.targetAngle) * petal.targetRadius * (0.8 + Math.random() * 0.4);
      return {
        ...d,
        x: initX,
        y: initY,
        targetAngle: petal.targetAngle,
        targetRadius: petal.targetRadius,
      };
    });
    const links: LinkData[] = linksData.map(d => ({ ...d }));

    // 自定义轻度莲花径向导向力
    const forceLotusRadial = (alpha: number) => {
      const k = alpha * 0.12;
      for (const n of nodes) {
        if (n.targetAngle !== undefined && n.targetRadius !== undefined) {
          const targetX = cx + Math.cos(n.targetAngle) * n.targetRadius;
          const targetY = cy + Math.sin(n.targetAngle) * n.targetRadius;
          n.vx = (n.vx || 0) + (targetX - (n.x || cx)) * k;
          n.vy = (n.vy || 0) + (targetY - (n.y || cy)) * k;
        }
      }
    };

    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(65).strength(0.65))
      .force('charge', d3.forceManyBody().strength(-85))
      .force('center', d3.forceCenter(cx, cy).strength(0.08))
      .force('lotusRadial', forceLotusRadial)
      .force('collide', d3.forceCollide<NodeData>().radius(d => nodeRadius(d) + 7).strength(0.85))
      .alphaDecay(0.03);

    currentNodesRef.current = nodes;

    // Web lines group
    const webLinesGroup = g.append('g').attr('class', 'web-lines');

    const link = g.append('g')
      .attr('stroke', 'rgba(255, 255, 255, 0.16)')
      .attr('stroke-width', 1.2)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('x1', d => (d.source as NodeData).x ?? cx)
      .attr('y1', d => (d.source as NodeData).y ?? cy)
      .attr('x2', d => (d.target as NodeData).x ?? cx)
      .attr('y2', d => (d.target as NodeData).y ?? cy)
      .style('opacity', 0);

    const linkLabels = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .text(d => d.relation)
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255, 255, 255, 0.85)')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x ?? cx},${d.y ?? cy})`);

    // 节点外层发光圈（微光星芒）
    node.append('circle')
      .attr('r', d => nodeRadius(d) + 3)
      .attr('fill', 'none')
      .attr('stroke', d => colorMap[d.type] || '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);

    node.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => colorMap[d.type] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#lotus-glow)');

    node.append('text')
      .attr('class', 'node-label')
      .text(d => d.name)
      .attr('font-size', '13px')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeRadius(d) + 14)
      .style('text-shadow', '0px 1px 4px rgba(0,0,0,0.9)')
      .style('pointer-events', 'none');

    // Drag interaction
    const drag = d3.drag<SVGGElement, NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    node.call(drag as any);

    node.on('mouseover', (event, d) => {
      d3.select(event.currentTarget).selectAll('circle')
        .transition().duration(200)
        .attr('r', (n: any, idx) => (idx === 0 ? nodeRadius(d) + 9 : nodeRadius(d) + 5));

      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(d.id);

      links.filter(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === d.id) { connectedNodeIds.add(targetId); return true; }
        if (targetId === d.id) { connectedNodeIds.add(sourceId); return true; }
        return false;
      });

      node.style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.12);

      link
        .style('stroke', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? colorMap[d.type] : 'rgba(255,255,255,0.04)')
        .style('stroke-width', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? 2.5 : 1)
        .style('opacity', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? 1 : 0.05);

      linkLabels.style('opacity', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? 1 : 0);

      webLinesGroup.selectAll('line').remove();
      const firstDegreeNodes = nodes.filter(n => connectedNodeIds.has(n.id) && n.id !== d.id)
        .slice(0, 8);

      webLinesGroup.selectAll('line')
        .data(firstDegreeNodes)
        .join('line')
        .attr('x1', d.x!)
        .attr('y1', d.y!)
        .attr('x2', n => n.x!)
        .attr('y2', n => n.y!)
        .attr('stroke', colorMap[d.type])
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6);

      setTooltip({
        show: true,
        x: event.clientX,
        y: event.clientY,
        name: d.name,
        type: typeLabelMap[d.type] || d.type,
        desc: d.desc,
        color: colorMap[d.type]
      });
    })
    .on('mousemove', (event) => {
      setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    })
    .on('mouseout', () => {
      node.style('opacity', 1);
      node.selectAll('circle')
        .transition().duration(200)
        .attr('r', (n: any, idx) => (idx === 0 ? nodeRadius(n) + 3 : nodeRadius(n)));
      link.style('stroke', 'rgba(255, 255, 255, 0.16)')
          .style('stroke-width', 1.2)
          .style('opacity', 0);
      linkLabels.style('opacity', 0);
      webLinesGroup.selectAll('line').remove();
      setTooltip(prev => ({ ...prev, show: false }));
    })
    .on('click', (event, d) => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setTimeout(() => {
          router.push(d.url);
        }, 3000);
      } else {
        router.push(d.url);
      }
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x!)
        .attr('y1', d => (d.source as NodeData).y!)
        .attr('x2', d => (d.target as NodeData).x!)
        .attr('y2', d => (d.target as NodeData).y!);

      linkLabels
        .attr('x', d => ((d.source as NodeData).x! + (d.target as NodeData).x!) / 2)
        .attr('y', d => ((d.source as NodeData).y! + (d.target as NodeData).y!) / 2 - 4);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // 仿真 2.8 秒后自动居中并冻结防抖（符合 AGENTS.md 规范）
    const freezeTimer = setTimeout(() => {
      simulation.stop();

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined && isFinite(n.x) && isFinite(n.y)) {
          minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
        }
      });

      if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
        const pad = 70;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.05, Math.max(0.35, Math.min(width / bw, height / bh)));
        const fitX = width / 2 - fitScale * (minX + maxX) / 2;
        const fitY = height / 2 - fitScale * (minY + maxY) / 2;
        if (isFinite(fitX) && isFinite(fitY) && isFinite(fitScale)) {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(fitX, fitY).scale(fitScale));
        }
      }
    }, 2800);

    return () => {
      clearTimeout(freezeTimer);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      simulation.stop();
      svg.remove();
    };
  }, [router, visible, triggerScrollHint]);

  const toggleType = (t: string) => {
    setVisible((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(400).call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(400).call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 600;
      const nodes = currentNodesRef.current;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined && isFinite(n.x) && isFinite(n.y)) {
          minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
        }
      });

      if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
        const pad = 70;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.05, Math.max(0.35, Math.min(width / bw, height / bh)));
        const fitX = width / 2 - fitScale * (minX + maxX) / 2;
        const fitY = height / 2 - fitScale * (minY + maxY) / 2;
        if (isFinite(fitX) && isFinite(fitY) && isFinite(fitScale)) {
          svgRef.current.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity.translate(fitX, fitY).scale(fitScale));
        }
      } else {
        svgRef.current.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
      }
    }
  };

  const countByType = (t: string) => getGraphData().allNodes.filter((n) => n.type === t).length;

  return (
    <div className="relative isolate w-full h-[75vh] min-h-[525px] md:h-[90vh] md:min-h-[700px] bg-[#0B1329] rounded-3xl overflow-hidden shadow-2xl border border-slate-800" ref={containerRef}>
      {/* Filter chips */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2 max-w-[60%]">
        {FILTER_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              visible[t]
                ? 'bg-white/15 border-white/30 text-white shadow-sm'
                : 'bg-transparent border-white/10 text-white/35 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorMap[t], opacity: visible[t] ? 1 : 0.3 }} />
            {typeLabelMap[t]} {countByType(t)}
          </button>
        ))}
      </div>

      {/* Controls Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex bg-slate-900/80 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
          <button
            onClick={handleZoomIn}
            title="放大图谱"
            aria-label="放大"
            className="p-2 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            title="缩小图谱"
            aria-label="缩小"
            className="p-2 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleReset}
            title="重置居中"
            aria-label="重置"
            className="p-2 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-[11px] font-medium text-slate-300 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>按住 <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-amber-300">Ctrl</kbd> 滚轮缩放</span>
        </div>
      </div>

      {/* 滚轮滑动时的智能提示条 (Google Maps 风格) */}
      {scrollHint && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 animate-fade-in">
          <div className="px-4 py-2 bg-slate-950/90 text-slate-200 text-xs font-medium rounded-full border border-amber-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span className="text-amber-400 font-bold">💡 提示：</span>
            <span>按住 <kbd className="px-1.5 py-0.5 bg-white/15 rounded text-[11px] font-mono text-amber-300 font-bold">Ctrl</kbd> (或 ⌘) 滚动可缩放图谱，直接滚动可浏览下方内容</span>
          </div>
        </div>
      )}

      {/* Interactive Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 15,
            top: tooltip.y + 15,
            background: 'rgba(11,19,41,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'white',
            zIndex: 50,
            pointerEvents: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            maxWidth: '300px'
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span className="font-bold text-base">{tooltip.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 ml-2">
              {tooltip.type}
            </span>
          </div>
          <div className="text-sm text-white/75 mt-2 leading-relaxed">{tooltip.desc}</div>
        </div>
      )}
    </div>
  );
};
