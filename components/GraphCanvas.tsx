'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw, ZoomIn, ZoomOut, MoveVertical } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  url: string;
  desc: string;
  r?: number;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  relation: string;
}

const colorMap: Record<string, string> = {
  person: '#74b9ff',
  book: '#fd79a8',
  concept: '#e0aaff',
  method: '#4ecdc4',
  koan: '#ffd700',
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
]);

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

  allNodes.forEach((n) => {
    const d = degree.get(n.id) || 0;
    const base = baseRadiusMap[n.type] || 10;
    n.r = Math.min(base * 3.2, base + d * 2.8);
  });

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

  return { allNodes, allLinks: allLinks.filter((l) => keptLinks.has(l)) };
}

// 图数据为静态内容：模块级只构建一次（此前每次渲染/筛选计数都重复整建，是重大性能损耗点）
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

  const [visible, setVisible] = useState<Record<string, boolean>>({
    person: true,
    book: true,
    concept: true,
    method: true,
    koan: true,
  });

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  // tooltip 直接操作 DOM：避免鼠标移动触发 React 整组件重渲染
  const showTooltip = (event: { clientX: number; clientY: number }, d: NodeData) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.style.left = `${event.clientX + 15}px`;
    tip.style.top = `${event.clientY + 15}px`;
    const nameEl = tip.querySelector('[data-name]');
    const descEl = tip.querySelector('[data-desc]');
    const tagEl = tip.querySelector('[data-type]');
    const dotEl = tip.querySelector('[data-dot]') as HTMLElement | null;
    if (nameEl) nameEl.textContent = d.name;
    if (descEl) descEl.textContent = d.desc;
    if (tagEl) tagEl.textContent = typeLabelMap[d.type] || d.type;
    if (dotEl) dotEl.style.backgroundColor = colorMap[d.type];
    tip.style.opacity = '1';
  };

  const moveTooltip = (event: { clientX: number; clientY: number }) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.style.left = `${event.clientX + 15}px`;
    tip.style.top = `${event.clientY + 15}px`;
  };

  const hideTooltip = () => {
    const tip = tooltipRef.current;
    if (tip) tip.style.opacity = '0';
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 860;
    const height = containerRef.current.clientHeight || 650;

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

    const g = svg.append('g').attr('class', 'main-zoom-layer');

    // D3 Zoom 缩放配置（平滑阻尼，直接滚轮缩放图谱，极速流畅）
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .wheelDelta((event) => -event.deltaY * 0.002)
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    /* ---- filter nodes/links by active types ---- */
    const { allNodes, allLinks } = GRAPH_DATA;
    const nodesData = allNodes.filter((n) => visible[n.type]);
    const visibleIds = new Set(nodesData.map((n) => n.id));
    const linksData = allLinks.filter((l) => visibleIds.has(l.source as string) && visibleIds.has(l.target as string));

    const nodesWithLinks = new Set<string>();
    linksData.forEach(l => {
      nodesWithLinks.add(l.source as string);
      nodesWithLinks.add(l.target as string);
    });

    const finalNodesData = nodesData.filter(n => nodesWithLinks.has(n.id));

    const nodes: NodeData[] = finalNodesData.map(d => ({
      ...d,
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height / 2 + (Math.random() - 0.5) * 120,
    }));
    const links: LinkData[] = linksData.map(d => ({ ...d }));

    // 高性能力导向仿真（快速收敛）
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(60).strength(0.65))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('x', d3.forceX(width / 2).strength(0.15))
      .force('y', d3.forceY(height / 2).strength(0.15))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<NodeData>().radius(d => nodeRadius(d) + 7).strength(0.75))
      .alphaDecay(0.045);

    currentNodesRef.current = nodes;

    // Web lines group
    const webLinesGroup = g.append('g').attr('class', 'web-lines');

    /* 连线性能优化：全部常态连线合并为一条 path，悬停高亮用另一条叠加 path。
       此前为数千个 <line> 元素逐 tick 写属性（每帧 8000+ 次 DOM 写入），是卡顿主因之一。
       视觉等效：常态线平时隐藏，悬停时高亮相关连线，与原版一致。 */
    const linkPath = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.16)')
      .attr('stroke-width', 1.2)
      .style('opacity', 0);

    const linkHighlight = g.append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 2.5)
      .style('opacity', 0);

    const updateLinkPath = () => {
      let d = '';
      for (let i = 0; i < links.length; i++) {
        const s = links[i].source as NodeData;
        const t = links[i].target as NodeData;
        d += `M${s.x ?? width / 2},${s.y ?? height / 2}L${t.x ?? width / 2},${t.y ?? height / 2}`;
      }
      linkPath.attr('d', d);
    };
    updateLinkPath();

    /* 关系标签性能优化：不再为每条连线常驻一个隐藏 <text>（每 tick 徒劳更新坐标），
       只在悬停时为相关的少数连线按需创建，并仅在可见期间跟随 tick 更新。 */
    const linkLabelGroup = g.append('g')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255, 255, 255, 0.85)')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    let activeLabels: LinkData[] = [];
    const positionActiveLabels = () => {
      if (!activeLabels.length) return;
      linkLabelGroup
        .selectAll<SVGTextElement, LinkData>('text')
        .data(activeLabels, (l) => `${(l.source as NodeData).id}->${(l.target as NodeData).id}`)
        .join('text')
        .text((l) => l.relation)
        .attr('x', (l) => (((l.source as NodeData).x ?? 0) + ((l.target as NodeData).x ?? 0)) / 2)
        .attr('y', (l) => (((l.source as NodeData).y ?? 0) + ((l.target as NodeData).y ?? 0)) / 2 - 4);
    };

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`);

    node.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => colorMap[d.type] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    node.append('text')
      .text(d => d.name)
      .attr('font-size', '13px')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeRadius(d) + 14)
      .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none');

    // Drag interaction
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

    node.on('mouseover', (event, d: any) => {
      d3.select(event.currentTarget).select('circle')
        .transition().duration(200)
        .attr('r', nodeRadius(d) + 5);

      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(d.id);

      links.forEach(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === d.id) { connectedNodeIds.add(targetId); return; }
        if (targetId === d.id) { connectedNodeIds.add(sourceId); return; }
      });

      node.style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.12);

      // 高亮连线（含邻接节点之间的连线，与原逻辑一致）合并为一条 path 一次性写入
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

      showTooltip(event, d);
    })
    .on('mousemove', (event) => {
      moveTooltip(event);
    })
    .on('mouseout', () => {
      node.style('opacity', 1);
      node.selectAll('circle')
        .transition().duration(200)
        .attr('r', (n: any) => nodeRadius(n));
      linkHighlight.style('opacity', 0);
      activeLabels = [];
      linkLabelGroup.selectAll('text').remove();
      webLinesGroup.selectAll('line').remove();
      hideTooltip();
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
      updateLinkPath();
      positionActiveLabels();
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // 仿真 2.2 秒后自动居中并冻结物理计算，彻底释放 CPU
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
        const pad = 60;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.1, Math.max(0.35, Math.min(width / bw, height / bh)));
        const fitX = width / 2 - fitScale * (minX + maxX) / 2;
        const fitY = height / 2 - fitScale * (minY + maxY) / 2;
        if (isFinite(fitX) && isFinite(fitY) && isFinite(fitScale)) {
          svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.translate(fitX, fitY).scale(fitScale));
        }
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
      const width = containerRef.current.clientWidth || 860;
      const height = containerRef.current.clientHeight || 650;
      const nodes = currentNodesRef.current;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined && isFinite(n.x) && isFinite(n.y)) {
          minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
        }
      });

      if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
        const pad = 60;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.1, Math.max(0.35, Math.min(width / bw, height / bh)));
        const fitX = width / 2 - fitScale * (minX + maxX) / 2;
        const fitY = height / 2 - fitScale * (minY + maxY) / 2;
        if (isFinite(fitX) && isFinite(fitY) && isFinite(fitScale)) {
          svgRef.current.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity.translate(fitX, fitY).scale(fitScale));
        }
      } else {
        svgRef.current.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
      }
    }
  };

  return (
    <div className="relative w-full flex items-start gap-4">
      {/* 1. 黑色背景主图谱卡片（保持经典完整星团，右侧留出空白区） */}
      <div
        className="relative flex-1 h-[75vh] min-h-[540px] md:h-[86vh] md:min-h-[660px] bg-[#0B1329] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        ref={containerRef}
      >
        {/* Filter chips (右上角分类筛选) */}
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
      </div>

      {/* 2. 右侧空白区域的竖排悬浮操作面板与页面滚动提示 */}
      <div className="sticky top-28 flex flex-col items-center space-y-3 z-30 py-2">
        {/* 缩放与复位按钮组 */}
        <div className="flex flex-col items-center space-y-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl">
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
          <div className="w-5 h-px bg-slate-200 my-0.5" />
          <button
            onClick={handleReset}
            className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 active:scale-95"
            title="复位图谱全貌"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* 页面滚动指引提示 */}
        <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-amber-50/90 border border-amber-200 text-[10px] text-amber-900 max-w-[84px] shadow-sm leading-tight">
          <MoveVertical className="w-4 h-4 text-amber-700 animate-bounce mb-1" />
          <span className="font-medium">鼠标指针放此处滚动整页</span>
        </div>
      </div>

      {/* 3. 悬浮 Tooltip（直接 DOM 更新，避免鼠标移动触发 React 重渲染） */}
      <div
        ref={tooltipRef}
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
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span data-dot className="w-2.5 h-2.5 rounded-full" />
          <span data-name className="font-bold text-base" />
          <span data-type className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 ml-2" />
        </div>
        <div data-desc className="text-sm text-white/70 mt-2" />
      </div>
    </div>
  );
};
