'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'person' | 'book' | 'concept' | 'method' | 'koan';
  url: string;
  desc: string;
  r?: number;
  petalIndex: number; // 0..7 (八瓣花瓣) 或 -1 (花蕊核心)
  targetX?: number;
  targetY?: number;
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
  person: 13,
  book: 11,
  concept: 9,
  method: 10,
  koan: 8,
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

// 八瓣莲花花瓣定义 (8 个对称花瓣方位)
// 0: 东 (0°) - 曹洞宗法门与宝镜三昧
// 1: 东南 (45°) - 云门法眼宗风与禅林清规
// 2: 南 (90°) - 南宗祖师法脉谱系
// 3: 西南 (135°) - 沩仰宗与心法开示
// 4: 西 (180°) - 临济宗、杨岐黄龙与看话公案
// 5: 西北 (225°) - 唯识唯心与如来藏
// 6: 北 (270°) - 般若波罗蜜与核心经论
// 7: 东北 (315°) - 禅净双修与圆觉实修
const PETAL_COUNT = 8;
const PETAL_DIST = 260; // 花瓣中心距花蕊距离

function assignLotusPetal(node: NodeData, index: number): number {
  // 核心心性、达摩、六祖等居于花蕊中心 (-1)
  const coreIds = new Set([
    'buddha-nature', 'self-nature', 'mind-is-buddha', 'prajna', 'emptiness',
    'huineng', 'bodhidharma', 'mazu', 'baizhang', 'huangbo', 'linji',
    'chuanxin-fayao', 'liuzutan-jing', 'jingang-jing', 'xinjing', 'wumen'
  ]);
  if (coreIds.has(node.id)) return -1;

  if (node.type === 'book') {
    // 经典著作居于上方花瓣 (北 6, 东北 7, 西北 5)
    return [6, 7, 5][index % 3];
  } else if (node.type === 'person') {
    // 历代祖师居于下方花瓣 (南 2, 东南 1, 西南 3)
    return [2, 1, 3][index % 3];
  } else if (node.type === 'method') {
    // 修持法门居于两翼花瓣 (东 0, 西 4)
    return [0, 4][index % 2];
  } else if (node.type === 'koan') {
    // 公案机锋居于四隅花瓣尖端 (1, 3, 5, 7)
    return [1, 3, 5, 7][index % 4];
  } else {
    // 概念均匀分布在 8 个花瓣中
    return index % 8;
  }
}

function getGraphData() {
  const allNodes: NodeData[] = [
    ...ZEN_PERSONS.map((p) => ({ id: p.id, name: p.name, type: 'person' as const, url: `/persons/${p.id}`, desc: `${p.title} · ${p.era}`, petalIndex: 2 })),
    ...manifest.map((b) => ({ id: b.id, name: shortLabel(b.title), type: 'book' as const, url: `/classics/${b.id}`, desc: `${b.author} · ${b.category}`, petalIndex: 6 })),
    ...ZEN_CONCEPTS.map((c) => ({ id: c.id, name: c.title, type: 'concept' as const, url: `/concepts/${c.id}`, desc: c.summary.slice(0, 50) + '…', petalIndex: 0 })),
    ...ZEN_METHODS.map((m) => ({ id: m.id, name: m.title, type: 'method' as const, url: `/methods/${m.id}`, desc: m.summary.slice(0, 50) + '…', petalIndex: 4 })),
    ...ZEN_KOANS.map((q) => ({ id: q.id, name: shortLabel(q.question, 7), type: 'koan' as const, url: `/koan/${q.id}`, desc: `${q.master} · ${q.source}`, petalIndex: 1 })),
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

  // 度数统计
  const degree = new Map<string, number>();
  allLinks.forEach((l) => {
    degree.set(l.source as string, (degree.get(l.source as string) || 0) + 1);
    degree.set(l.target as string, (degree.get(l.target as string) || 0) + 1);
  });

  allNodes.forEach((n, idx) => {
    const d = degree.get(n.id) || 0;
    const base = baseRadiusMap[n.type] || 10;
    n.r = Math.min(base * 2.8, base + Math.min(d, 8) * 2.0);
    n.petalIndex = assignLotusPetal(n, idx);
  });

  // 每个节点保留前 2 条最强关联，保证图谱轻盈利落
  const linksByNode = new Map<string, LinkData[]>();
  allLinks.forEach((l) => {
    [l.source as string, l.target as string].forEach((id) => {
      if (!linksByNode.has(id)) linksByNode.set(id, []);
      linksByNode.get(id)!.push(l);
    });
  });

  const keptLinks = new Set<LinkData>();
  linksByNode.forEach((arr) => {
    arr.slice(0, 2).forEach((l) => keptLinks.add(l));
  });

  return { allNodes, allLinks: allLinks.filter((l) => keptLinks.has(l)) };
}

export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 650;
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
      .style('will-change', 'transform');

    svgRef.current = svg;

    const defs = svg.append('defs');

    // 1. 金色莲花微光渐变
    const goldGrad = defs.append('linearGradient')
      .attr('id', 'lotus-gold-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffd700').attr('stop-opacity', 0.5);
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ff9f43').attr('stop-opacity', 0.1);

    // 2. 青莲微光渐变
    const cyanGrad = defs.append('radialGradient')
      .attr('id', 'lotus-center-glow')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    cyanGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255, 215, 0, 0.4)');
    cyanGrad.append('stop').attr('offset', '35%').attr('stop-color', 'rgba(78, 205, 196, 0.15)');
    cyanGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(11, 19, 41, 0)');

    const g = svg.append('g').attr('class', 'main-zoom-layer');

    // ==========================================
    // 底层：精美八瓣莲花曼陀罗（Lotus Mandala）
    // ==========================================
    const lotusGroup = g.append('g')
      .attr('class', 'lotus-mandala-group')
      .attr('transform', `translate(${cx}, ${cy})`)
      .style('pointer-events', 'none')
      .style('opacity', 0.45);

    // 中心光晕
    lotusGroup.append('circle')
      .attr('r', 320)
      .attr('fill', 'url(#lotus-center-glow)');

    // 八瓣金莲底图
    for (let i = 0; i < PETAL_COUNT; i++) {
      const angle = (i * 360) / PETAL_COUNT;
      lotusGroup.append('path')
        .attr('d', 'M 0 0 C -25 -60 -45 -140 0 -240 C 45 -140 25 -60 0 0 Z')
        .attr('transform', `rotate(${angle})`)
        .attr('fill', 'url(#lotus-gold-grad)')
        .attr('stroke', 'rgba(255, 215, 0, 0.35)')
        .attr('stroke-width', 1.2);
    }

    // 同心金环
    [75, 160, 260, 360].forEach((r, idx) => {
      lotusGroup.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', idx === 0 ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.08)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', idx % 2 === 1 ? '4,6' : 'none');
    });

    // 提示条 DOM 元素（直接 DOM 操作，不触发 React 渲染，零卡顿）
    const hintElement = document.getElementById('zen-graph-scroll-hint');

    const showScrollHint = () => {
      if (hintElement) {
        hintElement.style.opacity = '1';
        hintElement.style.transform = 'translate(-50%, 0)';
        setTimeout(() => {
          if (hintElement) {
            hintElement.style.opacity = '0';
            hintElement.style.transform = 'translate(-50%, -10px)';
          }
        }, 1800);
      }
    };

    // ==========================================
    // D3 Zoom 缩放配置（GPU 硬件加速与滚轮智能解耦）
    // ==========================================
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .filter((event) => {
        if (event.type === 'wheel') {
          const isZoomModifier = event.ctrlKey || event.metaKey;
          if (!isZoomModifier) {
            showScrollHint();
            return false; // 原生放行，页面丝滑滚动！
          }
          return true;
        }
        return !event.button;
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    /* ---- 节点与连线数据准备 ---- */
    const { allNodes, allLinks } = getGraphData();
    const nodesData = allNodes.filter((n) => visible[n.type]);
    const visibleIds = new Set(nodesData.map((n) => n.id));
    const linksData = allLinks.filter((l) => visibleIds.has(l.source as string) && visibleIds.has(l.target as string));

    // 计算 8 个花瓣的中心坐标
    const petalCenters: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const angle = (i * Math.PI * 2) / PETAL_COUNT;
      petalCenters.push({
        x: cx + Math.cos(angle) * PETAL_DIST,
        y: cy + Math.sin(angle) * PETAL_DIST,
      });
    }

    // 初始化节点位置：精准吸附在花瓣或花蕊
    const nodes: NodeData[] = nodesData.map((d, idx) => {
      let targetX = cx;
      let targetY = cy;
      if (d.petalIndex >= 0 && d.petalIndex < PETAL_COUNT) {
        const center = petalCenters[d.petalIndex];
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 85;
        targetX = center.x + Math.cos(angle) * rad;
        targetY = center.y + Math.sin(angle) * rad;
      } else {
        // 花蕊中心
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 55;
        targetX = cx + Math.cos(angle) * rad;
        targetY = cy + Math.sin(angle) * rad;
      }

      return {
        ...d,
        x: targetX + (Math.random() - 0.5) * 20,
        y: targetY + (Math.random() - 0.5) * 20,
        targetX,
        targetY,
      };
    });

    const links: LinkData[] = linksData.map(d => ({ ...d }));

    // 八瓣莲花花瓣吸附力（Lotus Petal Radial Attraction）
    const forceLotusPetal = (alpha: number) => {
      const k = alpha * 0.35;
      for (const n of nodes) {
        if (n.targetX !== undefined && n.targetY !== undefined) {
          n.vx = (n.vx || 0) + (n.targetX - (n.x || cx)) * k;
          n.vy = (n.vy || 0) + (n.targetY - (n.y || cy)) * k;
        }
      }
    };

    // 高效物理引擎（2.0秒内瞬间优雅收敛）
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(45).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('petal', forceLotusPetal)
      .force('collide', d3.forceCollide<NodeData>().radius(d => (d.r || 10) + 4).strength(0.7))
      .alphaDecay(0.045);

    // 绘制连线
    const link = g.append('g')
      .attr('class', 'links-layer')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1.0)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('x1', d => (d.source as NodeData).x ?? cx)
      .attr('y1', d => (d.source as NodeData).y ?? cy)
      .attr('x2', d => (d.target as NodeData).x ?? cx)
      .attr('y2', d => (d.target as NodeData).y ?? cy);

    // 绘制节点群
    const node = g.append('g')
      .attr('class', 'nodes-layer')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x ?? cx},${d.y ?? cy})`);

    // 外发光环
    node.append('circle')
      .attr('r', d => (d.r || 10) + 3)
      .attr('fill', 'none')
      .attr('stroke', d => colorMap[d.type] || '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);

    // 主实体球
    node.append('circle')
      .attr('r', d => d.r || 10)
      .attr('fill', d => colorMap[d.type] || '#ccc')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2);

    // 文字标签（使用单个类统一样式，不使用动态每帧重绘）
    node.append('text')
      .attr('class', 'node-label')
      .text(d => d.name)
      .attr('font-size', '11px')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r || 10) + 12)
      .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.95)')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // 拖拽
    const drag = d3.drag<SVGGElement, NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.15).restart();
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

    // 悬浮高亮与 Tooltip
    node.on('mouseenter', (event, d) => {
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(d.id);

      links.forEach(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === d.id) connectedNodeIds.add(targetId);
        if (targetId === d.id) connectedNodeIds.add(sourceId);
      });

      node.style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.15);
      link
        .style('stroke', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? colorMap[d.type] : 'rgba(255,255,255,0.03)')
        .style('stroke-width', l => (connectedNodeIds.has((l.source as NodeData).id) && connectedNodeIds.has((l.target as NodeData).id)) ? 2.5 : 1);

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
    .on('mouseleave', () => {
      node.style('opacity', 1);
      link.style('stroke', 'rgba(255, 255, 255, 0.15)').style('stroke-width', 1.0);
      setTooltip(prev => ({ ...prev, show: false }));
    })
    .on('click', (event, d) => {
      router.push(d.url);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x!)
        .attr('y1', d => (d.source as NodeData).y!)
        .attr('x2', d => (d.target as NodeData).x!)
        .attr('y2', d => (d.target as NodeData).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // 2.2 秒后停止仿真并自动优雅居中缩放
    const freezeTimer = setTimeout(() => {
      simulation.stop();
      if (svgRef.current && zoomRef.current) {
        svgRef.current.transition().duration(700).call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(cx * (1 - 0.72), cy * (1 - 0.72)).scale(0.72)
        );
      }
    }, 2200);

    return () => {
      clearTimeout(freezeTimer);
      simulation.stop();
      svg.remove();
    };
  }, [router, visible]);

  const toggleType = (t: string) => {
    setVisible((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 0.75);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth || 900;
      const h = containerRef.current.clientHeight || 650;
      svgRef.current.transition().duration(500).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(w * 0.14, h * 0.14).scale(0.72)
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#0B132B] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none">
      {/* 顶部工具栏与分类筛选 */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto">
          {FILTER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                visible[t]
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colorMap[t], opacity: visible[t] ? 1 : 0.4 }}
              />
              <span>{typeLabelMap[t]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px] text-amber-300/90 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>八瓣莲花曼陀罗 · Ctrl+滚轮缩放</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700/60 shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="放大 (或按住 Ctrl 向上滚动)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="缩小 (或按住 Ctrl 向下滚动)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="复位八瓣金莲全貌"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 滚轮操作提示浮层 (原生 DOM 切换，零 React 开销) */}
      <div
        id="zen-graph-scroll-hint"
        className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 opacity-0 -translate-y-2 bg-slate-900/90 text-amber-300 text-xs px-4 py-2 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center space-x-2"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>💡 提示：按住 <b>Ctrl</b> (或 ⌘) 滚动可缩放图谱，直接滚动可平滑浏览下方内容</span>
      </div>

      {/* 主画布容器 */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 节点悬浮 Tooltip 卡片 */}
      {tooltip.show && (
        <div
          className="fixed z-50 pointer-events-none p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: `${tooltip.x + 16}px`,
            top: `${tooltip.y + 16}px`,
          }}
        >
          <div className="flex items-center space-x-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="font-bold text-white text-sm font-serif-zen">{tooltip.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {tooltip.type}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed font-serif-zen text-[11px]">{tooltip.desc}</p>
          <div className="mt-2 text-[10px] text-amber-400/80 font-medium">点击即可前往详情页面 ➔</div>
        </div>
      )}
    </div>
  );
};
