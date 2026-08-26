'use client';

/**
 * 知识图谱 · 八瓣莲花版
 *
 * 设计要点：
 * 1. 性能：Canvas 2D 渲染 + 静态确定性布局（无 D3 力仿真、无逐帧 DOM 更新），
 *    仅在视图/悬停/筛选变化时按需重绘，空闲时 0 CPU；含视口裁剪与 LOD 分级绘制。
 * 2. 形态：节点按类型归入八瓣莲花，花瓣内按连接度沿正弦轮廓排布，
 *    整体轮廓即一朵金色莲花（类 logo/favicon），莲心为「禅」字徽记。
 * 3. 滚轮：默认不劫持滚轮（页面正常滚动）；点击图谱 / Ctrl+滚轮 / 拖拽后
 *    开启缩放模式（滚轮=缩放图谱），Esc 退出。拖拽平移、双指捏合缩放始终可用。
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, ZoomIn, ZoomOut, MousePointerClick, X } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

type NodeType = 'person' | 'book' | 'concept' | 'method' | 'koan';

interface GNode {
  id: string;
  name: string;
  type: NodeType;
  url: string;
  desc: string;
  r: number;
  deg: number;
  x: number;
  y: number;
}

interface GLink {
  source: string;
  target: string;
  relation: string;
}

interface Petal {
  type: NodeType;
  theta: number;    // 花瓣中心角（弧度，-π/2 为正上方）
  length: number;   // 花瓣长度（世界坐标）
  maxW: number;     // 花瓣最大半宽
  count: number;
}

interface Layout {
  nodes: GNode[];
  petals: Petal[];
  links: { a: number; b: number }[];       // 节点索引对
  nodeLinks: number[][];                    // 每个节点的邻接连线索引
}

const colorMap: Record<string, string> = {
  person: '#74b9ff',
  book: '#fd79a8',
  concept: '#e0aaff',
  method: '#4ecdc4',
  koan: '#ffd700',
};

const rgbMap: Record<string, string> = {
  person: '116,185,255',
  book: '253,121,168',
  concept: '224,170,255',
  method: '78,205,196',
  koan: '255,215,0',
};

const baseRadiusMap: Record<string, number> = {
  person: 14,
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
  koan: '公案',
};

const FILTER_TYPES: NodeType[] = ['person', 'book', 'concept', 'method', 'koan'];

const relationWeight: Record<string, number> = {
  '法脉': 3,
  '著述': 3,
  '阐扬': 2,
  '行持': 2,
  '问答': 1,
};

const MAX_LINKS_PER_NODE = 3;

// 排除在下方《世系图表》中已独立展示且会导致图谱分裂为双星团的早期达摩至五祖系节点
const EXCLUDE_GRAPH_IDS = new Set([
  'bodhidharma', 'huike', 'sengcan', 'daoxin', 'hongren',
  'xuemaicong', 'wuxinglun', 'poxianglun', 'wuxinlun', 'sixingguan',
]);

const shortLabel = (t: string, n = 8) => (t.length > n ? t.slice(0, n) + '…' : t);

/* ---------- 静态图数据（进程内只构建一次） ---------- */

function buildGraphData() {
  const nodes: GNode[] = [
    ...ZEN_PERSONS.filter((p) => !EXCLUDE_GRAPH_IDS.has(p.id)).map((p) => ({
      id: p.id,
      name: p.name,
      type: 'person' as NodeType,
      url: `/persons/${p.id}`,
      desc: `${p.title} · ${p.era}`,
      r: 0,
      deg: 0,
      x: 0,
      y: 0,
    })),
    ...manifest.filter((b) => !EXCLUDE_GRAPH_IDS.has(b.id)).map((b) => ({
      id: b.id,
      name: shortLabel(b.title),
      type: 'book' as NodeType,
      url: `/classics/${b.id}`,
      desc: `${b.author} · ${b.category}`,
      r: 0,
      deg: 0,
      x: 0,
      y: 0,
    })),
    ...ZEN_CONCEPTS.filter((c) => !EXCLUDE_GRAPH_IDS.has(c.id)).map((c) => ({
      id: c.id,
      name: c.title,
      type: 'concept' as NodeType,
      url: `/concepts/${c.id}`,
      desc: c.summary.slice(0, 48) + '…',
      r: 0,
      deg: 0,
      x: 0,
      y: 0,
    })),
    ...ZEN_METHODS.filter((m) => !EXCLUDE_GRAPH_IDS.has(m.id)).map((m) => ({
      id: m.id,
      name: m.title,
      type: 'method' as NodeType,
      url: `/methods/${m.id}`,
      desc: m.summary.slice(0, 48) + '…',
      r: 0,
      deg: 0,
      x: 0,
      y: 0,
    })),
    ...ZEN_KOANS.map((q) => ({
      id: q.id,
      name: shortLabel(q.question, 7),
      type: 'koan' as NodeType,
      url: `/koan/${q.id}`,
      desc: `${q.master} · ${q.source}`,
      r: 0,
      deg: 0,
      x: 0,
      y: 0,
    })),
  ];

  const nodeIdSet = new Set(nodes.map((n) => n.id));
  const linkDedupe = new Set<string>();
  const links: GLink[] = [];
  const addLink = (source: string, target: string, relation: string) => {
    if (!nodeIdSet.has(source) || !nodeIdSet.has(target) || source === target) return;
    const key = [source, target].sort().join('::');
    if (linkDedupe.has(key)) return;
    linkDedupe.add(key);
    links.push({ source, target, relation });
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
  links.forEach((l) => {
    degree.set(l.source, (degree.get(l.source) || 0) + 1);
    degree.set(l.target, (degree.get(l.target) || 0) + 1);
  });

  nodes.forEach((n) => {
    const d = degree.get(n.id) || 0;
    n.deg = d;
    const base = baseRadiusMap[n.type] || 10;
    n.r = Math.min(base * 3.2, base + d * 2.8);
  });

  const linksByNode = new Map<string, GLink[]>();
  links.forEach((l) => {
    [l.source, l.target].forEach((id) => {
      if (!linksByNode.has(id)) linksByNode.set(id, []);
      linksByNode.get(id)!.push(l);
    });
  });
  const keptLinks = new Set<GLink>();
  linksByNode.forEach((arr) => {
    arr
      .slice()
      .sort((a, b) => (relationWeight[b.relation] || 1) - (relationWeight[a.relation] || 1))
      .slice(0, MAX_LINKS_PER_NODE)
      .forEach((l) => keptLinks.add(l));
  });

  return { nodes, links: links.filter((l) => keptLinks.has(l)) };
}

const GRAPH = buildGraphData();

const COUNTS: Record<string, number> = FILTER_TYPES.reduce((acc, t) => {
  acc[t] = GRAPH.nodes.filter((n) => n.type === t).length;
  return acc;
}, {} as Record<string, number>);

/* ---------- 八瓣莲花布局 ---------- */

const PETAL_SLOTS = 8;
const PETAL_GAP = 0.1;          // 花瓣间角间隙（弧度）
const BASE_R = 190;             // 莲心半径（花瓣起点）
const MAX_PETAL_LEN = 1000;     // 最大花瓣长度
const TITLE_PAD = 120;          // 花瓣标题超出花瓣尖端的距离

/** 依节点数把激活类型分配到 8 个花瓣槽位（尽量相邻不同色） */
function planPetals(active: Record<string, boolean>, nodesByType: Map<NodeType, GNode[]>): NodeType[] {
  const types = FILTER_TYPES.filter((t) => active[t] && (nodesByType.get(t)?.length || 0) > 0);
  if (!types.length) return [];

  const total = types.reduce((s, t) => s + (nodesByType.get(t)!.length), 0);
  // 按节点数比例分配 8 瓣，每种至少 1 瓣，多退少补给最大类型
  const shares = new Map<NodeType, number>();
  let used = 0;
  types.forEach((t) => {
    const s = Math.max(1, Math.round((PETAL_SLOTS * nodesByType.get(t)!.length) / total));
    shares.set(t, s);
    used += s;
  });
  const biggest = types.reduce((a, b) => (nodesByType.get(a)!.length >= nodesByType.get(b)!.length ? a : b));
  shares.set(biggest, Math.max(1, shares.get(biggest)! + PETAL_SLOTS - used));

  // 逐个安放：优先选择与左右邻瓣都不同色的最靠前空槽
  const plan: NodeType[] = new Array(PETAL_SLOTS).fill(undefined as unknown as NodeType);
  const queue: NodeType[] = [];
  shares.forEach((s, t) => { for (let i = 0; i < s; i++) queue.push(t); });
  queue.sort((a, b) => (nodesByType.get(b)!.length - nodesByType.get(a)!.length) || a.localeCompare(b));
  for (const t of queue) {
    let slot = -1;
    for (let i = 0; i < PETAL_SLOTS; i++) {
      if (plan[i]) continue;
      const left = plan[(i - 1 + PETAL_SLOTS) % PETAL_SLOTS];
      const right = plan[(i + 1) % PETAL_SLOTS];
      if (left !== t && right !== t) { slot = i; break; }
    }
    if (slot < 0) {
      for (let i = 0; i < PETAL_SLOTS; i++) if (!plan[i]) { slot = i; break; }
    }
    if (slot >= 0) plan[slot] = t;
  }
  return plan;
}

function buildLayout(visible: Record<string, boolean>): Layout {
  const activeNodes = GRAPH.nodes.filter((n) => visible[n.type]);
  const visibleIds = new Set(activeNodes.map((n) => n.id));
  const keptLinks = GRAPH.links.filter((l) => visibleIds.has(l.source) && visibleIds.has(l.target));

  const linkedIds = new Set<string>();
  keptLinks.forEach((l) => {
    linkedIds.add(l.source);
    linkedIds.add(l.target);
  });
  const nodes = activeNodes
    .filter((n) => linkedIds.has(n.id))
    .map((n) => ({ ...n }));
  const idxById = new Map(nodes.map((n, i) => [n.id, i]));
  const links = keptLinks
    .map((l) => ({ a: idxById.get(l.source)!, b: idxById.get(l.target)! }))
    .filter((l) => l.a !== undefined && l.b !== undefined);

  const nodeLinks: number[][] = nodes.map(() => []);
  links.forEach((l, li) => {
    nodeLinks[l.a]?.push(li);
    nodeLinks[l.b]?.push(li);
  });

  // 按类型分组、按连接度降序，轮询分发到该类型的各个花瓣
  const nodesByType = new Map<NodeType, GNode[]>();
  FILTER_TYPES.forEach((t) => nodesByType.set(t, []));
  nodes.forEach((n) => nodesByType.get(n.type)!.push(n));
  nodesByType.forEach((arr) => arr.sort((a, b) => b.deg - a.deg));

  const plan = planPetals(visible, nodesByType);
  const typeSlots = new Map<NodeType, number[]>();
  plan.forEach((t, i) => {
    if (!typeSlots.has(t)) typeSlots.set(t, []);
    typeSlots.get(t)!.push(i);
  });

  const nMax = Math.max(1, ...Array.from(typeSlots.entries()).map(([t, slots]) =>
    Math.ceil((nodesByType.get(t)?.length || 0) / slots.length)
  ));

  const petals: Petal[] = plan.map((type, i) => {
    const theta = -Math.PI / 2 + (i * Math.PI) / 4;
    const count = Math.ceil((nodesByType.get(type)?.length || 0) / (typeSlots.get(type)?.length || 1));
    const length = MAX_PETAL_LEN * (0.6 + 0.4 * Math.min(1, Math.sqrt(count / nMax)));
    const midR = BASE_R + length * 0.5;
    const span = (Math.PI * 2) / PETAL_SLOTS - PETAL_GAP;
    return { type, theta, length, maxW: Math.tan(span / 2) * midR * 0.86, count };
  });

  const cursorByType = new Map<NodeType, GNode[][]>(); // type -> [slotOrdinal][nodes]
  typeSlots.forEach((slots, t) => {
    const buckets: GNode[][] = slots.map(() => []);
    const arr = nodesByType.get(t) || [];
    arr.forEach((n, i) => buckets[i % slots.length].push(n));
    cursorByType.set(t, buckets);
  });

  typeSlots.forEach((slots, t) => {
    const buckets = cursorByType.get(t)!;
    slots.forEach((slotIdx, ordinal) => {
      const petal = petals[slotIdx];
      const bucket = buckets[ordinal];
      const n = bucket.length;
      const rows = Math.max(3, Math.ceil(Math.sqrt(n * 2.6)));
      const capC = Math.max(2, Math.ceil(n / (rows * 0.6366)));
      let placed = 0;
      for (let row = 0; row < rows && placed < n; row++) {
        const t = (row + 0.5) / rows;
        const radius = BASE_R + petal.length * t;
        const profile = Math.sin(Math.PI * t);
        const cap = Math.max(1, Math.round(capC * profile));
        const halfAngle = Math.atan2(petal.maxW * profile, radius);
        for (let j = 0; j < cap && placed < n; j++) {
          const frac = cap === 1 ? 0 : (j / (cap - 1)) * 2 - 1;
          const a = petal.theta + frac * halfAngle * 0.9;
          const node = bucket[placed];
          node.x = Math.cos(a) * radius;
          node.y = Math.sin(a) * radius;
          placed++;
        }
      }
    });
  });

  return { nodes, petals, links, nodeLinks };
}

/* ---------- 组件 ---------- */

interface ViewState { x: number; y: number; k: number; }

export const GraphCanvas: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    person: true, book: true, concept: true, method: true, koan: true,
  });
  const [zoomOn, setZoomOn] = useState(false);

  const layout = useMemo(() => buildLayout(visible), [visible]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const viewRef = useRef<ViewState>({ x: 0, y: 0, k: 1 });
  const zoomOnRef = useRef(false);
  const hoverRef = useRef(-1);
  const neighborRef = useRef<Set<number>>(new Set());
  const hoverLinkRef = useRef<Set<number>>(new Set());
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const userTouchedRef = useRef(false);

  /* ----- 绘制 ----- */

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      draw();
    });
  };

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = sizeRef.current.w || canvas.clientWidth;
    const ch = sizeRef.current.h || canvas.clientHeight;
    const L = layoutRef.current;
    const view = viewRef.current;
    const k = view.k;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0B1329';
    ctx.fillRect(0, 0, cw, ch);

    const setWorld = () => ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * view.x, dpr * view.y);
    setWorld();

    // 视口世界坐标范围（裁剪用）
    const wx0 = -view.x / k, wy0 = -view.y / k;
    const wx1 = (cw - view.x) / k, wy1 = (ch - view.y) / k;

    /* 1. 花瓣底色与描边 */
    for (const p of L.petals) {
      ctx.beginPath();
      const steps = 22;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const r = BASE_R + p.length * t;
        const w = p.maxW * Math.sin(Math.PI * t);
        const a = p.theta + Math.atan2(w, r);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let s = steps; s >= 0; s--) {
        const t = s / steps;
        const r = BASE_R + p.length * t;
        const w = p.maxW * Math.sin(Math.PI * t);
        const a = p.theta - Math.atan2(w, r);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, BASE_R * 0.8, 0, 0, BASE_R + p.length);
      grad.addColorStop(0, `rgba(${rgbMap[p.type]},0.10)`);
      grad.addColorStop(1, `rgba(${rgbMap[p.type]},0.015)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(216,180,100,0.20)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const hover = hoverRef.current;
    const hasHover = hover >= 0 && hover < L.nodes.length;

    /* 2. 连线（LOD：低倍率隐藏；悬停时高亮邻接） */
    const linkAlpha = k < 0.42 ? 0 : Math.min(0.13, 0.04 + (k - 0.42) * 0.16);
    if (linkAlpha > 0 || hasHover) {
      if (linkAlpha > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${linkAlpha})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let li = 0; li < L.links.length; li++) {
          if (hasHover && hoverLinkRef.current.has(li)) continue;
          const { a, b } = L.links[li];
          const na = L.nodes[a], nb = L.nodes[b];
          if ((na.x < wx0 && nb.x < wx0) || (na.x > wx1 && nb.x > wx1)) continue;
          if ((na.y < wy0 && nb.y < wy0) || (na.y > wy1 && nb.y > wy1)) continue;
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
        }
        ctx.stroke();
      }
      if (hasHover) {
        ctx.strokeStyle = `rgba(${rgbMap[L.nodes[hover].type]},0.85)`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        hoverLinkRef.current.forEach((li) => {
          const { a, b } = L.links[li];
          ctx.moveTo(L.nodes[a].x, L.nodes[a].y);
          ctx.lineTo(L.nodes[b].x, L.nodes[b].y);
        });
        ctx.stroke();
      }
    }

    /* 3. 节点（按类型分批填充；悬停时其余节点压暗） */
    const inView = (n: GNode) => n.x > wx0 - 40 && n.x < wx1 + 40 && n.y > wy0 - 40 && n.y < wy1 + 40;
    const isHi = (i: number) => hasHover && (i === hover || neighborRef.current.has(i));
    const drawBatch = (alpha: number, highlighted: boolean) => {
      for (const t of FILTER_TYPES) {
        ctx.fillStyle = `rgba(${rgbMap[t]},${alpha})`;
        ctx.beginPath();
        for (let i = 0; i < L.nodes.length; i++) {
          const n = L.nodes[i];
          if (n.type !== t || !inView(n)) continue;
          if (isHi(i) !== highlighted) continue;
          ctx.moveTo(n.x + n.r, n.y);
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };
    if (hasHover) drawBatch(0.1, false);  // 压暗非邻接节点
    drawBatch(0.92, hasHover);            // 正常节点（无悬停时全部）

    // 连接度高的节点加金色描环，形成层次
    if (k > 0.5) {
      ctx.strokeStyle = 'rgba(232,194,104,0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < L.nodes.length; i++) {
        const n = L.nodes[i];
        if (n.deg < 9 || !inView(n)) continue;
        if (!isHi(i)) continue;
        ctx.moveTo(n.x + n.r + 3, n.y);
        ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    /* 4. 节点标签（LOD：屏幕半径足够大才显示，悬停时始终显示邻接标签） */
    ctx.font = '13px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let labelCount = 0;
    for (let i = 0; i < L.nodes.length && labelCount < 450; i++) {
      const n = L.nodes[i];
      if (!inView(n)) continue;
      const hi = isHi(i);
      if (hasHover && !hi) continue;
      if (!hi && n.r * k < 8) continue;
      ctx.fillStyle = hi ? '#ffffff' : 'rgba(255,255,255,0.82)';
      ctx.fillText(n.name, n.x, n.y + n.r + 4);
      labelCount++;
    }

    /* 5. 花瓣类别标签（低倍率时显示，营造 logo/曼陀罗感） */
    const titleAlpha = Math.max(0, Math.min(1, (1.05 - k) / 0.45));
    if (titleAlpha > 0.02) {
      ctx.font = '600 30px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of L.petals) {
        const rr = BASE_R + p.length + TITLE_PAD;
        const px = Math.cos(p.theta) * rr;
        const py = Math.sin(p.theta) * rr;
        let rot = p.theta;
        if (Math.cos(p.theta) < 0) rot += Math.PI;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);
        ctx.fillStyle = `rgba(${rgbMap[p.type]},${0.88 * titleAlpha})`;
        ctx.fillText(`${typeLabelMap[p.type]} · ${p.count}`, 0, 0);
        ctx.restore();
      }
    }

    /* 6. 莲心徽记 */
    const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 170);
    halo.addColorStop(0, 'rgba(230,190,100,0.30)');
    halo.addColorStop(1, 'rgba(230,190,100,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(230,190,100,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 132, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(240,200,110,0.85)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#e8c268';
    ctx.font = '700 118px "Noto Serif SC","STSong","SimSun",serif';
    ctx.fillText('禅', 0, 6);
    ctx.shadowBlur = 0;
    ctx.font = '500 20px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(232,194,104,0.5)';
    ctx.fillText('一花开五叶 · chanzong.space', 0, 100);
  }

  /* ----- 视图操作 ----- */

  const clampK = (k: number) => Math.min(4, Math.max(0.1, k));

  function zoomAt(mx: number, my: number, factor: number) {
    const view = viewRef.current;
    const k2 = clampK(view.k * factor);
    const ratio = k2 / view.k;
    view.x = mx - (mx - view.x) * ratio;
    view.y = my - (my - view.y) * ratio;
    view.k = k2;
    schedule();
  }

  function fitView(animate = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = sizeRef.current.w || canvas.clientWidth;
    const ch = sizeRef.current.h || canvas.clientHeight;
    const L = layoutRef.current;
    const maxLen = L.petals.reduce((m, p) => Math.max(m, p.length), 0);
    const worldR = BASE_R + maxLen + TITLE_PAD + 60;
    const k = clampK(Math.min(cw, ch) / (worldR * 2.1));
    const target = { x: cw / 2, y: ch / 2, k };
    if (!animate) {
      viewRef.current = target;
      schedule();
      return;
    }
    const from = { ...viewRef.current };
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / 420);
      const e = 1 - Math.pow(1 - t, 3);
      viewRef.current = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        k: from.k + (target.k - from.k) * e,
      };
      schedule();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function hitTest(clientX: number, clientY: number): number {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const view = viewRef.current;
    const L = layoutRef.current;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < L.nodes.length; i++) {
      const n = L.nodes[i];
      const sx = n.x * view.k + view.x;
      const sy = n.y * view.k + view.y;
      const dx = sx - px, dy = sy - py;
      const d = dx * dx + dy * dy;
      const rr = Math.max(n.r * view.k + 3, 9);
      if (d <= rr * rr && d < bestD) {
        best = i;
        bestD = d;
      }
    }
    return best;
  }

  function setHover(idx: number) {
    if (hoverRef.current === idx) return;
    hoverRef.current = idx;
    const L = layoutRef.current;
    const neighbors = new Set<number>();
    const links = new Set<number>();
    if (idx >= 0) {
      (L.nodeLinks[idx] || []).forEach((li) => {
        links.add(li);
        neighbors.add(L.links[li].a);
        neighbors.add(L.links[li].b);
      });
      neighbors.delete(idx);
    }
    neighborRef.current = neighbors;
    hoverLinkRef.current = links;
    schedule();
  }

  const activateZoom = () => {
    if (!zoomOnRef.current) {
      zoomOnRef.current = true;
      setZoomOn(true);
    }
  };

  const deactivateZoom = () => {
    if (zoomOnRef.current) {
      zoomOnRef.current = false;
      setZoomOn(false);
    }
  };

  /* ----- 生命周期 ----- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (!userTouchedRef.current) fitView();
      else schedule();
    };
    resize();
    fitView();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* 指针交互：拖拽平移 / 双指缩放 / 点击节点跳转 / 点击空白激活缩放 */
    const pointers = new Map<number, { x: number; y: number }>();
    let dragDist = 0;
    let pinchPrev: { dist: number; midX: number; midY: number } | null = null;

    const localPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, localPos(e));
      dragDist = 0;
      pinchPrev = null;
      canvas.setPointerCapture(e.pointerId);
      if (pointers.size === 1) canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      const pos = localPos(e);

      if (pointers.size === 0) {
        // 悬停命中检测 + tooltip 位置
        const idx = hitTest(e.clientX, e.clientY);
        setHover(idx);
        canvas.style.cursor = idx >= 0 ? 'pointer' : 'grab';
        const tip = tooltipRef.current;
        if (tip) {
          if (idx >= 0) {
            const n = layoutRef.current.nodes[idx];
            tip.style.left = `${e.clientX + 16}px`;
            tip.style.top = `${e.clientY + 16}px`;
            if (tip.dataset.idx !== String(idx)) {
              tip.dataset.idx = String(idx);
              const nameEl = tip.querySelector('[data-name]');
              const descEl = tip.querySelector('[data-desc]');
              if (nameEl) nameEl.textContent = n.name;
              if (descEl) descEl.textContent = n.desc;
              const dot = tip.querySelector('[data-dot]') as HTMLElement | null;
              if (dot) dot.style.backgroundColor = colorMap[n.type];
              const tagEl = tip.querySelector('[data-type]');
              if (tagEl) tagEl.textContent = typeLabelMap[n.type] || n.type;
              tip.style.opacity = '1';
            }
          } else if (tip.dataset.idx) {
            tip.dataset.idx = '';
            tip.style.opacity = '0';
          }
        }
        return;
      }

      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, pos);

      if (pointers.size === 1) {
        const view = viewRef.current;
        view.x += pos.x - prev.x;
        view.y += pos.y - prev.y;
        dragDist += Math.abs(pos.x - prev.x) + Math.abs(pos.y - prev.y);
        userTouchedRef.current = true;
        schedule();
      } else if (pointers.size === 2) {
        const [p1, p2] = Array.from(pointers.values());
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        if (pinchPrev) {
          const view = viewRef.current;
          const ratio = clampK(view.k * (dist / pinchPrev.dist)) / view.k;
          view.x = midX - (midX - view.x) * ratio + (midX - pinchPrev.midX);
          view.y = midY - (midY - view.y) * ratio + (midY - pinchPrev.midY);
          view.k *= ratio;
          userTouchedRef.current = true;
          schedule();
        }
        pinchPrev = { dist, midX, midY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasClick = pointers.size === 1 && dragDist < 6;
      pointers.delete(e.pointerId);
      pinchPrev = null;
      canvas.style.cursor = 'grab';
      if (wasClick) {
        const idx = hitTest(e.clientX, e.clientY);
        if (idx >= 0) {
          router.push(layoutRef.current.nodes[idx].url);
        } else {
          activateZoom(); // 点击空白：开启滚轮缩放模式
        }
      } else if (dragDist >= 6) {
        activateZoom(); // 拖拽过图谱后同样开启滚轮缩放
      }
    };

    // 浏览器接管手势（如单指竖向滚动页面）时仅清理状态，不触发点击
    const onPointerCancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchPrev = null;
      dragDist = Infinity;
      canvas.style.cursor = 'grab';
    };

    const onPointerLeave = () => {
      setHover(-1);
      const tip = tooltipRef.current;
      if (tip && tip.dataset.idx) {
        tip.dataset.idx = '';
        tip.style.opacity = '0';
      }
    };

    /* 滚轮：默认放行页面滚动；激活后或 Ctrl（含触控板捏合）时缩放 */
    const onWheel = (e: WheelEvent) => {
      if (!zoomOnRef.current && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      userTouchedRef.current = true;
      const rect = canvas.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.006 : 0.0018)));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deactivateZoom();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);

    schedule();

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化：重建布局并动画回到全景
  useEffect(() => {
    setHover(-1);
    fitView(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const toggleType = (t: string) => {
    setVisible((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  const handleZoomIn = () => {
    userTouchedRef.current = true;
    activateZoom();
    zoomAt(sizeRef.current.w / 2, sizeRef.current.h / 2, 1.35);
  };

  const handleZoomOut = () => {
    userTouchedRef.current = true;
    activateZoom();
    zoomAt(sizeRef.current.w / 2, sizeRef.current.h / 2, 0.74);
  };

  const handleReset = () => {
    userTouchedRef.current = false;
    activateZoom();
    fitView(true);
  };

  const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[75vh] min-h-[540px] md:h-[82vh] md:min-h-[620px] bg-[#0B1329] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
    >
      <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: 'pan-y', cursor: 'grab' }} />

      {/* 分类筛选（右上角） */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2 max-w-[65%]">
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
            {typeLabelMap[t]} {COUNTS[t]}
          </button>
        ))}
      </div>

      {/* 缩放控制（左上角） */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 active:scale-95"
          title="放大图谱"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 active:scale-95"
          title="缩小图谱"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="w-5 h-px bg-slate-200 my-0.5 mx-auto" />
        <button
          onClick={handleReset}
          className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 active:scale-95"
          title="复位莲花全景"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 滚轮模式提示（底部居中）：默认滚轮滚动页面，点击图谱后滚轮缩放 */}
      <button
        onClick={() => (zoomOn ? deactivateZoom() : activateZoom())}
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-md transition-all shadow-lg ${
          zoomOn
            ? 'bg-amber-500/90 border-amber-300 text-amber-950'
            : 'bg-black/55 border-white/15 text-white/85 hover:bg-black/70'
        }`}
        title={zoomOn ? '退出滚轮缩放模式' : '开启滚轮缩放模式'}
      >
        {zoomOn ? (
          <X className="w-4 h-4 shrink-0" />
        ) : (
          <MousePointerClick className="w-4 h-4 shrink-0" />
        )}
        <span className="text-xs font-bold leading-tight text-left">
          {zoomOn
            ? '滚轮缩放已开启 · 按 Esc 退出'
            : isCoarse
              ? '双指缩放图谱 · 单指上下滑动滚动页面'
              : '滚轮缩放未开启 · 点击图谱激活（Ctrl+滚轮随时缩放）'}
        </span>
      </button>

      {/* 悬停信息卡 */}
      <div
        ref={tooltipRef}
        data-idx=""
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'rgba(11,19,41,0.95)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'white',
          zIndex: 50,
          pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          maxWidth: '320px',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span data-dot className="w-2.5 h-2.5 rounded-full shrink-0" />
          <span data-name className="font-bold text-base truncate" />
          <span data-type className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 shrink-0" />
        </div>
        <div data-desc className="text-sm text-white/70 mt-2" />
      </div>
    </div>
  );
};
