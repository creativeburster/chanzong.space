'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw, MoveVertical, Plus, Minus, Flower2, Sparkles } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { useLang } from '@/context/LangContext';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  url: string;
  desc: string;
  degree?: number;
  r?: number;
  tx?: number;          // 目标锚点 x
  ty?: number;          // 目标锚点 y
  isCore?: boolean;     // 是否位于中央金色莲蓬
  petalSlot?: number;   // 归属的 16 瓣花瓣槽位 (0 ~ 15)
  importance?: number;  // 3: 莲台核心, 2: 花瓣领衔, 1: 露珠节点
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  relation: string;
}

const colorMap: Record<string, string> = {
  person: '#38bdf8',  // 天青霁蓝 (祖师)
  book: '#fb7185',    // 胭脂绯红 (经典)
  concept: '#c084fc', // 紫罗兰 (概念)
  method: '#34d399',  // 松石翡翠绿 (法门)
  koan: '#fbbf24',    // 琥珀金 (公案)
};

const petalBgColorMap: Record<string, string> = {
  person: 'rgba(56, 189, 248, 0.08)',
  book: 'rgba(251, 113, 133, 0.08)',
  concept: 'rgba(192, 132, 252, 0.08)',
  method: 'rgba(52, 211, 153, 0.08)',
  koan: 'rgba(251, 191, 36, 0.08)',
};

const petalStrokeColorMap: Record<string, string> = {
  person: 'rgba(56, 189, 248, 0.35)',
  book: 'rgba(251, 113, 133, 0.35)',
  concept: 'rgba(192, 132, 252, 0.35)',
  method: 'rgba(52, 211, 153, 0.35)',
  koan: 'rgba(251, 191, 36, 0.35)',
};

const baseRadiusMap: Record<string, number> = {
  person: 13,
  book: 11,
  concept: 10,
  method: 10,
  koan: 9,
};

const typeLabelMap: Record<string, string> = {
  person: '祖师',
  book: '经典',
  concept: '概念',
  method: '法门',
  koan: '公案'
};

const FILTER_TYPES = ['person', 'book', 'concept', 'method', 'koan'] as const;

const shortLabel = (t: string, n = 8) => (t.length > n ? t.slice(0, n) + '…' : t);

// 剔除全站关联过少的碎片节点（度数 < MIN_DEGREE 不入图谱）
const MIN_DEGREE = 6;

// 16 瓣槽位分配：环绕式渐变色彩排布 (正北为 0，顺时针展开)
const PETAL_SLOTS = 16;
const PETAL_TYPES: Record<number, string> = {
  13: 'method', 14: 'method',
  15: 'koan', 0: 'koan', 1: 'koan',
  2: 'book', 3: 'book',
  4: 'person', 5: 'person', 6: 'person',
  7: 'concept', 8: 'concept', 9: 'concept', 10: 'concept', 11: 'concept', 12: 'concept'
};

// 16 瓣花瓣雅致题识
const PETAL_TITLES: Record<number, string> = {
  0: '机锋公案·破执', 1: '提撕向上·大机', 2: '经论宝藏·上乘', 3: '贝叶渊薮·慧海',
  4: '西天东土·初祖', 5: '五家七宗·法脉', 6: '曹洞临济·宗风', 7: '自性般若·法身',
  8: '第一义谛·圆觉', 9: '真如本心·妙有', 10: '空寂灵知·无住', 11: '顿悟本源·不二',
  12: '平常是道·大圆', 13: '一行三昧·直趣', 14: '参究默照·妙修', 15: '棒喝玄关·透脱'
};

// 仅排除少数无度数的孤立外围碎片（达摩等核心祖师已全部回归居于莲心正中）
const EXCLUDE_GRAPH_IDS = new Set([
  'xuemaicong', 'wuxinglun', 'poxianglun', 'wuxinlun', 'sixingguan',
]);

/**
 * 水滴形花瓣在半径 r 处的半角宽度（极坐标弧度）
 */
function petalHalfAngle(r: number, r0: number, r1: number, wMax: number): number {
  if (r <= r0 || r >= r1) return 0.001;
  const u = (r - r0) / (r1 - r0);
  // 水滴曲线：在 u = 0.55 处达到饱满最大宽度
  const profile = Math.sin(Math.PI * Math.pow(u, 0.72)) * (1 - 0.15 * u);
  const w = wMax * profile;
  return Math.asin(Math.min(0.95, w / r));
}

/**
 * 生成单个花瓣的贝塞尔封闭轮廓 SVG 路径
 */
function generatePetalPathPolar(cx: number, cy: number, theta: number, r0: number, r1: number, wMax: number, steps = 18): string {
  const ptsLeft: { x: number; y: number }[] = [];
  const ptsRight: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const r = r0 + u * (r1 - r0);
    const dTheta = petalHalfAngle(r, r0, r1, wMax);
    const aLeft = theta - dTheta;
    const aRight = theta + dTheta;
    ptsLeft.push({ x: cx + r * Math.cos(aLeft), y: cy + r * Math.sin(aLeft) });
    ptsRight.unshift({ x: cx + r * Math.cos(aRight), y: cy + r * Math.sin(aRight) });
  }
  const allPts = ptsLeft.concat(ptsRight);
  return 'M ' + allPts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' L ') + ' Z';
}

/**
 * 物理硬边界守卫：强行将节点位置 clamp 限制在水滴莲瓣或中央莲蓬内
 */
function clampNodePosition(node: NodeData, cx: number, cy: number) {
  if (node.isCore) {
    const dx = (node.x ?? cx) - cx;
    const dy = (node.y ?? cy) - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > 140) {
      const scale = 140 / dist;
      node.x = cx + dx * scale;
      node.y = cy + dy * scale;
    }
    return;
  }

  if (node.petalSlot !== undefined) {
    const slotIdx = node.petalSlot;
    const isInner = slotIdx % 2 === 0;
    const r0 = isInner ? 145 : 210;
    const r1 = isInner ? 695 : 905;
    const wMax = isInner ? 90 : 102;
    const thetaAxis = -Math.PI / 2 + slotIdx * (Math.PI / 8);

    const dx = (node.x ?? cx) - cx;
    const dy = (node.y ?? cy) - cy;
    let dist = Math.hypot(dx, dy);
    let curAngle = Math.atan2(dy, dx);

    if (dist < r0) dist = r0;
    if (dist > r1) dist = r1;

    let angleDiff = curAngle - thetaAxis;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxHalfA = petalHalfAngle(dist, r0, r1, wMax) * 0.95;
    if (Math.abs(angleDiff) > maxHalfA) {
      angleDiff = Math.sign(angleDiff) * maxHalfA;
      curAngle = thetaAxis + angleDiff;
    }

    node.x = cx + dist * Math.cos(curAngle);
    node.y = cy + dist * Math.sin(curAngle);
  }
}

/**
 * 将节点分配到花瓣内的水滴极坐标网格中
 */
function assignNodesToPetal(nodes: NodeData[], slotIdx: number, cx: number, cy: number) {
  const isInner = slotIdx % 2 === 0;
  const r0 = isInner ? 148 : 215;
  const r1 = isInner ? 685 : 895;
  const wMax = isInner ? 86 : 98;
  const theta = -Math.PI / 2 + slotIdx * (Math.PI / 8);

  const n = nodes.length;
  if (n === 0) return;

  const rows = Math.max(5, Math.ceil(Math.sqrt(n * 1.8)));
  const weights: number[] = [];
  for (let row = 0; row < rows; row++) {
    const u = (row + 0.55) / rows;
    const r = r0 + u * (r1 - r0);
    const halfA = petalHalfAngle(r, r0, r1, wMax);
    weights.push(Math.max(1, r * halfA * 2));
  }
  const totalW = weights.reduce((a, b) => a + b, 0);
  const rowCaps = weights.map(w => Math.max(1, Math.round((w / totalW) * n)));

  let sumCap = rowCaps.reduce((a, b) => a + b, 0);
  while (sumCap < n) {
    rowCaps[Math.floor(rows / 2)]++;
    sumCap++;
  }
  while (sumCap > n) {
    const maxIdx = rowCaps.indexOf(Math.max(...rowCaps));
    if (rowCaps[maxIdx] > 1) { rowCaps[maxIdx]--; sumCap--; } else break;
  }

  let placed = 0;
  for (let row = 0; row < rows && placed < n; row++) {
    const u = (row + 0.55) / rows;
    const r = r0 + u * (r1 - r0);
    const halfA = petalHalfAngle(r, r0, r1, wMax);
    const cap = rowCaps[row];

    for (let j = 0; j < cap && placed < n; j++) {
      const frac = cap === 1 ? 0 : ((j / (cap - 1)) * 2 - 1) * 0.78;
      const a = theta + frac * halfA;
      const node = nodes[placed];
      node.petalSlot = slotIdx;
      node.isCore = false;
      node.tx = cx + r * Math.cos(a);
      node.ty = cy + r * Math.sin(a);
      node.x = node.tx + (Math.random() - 0.5) * 15;
      node.y = node.ty + (Math.random() - 0.5) * 15;
      node.importance = (row === 0 || placed < 3) ? 2 : 1;
      placed++;
    }
  }
}

/**
 * 构建整图数据并完成 16 瓣宝莲几何拓扑映射
 */
function getGraphData() {
  const allNodes: NodeData[] = [
    ...ZEN_PERSONS.filter((p) => !EXCLUDE_GRAPH_IDS.has(p.id)).map((p) => ({
      id: p.id,
      name: p.name,
      type: 'person',
      url: `/persons/${p.id}`,
      desc: `${p.title} · ${p.era}`,
    })),
    ...manifest.filter((b) => !EXCLUDE_GRAPH_IDS.has(b.id)).map((b) => ({
      id: b.id,
      name: shortLabel(b.title),
      type: 'book',
      url: `/classics/${b.id}`,
      desc: `${b.author} · ${b.category}`,
    })),
    ...ZEN_CONCEPTS.filter((c) => !EXCLUDE_GRAPH_IDS.has(c.id)).map((c) => ({
      id: c.id,
      name: c.title,
      type: 'concept',
      url: `/concepts/${c.id}`,
      desc: c.summary.slice(0, 48) + '…',
    })),
    ...ZEN_METHODS.filter((m) => !EXCLUDE_GRAPH_IDS.has(m.id)).map((m) => ({
      id: m.id,
      name: m.title,
      type: 'method',
      url: `/methods/${m.id}`,
      desc: m.summary.slice(0, 48) + '…',
    })),
    ...ZEN_KOANS.map((q) => ({
      id: q.id,
      name: shortLabel(q.question, 7),
      type: 'koan',
      url: `/koan/${q.id}`,
      desc: `${q.master} · ${q.source}`,
    })),
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
    c.relatedConcepts.forEach((t) => addLink(c.id, t, '法脉'));
    c.relatedBooks.forEach((t) => addLink(c.id, t, '著述'));
  });
  ZEN_METHODS.forEach((m) => {
    m.relatedPersons.forEach((t) => addLink(t, m.id, '行持'));
    m.relatedConcepts.forEach((t) => addLink(m.id, t, '阐扬'));
    m.relatedBooks.forEach((t) => addLink(m.id, t, '著述'));
  });
  ZEN_KOANS.forEach((q) => {
    q.relatedPersons.forEach((t) => addLink(t, q.id, '问答'));
    q.relatedConcepts.forEach((t) => addLink(q.id, t, '阐扬'));
    q.relatedBooks.forEach((t) => addLink(q.id, t, '著述'));
  });

  const degree = new Map<string, number>();
  allLinks.forEach((l) => {
    degree.set(l.source as string, (degree.get(l.source as string) || 0) + 1);
    degree.set(l.target as string, (degree.get(l.target as string) || 0) + 1);
  });

  // 保留度数 >= 6 的核心法界实体
  const keptNodes = allNodes.filter((n) => (degree.get(n.id) || 0) >= MIN_DEGREE);
  const keptNodeIds = new Set(keptNodes.map((n) => n.id));
  const keptRawLinks = allLinks.filter((l) => keptNodeIds.has(l.source as string) && keptNodeIds.has(l.target as string));

  keptNodes.forEach((n) => {
    const d = degree.get(n.id) || 0;
    n.degree = d;
    const base = baseRadiusMap[n.type] || 10;
    n.r = Math.min(base * 2.5, base + Math.sqrt(d) * 2.2);
  });

  return { allNodes: keptNodes, allLinks: keptRawLinks };
}

// 模块级构建一次静态图拓扑
const GRAPH_DATA = getGraphData();

const COUNTS: Record<string, number> = FILTER_TYPES.reduce((acc, t) => {
  acc[t] = GRAPH_DATA.allNodes.filter((n) => n.type === t).length;
  return acc;
}, {} as Record<string, number>);

export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentNodesRef = useRef<NodeData[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  const [visible, setVisible] = useState<Record<string, boolean>>({
    person: true,
    book: true,
    concept: true,
    method: true,
    koan: true,
  });

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  const updateTooltipPos = (clientX: number, clientY: number) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    const pad = 15;
    const tipWidth = tip.offsetWidth || 260;
    const tipHeight = tip.offsetHeight || 100;
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 600;

    let x = clientX + pad;
    let y = clientY + pad;

    if (x + tipWidth > winWidth - 12) x = Math.max(12, clientX - tipWidth - pad);
    if (y + tipHeight > winHeight - 12) y = Math.max(12, clientY - tipHeight - pad);

    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };

  const showTooltip = (event: { clientX: number; clientY: number }, d: NodeData) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.style.borderColor = colorMap[d.type] || '#fff';
    const nameEl = tip.querySelector('[data-name]');
    const descEl = tip.querySelector('[data-desc]');
    const tagEl = tip.querySelector('[data-type]');
    const dotEl = tip.querySelector('[data-dot]') as HTMLElement | null;
    if (nameEl) nameEl.textContent = t(d.name);
    if (descEl) descEl.textContent = t(d.desc);
    if (tagEl) tagEl.textContent = t(typeLabelMap[d.type] || d.type);
    if (dotEl) dotEl.style.backgroundColor = colorMap[d.type];
    tip.style.opacity = '1';
    updateTooltipPos(event.clientX, event.clientY);
  };

  const moveTooltip = (event: { clientX: number; clientY: number }) => {
    updateTooltipPos(event.clientX, event.clientY);
  };

  const hideTooltip = () => {
    const tip = tooltipRef.current;
    if (tip) tip.style.opacity = '0';
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 960;
    const height = containerRef.current.clientHeight || 750;
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
      .style('overflow', 'hidden')
      .style('background', '#0B1329');

    svgRef.current = svg;

    // SVG 滤镜与渐变定义
    const defs = svg.append('defs');

    // 1. 金色莲蓬渐变
    const coreGrad = defs.append('radialGradient')
      .attr('id', 'core-pod-gradient')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    coreGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FBBF24').attr('stop-opacity', '0.28');
    coreGrad.append('stop').attr('offset', '70%').attr('stop-color', '#D97706').attr('stop-opacity', '0.14');
    coreGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B45309').attr('stop-opacity', '0.02');

    // 2. 节点发光微滤镜
    const glowFilter = defs.append('filter')
      .attr('id', 'lotus-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('class', 'main-zoom-layer');

    // D3 缩放器
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .wheelDelta((event) => -event.deltaY * 0.002)
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // 缩放自适应：当放大查看微观时 (k > 1.15)，平滑渐现普通节点的文字
        const k = event.transform.k;
        g.selectAll<SVGTextElement, NodeData>('text.node-label-normal')
          .style('opacity', k > 1.15 ? Math.min(1, (k - 1.15) * 3) : 0);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    /* ---- 过滤当前启用的类型 ---- */
    const { allNodes, allLinks } = GRAPH_DATA;
    const activeNodes = allNodes.filter((n) => visible[n.type]);
    const activeIds = new Set(activeNodes.map((n) => n.id));
    const activeLinks = allLinks.filter((l) => activeIds.has(l.source as string) && activeIds.has(l.target as string));

    const nodes: NodeData[] = activeNodes.map(d => ({ ...d }));
    const links: LinkData[] = activeLinks.map(d => ({ ...d }));

    // 按度数从高到低排序
    nodes.sort((a, b) => (b.degree || 0) - (a.degree || 0));

    // 1. 挑选前 24 个中枢节点驻留在金色莲蓬内
    const coreCount = Math.min(24, Math.floor(nodes.length * 0.08));
    const coreNodes = nodes.slice(0, coreCount);
    const nonCoreNodes = nodes.slice(coreCount);

    // 为核心节点分配同心圆环锚点
    coreNodes.forEach((n, idx) => {
      n.isCore = true;
      n.importance = 3;
      n.petalSlot = undefined;
      // 内圈 6 个，外圈剩余
      if (idx < 6) {
        const theta = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
        n.tx = cx + 48 * Math.cos(theta);
        n.ty = cy + 48 * Math.sin(theta);
      } else {
        const outerIdx = idx - 6;
        const outerTotal = coreCount - 6;
        const theta = -Math.PI / 2 + (outerIdx * Math.PI * 2) / outerTotal + Math.PI / outerTotal;
        n.tx = cx + 106 * Math.cos(theta);
        n.ty = cy + 106 * Math.sin(theta);
      }
      n.x = n.tx + (Math.random() - 0.5) * 8;
      n.y = n.ty + (Math.random() - 0.5) * 8;
    });

    // 2. 将非核心节点按类型分到对应的 16 瓣
    const byType = new Map<string, NodeData[]>();
    nonCoreNodes.forEach(n => {
      if (!byType.has(n.type)) byType.set(n.type, []);
      byType.get(n.type)!.push(n);
    });

    for (let slot = 0; slot < PETAL_SLOTS; slot++) {
      const type = PETAL_TYPES[slot];
      const list = byType.get(type) || [];
      const slotsForType = Object.entries(PETAL_TYPES).filter(([_, t]) => t === type).map(([s]) => Number(s));
      const ordinal = slotsForType.indexOf(slot);
      const chunk = list.filter((_, idx) => idx % slotsForType.length === ordinal);
      assignNodesToPetal(chunk, slot, cx, cy);
    }

    currentNodesRef.current = nodes;

    /* =========================================================
     * 🌸 绘制底层 SVG 俯视盛开宝莲底衬 (The Sacred Lotus Base)
     * ========================================================= */
    const lotusBaseGroup = g.append('g').attr('class', 'lotus-base-layer');

    // 1. 16 片水滴莲瓣底衬（半透明极光彩霞）
    // 渲染顺序：先绘制外层交错瓣 (奇数)，再绘制内层主瓣 (偶数)，展现层次重叠感
    const renderSlots = [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 14];

    renderSlots.forEach((slotIdx) => {
      const isInner = slotIdx % 2 === 0;
      const r0 = isInner ? 145 : 210;
      const r1 = isInner ? 695 : 905;
      const wMax = isInner ? 90 : 102;
      const theta = -Math.PI / 2 + slotIdx * (Math.PI / 8);
      const type = PETAL_TYPES[slotIdx];

      const petalPathStr = generatePetalPathPolar(cx, cy, theta, r0, r1, wMax);

      const petalG = lotusBaseGroup.append('g').attr('class', `petal-group slot-${slotIdx}`);

      // 花瓣填充与外框金线
      petalG.append('path')
        .attr('d', petalPathStr)
        .attr('fill', petalBgColorMap[type] || 'rgba(255, 255, 255, 0.05)')
        .attr('stroke', petalStrokeColorMap[type] || 'rgba(255, 255, 255, 0.25)')
        .attr('stroke-width', isInner ? 1.4 : 1.1)
        .style('transition', 'all 0.3s ease');

      // 花瓣中轴主叶脉 (Central Vein)
      const x0 = cx + r0 * Math.cos(theta);
      const y0 = cy + r0 * Math.sin(theta);
      const x1 = cx + (r1 - 12) * Math.cos(theta);
      const y1 = cy + (r1 - 12) * Math.sin(theta);

      petalG.append('line')
        .attr('x1', x0).attr('y1', y0)
        .attr('x2', x1).attr('y2', y1)
        .attr('stroke', petalStrokeColorMap[type] || 'rgba(255, 255, 255, 0.2)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0.6);

      // 侧叶脉 (Lateral Veins)
      [0.38, 0.58, 0.76].forEach((u) => {
        const rMid = r0 + u * (r1 - r0);
        const xm = cx + rMid * Math.cos(theta);
        const ym = cy + rMid * Math.sin(theta);
        const halfA = petalHalfAngle(rMid, r0, r1, wMax) * 0.75;

        // 左侧脉
        petalG.append('line')
          .attr('x1', xm).attr('y1', ym)
          .attr('x2', cx + rMid * Math.cos(theta - halfA))
          .attr('y2', cy + rMid * Math.sin(theta - halfA))
          .attr('stroke', petalStrokeColorMap[type])
          .attr('stroke-width', 0.8)
          .style('opacity', 0.25);

        // 右侧脉
        petalG.append('line')
          .attr('x1', xm).attr('y1', ym)
          .attr('x2', cx + rMid * Math.cos(theta + halfA))
          .attr('y2', cy + rMid * Math.sin(theta + halfA))
          .attr('stroke', petalStrokeColorMap[type])
          .attr('stroke-width', 0.8)
          .style('opacity', 0.25);
      });

      // 花瓣顶端题识印记（空灵宋体微字）
      const tagR = r1 - 28;
      const tagX = cx + tagR * Math.cos(theta);
      const tagY = cy + tagR * Math.sin(theta);
      const rotDeg = (theta * 180 / Math.PI) + 90;

      petalG.append('text')
        .text(t(PETAL_TITLES[slotIdx] || ''))
        .attr('x', tagX).attr('y', tagY)
        .attr('font-size', '10.5px')
        .attr('fill', colorMap[type])
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(${rotDeg}, ${tagX}, ${tagY})`)
        .style('opacity', 0.5)
        .style('font-family', 'var(--font-serif), serif')
        .style('letter-spacing', '2px')
        .style('pointer-events', 'none');
    });

    // 2. 中央金色莲蓬 (Golden Lotus Receptacle Pod)
    const podGroup = lotusBaseGroup.append('g').attr('class', 'lotus-pod-center');

    // 莲蓬发光外光圈
    podGroup.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', 148)
      .attr('fill', 'url(#core-pod-gradient)')
      .attr('stroke', 'rgba(251, 191, 36, 0.4)')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '6,3');

    // 莲蓬同心金环
    [48, 106].forEach((cr) => {
      podGroup.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', cr)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(251, 191, 36, 0.2)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');
    });

    // 32 根金色花蕊 (Stamens)
    for (let s = 0; s < 32; s++) {
      const stTheta = (s * Math.PI * 2) / 32;
      const sx1 = cx + 138 * Math.cos(stTheta);
      const sy1 = cy + 138 * Math.sin(stTheta);
      const sx2 = cx + 152 * Math.cos(stTheta);
      const sy2 = cy + 152 * Math.sin(stTheta);

      podGroup.append('line')
        .attr('x1', sx1).attr('y1', sy1)
        .attr('x2', sx2).attr('y2', sy2)
        .attr('stroke', '#FDE68A')
        .attr('stroke-width', 1.2)
        .style('opacity', 0.7);

      // 花药小圆点
      podGroup.append('circle')
        .attr('cx', sx2).attr('cy', sy2).attr('r', 2)
        .attr('fill', '#FBBF24')
        .style('opacity', 0.9);
    }

    // 莲心正中八吉祥微徽
    podGroup.append('text')
      .text('卍')
      .attr('x', cx).attr('y', cy + 5)
      .attr('font-size', '18px')
      .attr('fill', 'rgba(251, 191, 36, 0.25)')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('font-family', 'serif');

    /* =========================================================
     * 🌐 连线与力导向物理引擎 (Force Simulation)
     * ========================================================= */
    const webLinesGroup = g.append('g').attr('class', 'web-lines');

    // 全量连线 path
    const linkPath = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.12)')
      .attr('stroke-width', 0.9)
      .style('opacity', 0.85);

    // 悬停高亮连线 path
    const linkHighlight = g.append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 2.4)
      .style('opacity', 0);

    const updateLinkPath = () => {
      let d = '';
      for (let i = 0; i < links.length; i++) {
        const s = links[i].source as NodeData;
        const t = links[i].target as NodeData;
        d += `M${s.x ?? cx},${s.y ?? cy}L${t.x ?? cx},${t.y ?? cy}`;
      }
      linkPath.attr('d', d);
    };

    // 关系文字标签
    const linkLabelGroup = g.append('g')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    let activeLabels: LinkData[] = [];
    const positionActiveLabels = () => {
      if (!activeLabels.length) return;
      linkLabelGroup
        .selectAll<SVGTextElement, LinkData>('text')
        .data(activeLabels, (l) => `${(l.source as NodeData).id}->${(l.target as NodeData).id}`)
        .join('text')
        .text((l) => t(l.relation))
        .attr('x', (l) => (((l.source as NodeData).x ?? 0) + ((l.target as NodeData).x ?? 0)) / 2)
        .attr('y', (l) => (((l.source as NodeData).y ?? 0) + ((l.target as NodeData).y ?? 0)) / 2 - 4);
    };

    // 力导向设置：弱连线拉力 + 强花瓣锚定力 + 碰撞防重叠
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links)
        .id(d => d.id)
        .distance(d => (d.source as NodeData).petalSlot === (d.target as NodeData).petalSlot ? 38 : 75)
        .strength(d => (d.source as NodeData).petalSlot === (d.target as NodeData).petalSlot ? 0.12 : 0.012)
      )
      .force('collide', d3.forceCollide<NodeData>()
        .radius(d => (d.r ?? 10) + (d.isCore ? 6 : 4))
        .strength(0.85)
      )
      .force('petalSpring', ((alpha: number) => {
        for (const n of nodes) {
          if (n.tx === undefined || n.ty === undefined) continue;
          n.vx = (n.vx || 0) + (n.tx - (n.x || 0)) * 0.42 * alpha;
          n.vy = (n.vy || 0) + (n.ty - (n.y || 0)) * 0.42 * alpha;
        }
      }) as any)
      .alphaDecay(0.04);

    /* =========================================================
     * 💎 节点与文字渲染 (Node Gems & Hierarchical Typography)
     * ========================================================= */
    const nodeGroup = g.append('g').attr('class', 'node-layer');

    const node = nodeGroup
      .selectAll<SVGGElement, NodeData>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x ?? cx},${d.y ?? cy})`);

    // 核心节点外层光环
    node.filter(d => !!d.isCore)
      .append('circle')
      .attr('r', d => (d.r ?? 14) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#FDE68A')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    // 节点宝石本体
    node.append('circle')
      .attr('r', d => d.r ?? 10)
      .attr('fill', d => colorMap[d.type] || '#ccc')
      .attr('stroke', d => d.isCore ? '#FFFBEB' : '#FFFFFF')
      .attr('stroke-width', d => d.isCore ? 2.2 : 1.4)
      .style('filter', d => d.isCore ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none');

    // 分级文字：核心大节点（莲蓬中枢 + 各瓣领衔）始终展示加粗清晰大字
    node.filter(d => (d.importance ?? 1) >= 2)
      .append('text')
      .text(d => t(d.name))
      .attr('font-size', d => d.isCore ? '13.5px' : '11.5px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.isCore ? '#FEF3C7' : '#FFFFFF')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r ?? 10) + 14)
      .style('text-shadow', '0px 1px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none');

    // 普通露珠节点文字：全景缩览下隐藏以防堆叠，放大或悬停时优雅浮现
    node.filter(d => (d.importance ?? 1) === 1)
      .append('text')
      .attr('class', 'node-label-normal')
      .text(d => t(d.name))
      .attr('font-size', '10.5px')
      .attr('fill', '#F1F5F9')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r ?? 9) + 12)
      .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.9)')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('transition', 'opacity 0.25s ease');

    // 拖拽手势交互
    const drag = d3.drag<SVGGElement, NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart();
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

    // 鼠标悬停交互
    node.on('mouseover', (event, d: any) => {
      d3.select(event.currentTarget).select('circle')
        .transition().duration(200)
        .attr('r', (d.r ?? 10) + 5);

      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(d.id);

      links.forEach(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === d.id) { connectedNodeIds.add(targetId); return; }
        if (targetId === d.id) { connectedNodeIds.add(sourceId); return; }
      });

      node.style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.15);

      // 高亮关联普通节点的文字
      node.selectAll<SVGTextElement, NodeData>('text.node-label-normal')
        .style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0);

      // 高亮连线
      let hd = '';
      links.forEach(l => {
        const s = l.source as NodeData;
        const t = l.target as NodeData;
        if (connectedNodeIds.has(s.id) && connectedNodeIds.has(t.id)) {
          hd += `M${s.x ?? 0},${s.y ?? 0}L${t.x ?? 0},${t.y ?? 0}`;
        }
      });
      linkHighlight.attr('d', hd).attr('stroke', colorMap[d.type]).style('opacity', 1);

      activeLabels = links.filter(l => {
        const s = l.source as NodeData;
        const t = l.target as NodeData;
        return connectedNodeIds.has(s.id) && connectedNodeIds.has(t.id);
      });
      positionActiveLabels();

      webLinesGroup.selectAll('line').remove();
      const firstDegreeNodes = nodes.filter(n => connectedNodeIds.has(n.id) && n.id !== d.id).slice(0, 10);

      webLinesGroup.selectAll('line')
        .data(firstDegreeNodes)
        .join('line')
        .attr('x1', d.x!)
        .attr('y1', d.y!)
        .attr('x2', n => n.x!)
        .attr('y2', n => n.y!)
        .attr('stroke', colorMap[d.type])
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.7);

      showTooltip(event, d);
    })
    .on('mousemove', (event) => {
      moveTooltip(event);
    })
    .on('mouseout', (event, d: any) => {
      d3.select(event.currentTarget).select('circle')
        .transition().duration(200)
        .attr('r', d.r ?? 10);

      node.style('opacity', 1);
      linkHighlight.style('opacity', 0);
      activeLabels = [];
      linkLabelGroup.selectAll('text').remove();
      webLinesGroup.selectAll('line').remove();

      // 恢复普通文字的显隐状态（根据当前缩放级别）
      const curK = d3.zoomTransform(svg.node()!).k;
      node.selectAll<SVGTextElement, NodeData>('text.node-label-normal')
        .style('opacity', curK > 1.15 ? Math.min(1, (curK - 1.15) * 3) : 0);

      hideTooltip();
    })
    .on('click', (event, d) => {
      if (window.matchMedia('(max-width: 768px)').matches) {
        setTimeout(() => { router.push(d.url); }, 3000);
      } else {
        router.push(d.url);
      }
    });

    // 每一帧仿真计算：执行硬边界守护，强保俯视莲花完美对称舒展
    simulation.on('tick', () => {
      for (const n of nodes) {
        clampNodePosition(n, cx, cy);
      }
      updateLinkPath();
      positionActiveLabels();
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // 默认视角：以黄金全览比例居中呈现俯视宝莲曼荼罗
    const maxLotusR = 940;
    const k0 = Math.min(width, height) / ((maxLotusR + 50) * 2);
    const fitScale0 = Math.max(0.35, Math.min(0.92, k0));
    svg.call(zoom.transform, d3.zoomIdentity.translate(cx - fitScale0 * cx, cy - fitScale0 * cy).scale(fitScale0));

    // 若 URL 中携带 ?focus=xxx，平滑对焦并悬浮高亮该节点
    const focusId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('focus') : null;
    let focusTimer: any = null;

    if (focusId) {
      const target = nodes.find((n) => n.id === focusId);
      if (target) {
        focusTimer = setTimeout(() => {
          const k = 1.35;
          const fitX = width / 2 - (target.x ?? cx) * k;
          const fitY = height / 2 - (target.y ?? cy) * k;
          svg.transition().duration(900).ease(d3.easeCubicOut).call(zoom.transform, d3.zoomIdentity.translate(fitX, fitY).scale(k));
          showTooltip({ clientX: width / 2, clientY: height / 2 - 35 }, target);
        }, 1100);
      }
    }

    // 仿真 2.5 秒后平滑停顿并冻结物理计算，释放 CPU
    const freezeTimer = setTimeout(() => {
      simulation.stop();
    }, 2500);

    return () => {
      clearTimeout(freezeTimer);
      if (focusTimer) clearTimeout(focusTimer);
      simulation.stop();
      svg.remove();
    };
  }, [router, visible]);

  const toggleType = (t: string) => {
    setVisible((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  const handleZoomBy = (factor: number) => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(300).call(zoomRef.current.scaleBy, factor);
    }
  };

  const handleZoomIn = () => handleZoomBy(1.3);
  const handleZoomOut = () => handleZoomBy(0.77);

  const handleReset = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth || 960;
      const height = containerRef.current.clientHeight || 750;
      const cx = width / 2;
      const cy = height / 2;
      const maxLotusR = 940;
      const k0 = Math.min(width, height) / ((maxLotusR + 50) * 2);
      const fitScale0 = Math.max(0.35, Math.min(0.92, k0));
      svgRef.current.transition().duration(600).ease(d3.easeCubicOut).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(cx - fitScale0 * cx, cy - fitScale0 * cy).scale(fitScale0)
      );
    }
  };

  return (
    <div className="relative w-full flex items-start gap-4">
      {/* 1. 黑色背景主图谱卡片：俯视盛开宝莲（Top-down Lotus Mandala） */}
      <div
        className="relative flex-1 h-[70vh] min-h-[520px] md:h-[88vh] md:min-h-[700px] bg-[#0B1329] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        ref={containerRef}
      >
        {/* 顶部标题与形态指示徽章 */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/30 shadow-lg text-xs font-bold text-amber-300">
            <Flower2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t('自性金莲 · 俯视全景曼荼罗')}</span>
          </div>
        </div>

        {/* Filter chips (右上角分类筛选) */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-1.5 md:gap-2 max-w-[80%] md:max-w-[55%] overflow-x-auto no-scrollbar py-1 px-1">
          {FILTER_TYPES.map((tType) => (
            <button
              key={tType}
              onClick={() => toggleType(tType)}
              className={`flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold border transition-all shrink-0 ${
                visible[tType]
                  ? 'bg-white/15 border-white/30 text-white shadow-sm'
                  : 'bg-transparent border-white/10 text-white/35 line-through'
              }`}
            >
              <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full" style={{ backgroundColor: colorMap[tType], opacity: visible[tType] ? 1 : 0.3 }} />
              {t(typeLabelMap[tType])} {COUNTS[tType]}
            </button>
          ))}
        </div>

        {/* 底部空灵提示 */}
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 text-[11px] text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('中心莲蓬居达摩六祖法身 · 16瓣宝莲舒展万法源流 · 滚轮放大显微')}</span>
          </div>
        </div>

        {/* 移动端浮动操作按钮组（右下角） */}
        <div className="absolute bottom-4 right-4 z-20 flex md:hidden items-center bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full p-1 shadow-lg gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white active:bg-white/20 rounded-full transition-colors"
            title="放大"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white active:bg-white/20 rounded-full transition-colors"
            title="缩小"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center text-amber-400 hover:text-amber-300 active:bg-white/20 rounded-full transition-colors"
            title="复位宝莲"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 桌面端右侧悬浮操作面板（复位、缩放）与页面滚动指引 */}
      <div className="hidden md:flex sticky top-28 flex-col items-center space-y-3 z-30 py-2">
        <div className="flex flex-col items-center bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl space-y-1">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            title="放大图谱"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            title="缩小图谱"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-4 border-t border-slate-700 my-0.5" />
          <button
            onClick={handleReset}
            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            title="复位俯视全景"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* 页面滚动与缩放指引提示 */}
        <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] text-slate-300 max-w-[118px] shadow-sm leading-snug">
          <MoveVertical className="w-4 h-4 text-amber-400 animate-bounce mb-1" />
          <span className="font-bold text-amber-200">鼠标置于图外滚轮滚动整页</span>
          <span className="mt-1.5 pt-1.5 border-t border-slate-700/80 text-slate-400">图内滚轮缩放宝莲</span>
          <span className="mt-1 text-slate-400">放大显示全部文字</span>
        </div>
      </div>

      {/* 3. 悬浮 Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'rgba(11, 19, 41, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderLeftWidth: '4px',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'white',
          zIndex: 50,
          pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          maxWidth: '320px',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span data-dot className="w-2.5 h-2.5 rounded-full shrink-0" />
          <span data-name className="font-bold text-base" />
          <span data-type className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 shrink-0" />
        </div>
        <div data-desc className="text-sm text-white/70 mt-2" />
      </div>
    </div>
  );
};
