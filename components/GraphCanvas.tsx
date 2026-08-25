'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
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

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

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

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    /* ---- filter nodes/links by active types ---- */
    const { allNodes, allLinks } = getGraphData();
    const nodesData = allNodes.filter((n) => visible[n.type]);
    const visibleIds = new Set(nodesData.map((n) => n.id));
    const linksData = allLinks.filter((l) => visibleIds.has(l.source as string) && visibleIds.has(l.target as string));

    // 过滤掉没有任何连线的孤立节点，防止它们飘到屏幕外成为“多余元素”
    const nodesWithLinks = new Set<string>();
    linksData.forEach(l => {
      nodesWithLinks.add(l.source as string);
      nodesWithLinks.add(l.target as string);
    });
    
    const finalNodesData = nodesData.filter(n => nodesWithLinks.has(n.id));

    // 预先将节点坐标初始化在画布中央范围，防止 D3 默认赋给 (7.07, 0) 近原点坐标而落在左上角按钮区
    const nodes: NodeData[] = finalNodesData.map(d => ({
      ...d,
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height / 2 + (Math.random() - 0.5) * 80,
    }));
    const links: LinkData[] = linksData.map(d => ({ ...d }));

    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(65).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-90))
      .force('x', d3.forceX(width / 2).strength(0.12))
      .force('y', d3.forceY(height / 2).strength(0.12))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<NodeData>().radius(d => nodeRadius(d) + 8).strength(0.8))
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
      .attr('x1', d => (d.source as NodeData).x ?? width / 2)
      .attr('y1', d => (d.source as NodeData).y ?? height / 2)
      .attr('x2', d => (d.target as NodeData).x ?? width / 2)
      .attr('y2', d => (d.target as NodeData).y ?? height / 2)
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
      .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.8)');

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
      d3.select(event.currentTarget).select('circle')
        .transition().duration(200)
        .attr('r', nodeRadius(d) + 5);

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
        .attr('r', (n: any) => nodeRadius(n));
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
        const pad = 60;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.1, Math.max(0.35, Math.min(width / bw, height / bh)));
        const fitX = width / 2 - fitScale * (minX + maxX) / 2;
        const fitY = height / 2 - fitScale * (minY + maxY) / 2;
        if (isFinite(fitX) && isFinite(fitY) && isFinite(fitScale)) {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(fitX, fitY).scale(fitScale));
        }
      }
    }, 2800);

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
      svgRef.current.transition().duration(500).call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current.transition().duration(500).call(zoomRef.current.scaleBy, 0.7);
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
        const pad = 60;
        const bw = maxX - minX + pad * 2 || width;
        const bh = maxY - minY + pad * 2 || height;
        const fitScale = Math.min(1.1, Math.max(0.35, Math.min(width / bw, height / bh)));
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
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-transparent border-white/10 text-white/35 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorMap[t], opacity: visible[t] ? 1 : 0.3 }} />
            {typeLabelMap[t]} {countByType(t)}
          </button>
        ))}
      </div>

      {/* Controls Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={handleZoomIn} className="p-2 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-sm transition">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-sm transition">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleReset} className="p-2 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-sm transition">
          <RotateCcw size={18} />
        </button>
      </div>

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
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.color }} />
            <span className="font-bold text-base">{tooltip.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 ml-2">
              {tooltip.type}
            </span>
          </div>
          <div className="text-sm text-white/70 mt-2">{tooltip.desc}</div>
        </div>
      )}
    </div>
  );
};
