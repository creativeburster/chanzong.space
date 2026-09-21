'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { Network, ExternalLink, Sparkles, Compass, Tag, BookOpen, MessageSquare, Users, RotateCcw } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_PERSONS } from '@/lib/taxonomy/persons';
import { ZEN_CONCEPTS } from '@/lib/taxonomy/concepts';
import { ZEN_METHODS } from '@/lib/taxonomy/methods';
import { ZEN_KOANS } from '@/lib/taxonomy/koans';
import { useLang } from '@/context/LangContext';

export interface EntityMiniGraphProps {
  entityId: string;
  entityName: string;
  entityType: 'person' | 'concept' | 'method' | 'book' | 'koan';
  title?: string;
  relatedPersons?: string[];
  relatedConcepts?: string[];
  relatedBooks?: string[];
  relatedMethods?: string[];
  className?: string;
}

interface MiniNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'center' | 'person' | 'concept' | 'book' | 'method' | 'koan';
  url: string;
  desc: string;
  isCenter?: boolean;
}

interface MiniLink extends d3.SimulationLinkDatum<MiniNode> {
  source: string | MiniNode;
  target: string | MiniNode;
  relation: string;
}

// 统一配色方案
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  center: { label: '当前中枢', color: '#B45309', bg: '#FEF3C7', border: '#F59E0B', icon: '🌟' },
  person: { label: '相关祖师', color: '#0369A1', bg: '#E0F2FE', border: '#7DD3FC', icon: '👤' },
  concept: { label: '相关概念', color: '#7E22CE', bg: '#F3E8FF', border: '#D8B4FE', icon: '🏷️' },
  book: { label: '相关经典', color: '#BE123C', bg: '#FFE4E6', border: '#FDA4AF', icon: '📚' },
  method: { label: '相关法门', color: '#0F766E', bg: '#CCFBF1', border: '#5EEAD4', icon: '🧘' },
  koan: { label: '相关公案', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', icon: '❓' },
};

export const EntityMiniGraph: React.FC<EntityMiniGraphProps> = ({
  entityId,
  entityName,
  entityType,
  title,
  relatedPersons = [],
  relatedConcepts = [],
  relatedBooks = [],
  relatedMethods = [],
  className = '',
}) => {
  const { t, getHref } = useLang();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<MiniNode | null>(null);

  // 1. 构建以当前实体为中心的卫星节点网络
  const graphData = useMemo(() => {
    const centerNode: MiniNode = {
      id: entityId,
      name: entityName,
      type: 'center',
      url: '#',
      desc: title || t('当前浏览条目中枢'),
      isCenter: true,
    };

    const nodes: MiniNode[] = [centerNode];
    const links: MiniLink[] = [];
    const addedIds = new Set<string>([entityId]);

    // 1.1 关联祖师
    relatedPersons.forEach((pid) => {
      if (addedIds.has(pid)) return;
      const p = ZEN_PERSONS.find((x) => x.id === pid);
      if (p) {
        addedIds.add(pid);
        nodes.push({
          id: p.id,
          name: p.name,
          type: 'person',
          url: `/persons/${p.id}`,
          desc: `${p.title} · ${p.era}`,
        });
        links.push({ source: entityId, target: p.id, relation: '法脉' });
      }
    });

    // 1.2 关联概念
    relatedConcepts.forEach((cid) => {
      if (addedIds.has(cid)) return;
      const c = ZEN_CONCEPTS.find((x) => x.id === cid);
      if (c) {
        addedIds.add(cid);
        nodes.push({
          id: c.id,
          name: c.title,
          type: 'concept',
          url: `/concepts/${c.id}`,
          desc: c.category,
        });
        links.push({ source: entityId, target: c.id, relation: '阐扬' });
      }
    });

    // 1.3 关联经典
    relatedBooks.forEach((bid) => {
      if (addedIds.has(bid)) return;
      const b = manifest.find((x) => x.id === bid);
      if (b) {
        addedIds.add(bid);
        nodes.push({
          id: b.id,
          name: b.title.length > 8 ? b.title.slice(0, 8) + '…' : b.title,
          type: 'book',
          url: `/classics/${b.id}`,
          desc: `${b.author} · ${b.category}`,
        });
        links.push({ source: entityId, target: b.id, relation: '著述' });
      }
    });

    // 1.4 关联法门
    relatedMethods.forEach((mid) => {
      if (addedIds.has(mid)) return;
      const m = ZEN_METHODS.find((x) => x.id === mid);
      if (m) {
        addedIds.add(mid);
        nodes.push({
          id: m.id,
          name: m.title,
          type: 'method',
          url: `/methods/${m.id}`,
          desc: m.summary?.slice(0, 24) || '',
        });
        links.push({ source: entityId, target: m.id, relation: '修持' });
      }
    });

    // 1.5 关联公案（最多引入 2-3 则代表性公案，避免画面过度拥挤）
    const matchedKoans = ZEN_KOANS.filter(
      (k) =>
        k.relatedPersons?.includes(entityId) ||
        k.relatedConcepts?.includes(entityId) ||
        k.relatedBooks?.includes(entityId)
    ).slice(0, 3);

    matchedKoans.forEach((k) => {
      if (addedIds.has(k.id)) return;
      addedIds.add(k.id);
      nodes.push({
        id: k.id,
        name: k.question.length > 7 ? k.question.slice(0, 7) + '…' : k.question,
        type: 'koan',
        url: `/koan/${k.id}`,
        desc: `${k.master} · 机锋问答`,
      });
      links.push({ source: entityId, target: k.id, relation: '机锋' });
    });

    return { nodes, links };
  }, [entityId, entityName, entityType, title, relatedPersons, relatedConcepts, relatedBooks, relatedMethods, t]);

  // 2. D3 力导向仿真渲染
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = 340;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // 宣纸点阵底纹
    const pattern = defs.append('pattern')
      .attr('id', 'mini-graph-grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 1.0)
      .attr('fill', '#E5DECE')
      .attr('opacity', 0.6);

    // 柔和投影
    const filter = defs.append('filter')
      .attr('id', 'mini-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '2.5')
      .attr('flood-color', '#0F172A')
      .attr('flood-opacity', '0.08');

    // 画布背景
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#FAF9F6');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#mini-graph-grid)');

    const g = svg.append('g').attr('class', 'mini-viewport');

    const cx = width / 2;
    const cy = height / 2;

    // 深拷贝数据供仿真使用
    const simNodes: MiniNode[] = graphData.nodes.map((d) => ({
      ...d,
      fx: d.isCenter ? cx : undefined,
      fy: d.isCenter ? cy : undefined,
    }));
    const simLinks: MiniLink[] = graphData.links.map((d) => ({ ...d }));

    // 连线图层
    const linkGroup = g.append('g').attr('class', 'mini-links');
    const linkElements = linkGroup.selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: any) => (d.relation === '机锋' ? '3,3' : 'none'));

    // 节点图层
    const nodeGroup = g.append('g').attr('class', 'mini-nodes');
    const nodeElements = nodeGroup.selectAll('g.mini-node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'mini-node')
      .attr('cursor', (d) => (d.isCenter ? 'default' : 'pointer'))
      .on('click', (event, d) => {
        if (!d.isCenter && d.url && d.url !== '#') {
          router.push(getHref(d.url));
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        // 高亮相关连线
        linkElements
          .attr('stroke', (l: any) => {
            if (l.source.id === d.id || l.target.id === d.id) {
              return TYPE_CONFIG[d.type]?.color || '#B45309';
            }
            return '#E2E8F0';
          })
          .attr('stroke-width', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 2.2 : 1))
          .attr('stroke-opacity', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.3));
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        linkElements
          .attr('stroke', '#CBD5E1')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.85);
      });

    // 绘制中心节点特殊样式（大号宋雅圆角卡片）
    nodeElements.filter((d) => Boolean(d.isCenter)).each(function (d) {
      const el = d3.select(this);
      // 外发光环
      el.append('circle')
        .attr('r', 44)
        .attr('fill', '#FEF3C7')
        .attr('opacity', 0.4)
        .attr('class', 'animate-pulse');

      // 主体药丸卡片
      const w = 110;
      const h = 42;
      el.append('rect')
        .attr('x', -w / 2)
        .attr('y', -h / 2)
        .attr('width', w)
        .attr('height', h)
        .attr('rx', 21)
        .attr('ry', 21)
        .attr('fill', '#78350F')
        .attr('stroke', '#FDE68A')
        .attr('stroke-width', 2)
        .attr('filter', 'url(#mini-shadow)');

      // 居中文本
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('y', 0)
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-serif-zen, serif)')
        .attr('fill', '#FEF3C7')
        .text(t(d.name));
    });

    // 绘制卫星节点样式（精巧圆角胶囊）
    nodeElements.filter((d) => !d.isCenter).each(function (d) {
      const el = d3.select(this);
      const conf = TYPE_CONFIG[d.type] || TYPE_CONFIG.concept;
      const textLen = d.name.length;
      const cardW = Math.max(76, textLen * 13 + 30);
      const cardH = 28;

      // 卡片底色
      el.append('rect')
        .attr('x', -cardW / 2)
        .attr('y', -cardH / 2)
        .attr('width', cardW)
        .attr('height', cardH)
        .attr('rx', 14)
        .attr('ry', 14)
        .attr('fill', conf.bg)
        .attr('stroke', conf.border)
        .attr('stroke-width', 1.2)
        .attr('filter', 'url(#mini-shadow)')
        .attr('class', 'transition-transform hover:scale-105');

      // 小图标
      el.append('text')
        .attr('x', -cardW / 2 + 12)
        .attr('y', 0)
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10px')
        .text(conf.icon);

      // 名称文本
      el.append('text')
        .attr('x', -cardW / 2 + 25)
        .attr('y', 0)
        .attr('dominant-baseline', 'central')
        .attr('font-size', '11.5px')
        .attr('font-weight', '600')
        .attr('font-family', 'var(--font-serif-zen, serif)')
        .attr('fill', conf.color)
        .text(t(d.name));
    });

    // 拖拽支持
    const drag = d3.drag<SVGGElement, MiniNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        if (!d.isCenter) {
          d.fx = null;
          d.fy = null;
        }
      });

    nodeElements.call(drag as any);

    // 力导向仿真配置
    const simulation = d3.forceSimulation<MiniNode>(simNodes)
      .force('link', d3.forceLink<MiniNode, MiniLink>(simLinks).id((d) => d.id).distance(105).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-160))
      .force('collide', d3.forceCollide<MiniNode>().radius(46).strength(0.85))
      .force('center', d3.forceCenter(cx, cy).strength(0.08))
      .alphaDecay(0.045);

    simulation.on('tick', () => {
      // 边界约束，避免飞出画布
      simNodes.forEach((n) => {
        if (!n.isCenter) {
          n.x = Math.max(50, Math.min(width - 50, n.x || cx));
          n.y = Math.max(25, Math.min(height - 25, n.y || cy));
        }
      });

      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d) => `translate(${d.x || cx},${d.y || cy})`);
    });

    // 1.5 秒后平滑停靠防抖
    const timer = setTimeout(() => {
      simulation.stop();
    }, 1500);

    return () => {
      simulation.stop();
      clearTimeout(timer);
    };
  }, [graphData, t, router, getHref]);

  // 全景大图谱直达链接
  const fullGraphUrl = getHref(`/graph?focus=${entityId}&type=${entityType}`);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4 select-none relative overflow-hidden ${className}`}>
      {/* 顶栏：标题与直达全景大图谱按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold mb-1">
            <Network className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('知识图谱 · 局部关系星系')}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-serif-zen text-slate-900 flex items-center gap-2">
            <span>{t('以')}「{t(entityName)}」{t('为中枢的法界关联网')}</span>
          </h3>
        </div>

        {/* 直达全景大图谱按钮 */}
        <Link
          prefetch={false}
          href={fullGraphUrl}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold font-serif-zen shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95 group"
          title={t('在全景大图谱中对焦此节点')}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span>{t('查看全景知识大图谱')}</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-300 ml-0.5" />
        </Link>
      </div>

      {/* 提示文案与当前悬浮信息 */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {hoveredNode && !hoveredNode.isCenter ? (
            <span className="text-amber-900 font-medium">
              👉 {t('点击')} <strong className="underline">{t(hoveredNode.name)}</strong> {t('可直达具体详情页')}：{t(hoveredNode.desc)}
            </span>
          ) : (
            t('提示：节点支持任意拖拽交互 · 点击卫星节点可直接跳转对应条目')
          )}
        </span>

        <span className="text-[11px] font-mono text-stone-400 shrink-0">
          {t('共关联')} {graphData.nodes.length - 1} {t('个法宝条目')}
        </span>
      </div>

      {/* D3 SVG 画布容器 */}
      <div
        ref={containerRef}
        className="w-full h-[340px] rounded-2xl bg-[#FAF9F6] border border-amber-900/10 overflow-hidden relative shadow-inner"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* 底部图例栏 */}
      <div className="flex items-center justify-center gap-4 flex-wrap pt-1 text-xs text-slate-600">
        {Object.entries(TYPE_CONFIG)
          .filter(([key]) => key !== 'center')
          .map(([key, conf]) => (
            <div key={key} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
              <span className="text-[11px] font-medium">{t(conf.label)}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
