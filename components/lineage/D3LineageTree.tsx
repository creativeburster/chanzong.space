'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { LineageNode, ZEN_LINEAGE_TREE, SECT_META } from '@/lib/lineageData';
import { useLang } from '@/context/LangContext';

interface D3LineageTreeProps {
  activeSect: string;
  searchQuery: string;
  onSelectNode: (node: LineageNode) => void;
}

interface HierarchyDatum extends LineageNode {
  _children?: HierarchyDatum[];
  children?: HierarchyDatum[];
}

const CARD_WIDTH = 138;
const CARD_HEIGHT = 38;
const STEP_X = 210; // 水平步长，两张卡片之间保证 72px 舒朗间隙，杜绝任何重叠
const STEP_Y = 56;  // 垂直行高步长

export const D3LineageTree: React.FC<D3LineageTreeProps> = ({
  activeSect,
  searchQuery,
  onSelectNode,
}) => {
  const { t } = useLang();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const isFirstRender = useRef(true);

  // 初始折叠函数：西天祖师与东土六祖、五家始祖展开；更深层弟子默认收起为 _children
  const createInitialTree = useCallback((): HierarchyDatum => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE));

    // 需要展开的重点始祖节点列表
    const keepExpandedIds = new Set([
      'shijiamouni', 'jiaye', 'anan', 'shangnawaxiu', 'youpojudo', 'tiduojia', 'longshu', 'ti-po', 'banruoduoluo',
      'bodhidharma', 'huike', 'sengcan', 'daoxin', 'hongren', 'huineng',
      'huairang', 'xingsi', 'shenhui', 'nanyang-huizhong', 'yongjia',
      'mazu', 'baizhang', 'weishan', 'huangbo', 'linji', 'yangshan',
      'shitou', 'yaoshan', 'yunyan', 'dongshan', 'caoshan',
      'tianhuang', 'longtan', 'deshan', 'xuefeng', 'yunmen',
      'xuansha', 'luohan', 'fayan', 'niutou-farong'
    ]);

    function collapseDeeper(node: HierarchyDatum) {
      if (node.children) {
        // 如果不在保持展开的集合中，将 children 折叠到 _children
        if (!keepExpandedIds.has(node.id)) {
          node._children = node.children;
          node.children = undefined;
          if (node._children) {
            node._children.forEach(collapseDeeper);
          }
        } else {
          node.children.forEach(collapseDeeper);
        }
      }
    }

    collapseDeeper(data);
    return data;
  }, []);

  const [rootData, setRootData] = useState<HierarchyDatum>(createInitialTree);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 全部展开
  const handleExpandAll = () => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(rootData));
    function expand(d: HierarchyDatum) {
      if (d._children) {
        d.children = d._children;
        d._children = undefined;
      }
      if (d.children) {
        d.children.forEach(expand);
      }
    }
    expand(data);
    setRootData(data);
  };

  // 收起至主干与宗师
  const handleCollapseToMain = () => {
    setRootData(createInitialTree());
  };

  // D3 渲染主逻辑
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 720;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // 滤镜定义：卡片柔和投影
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'card-shadow')
      .attr('x', '-10%')
      .attr('y', '-15%')
      .attr('width', '130%')
      .attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '2.5')
      .attr('flood-color', '#1E293B')
      .attr('flood-opacity', '0.08');

    // 主画布组（视口）
    const g = svg.append('g').attr('class', 'tree-viewport');

    // 缩放平移交互
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 禁用双击缩放避免干扰点击节点
    svg.on('dblclick.zoom', null);

    // 构建层级数据
    const root = d3.hierarchy<HierarchyDatum>(rootData);

    // 核心布局：使用固定节点尺寸 nodeSize，水平固定 STEP_X，垂直固定 STEP_Y
    // 从根本上彻底杜绝因固定宽度强行压缩导致的文字重叠！
    const treeLayout = d3.tree<HierarchyDatum>()
      .nodeSize([STEP_Y, STEP_X])
      .separation((a, b) => (a.parent === b.parent ? 1.05 : 1.25));

    treeLayout(root);

    // 提取所有节点与连线
    const nodes = root.descendants();
    const links = root.links();

    // 渲染水平贝塞尔连接线
    // 起点：父卡片右侧中心 (d.source.y + CARD_WIDTH, d.source.x)
    // 终点：子卡片左侧中心 (d.target.y, d.target.x)
    const linkGenerator = d3.linkHorizontal<any, any>()
      .x(p => p[0])
      .y(p => p[1])
      .source(d => [d.source.y + CARD_WIDTH, d.source.x])
      .target(d => [d.target.y, d.target.x]);

    g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sect = d.target.data.sect;
        return SECT_META[sect]?.color || '#B45309';
      })
      .attr('stroke-width', d => {
        if (d.target.data.sect === 'main' || d.target.data.sect === 'india') return 2.2;
        return 1.8;
      })
      .attr('stroke-opacity', d => {
        if (activeSect === 'all') return 0.55;
        return d.target.data.sect === activeSect ? 0.95 : 0.15;
      })
      .attr('stroke-dasharray', d => (d.target.data.sect === 'other' ? '4,3' : 'none'));

    // 渲染祖师卡片节点
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // 展开 / 折叠交互
        if (d.data.children || d.data._children) {
          if (d.data.children) {
            d.data._children = d.data.children;
            d.data.children = undefined;
          } else {
            d.data.children = d.data._children;
            d.data._children = undefined;
          }
          setRootData({ ...rootData });
        }
        onSelectNode(d.data);
      });

    // 根据搜索和宗派筛选计算透明度
    nodeGroup.attr('opacity', d => {
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchSearch = d.data.name.toLowerCase().includes(q) ||
          d.data.title.toLowerCase().includes(q) ||
          d.data.summary.toLowerCase().includes(q);
      }
      let matchSect = true;
      if (activeSect !== 'all') {
        matchSect = d.data.sect === activeSect;
      }

      if (!matchSearch) return 0.15;
      if (!matchSect && activeSect !== 'all') return 0.2;
      return 1;
    });

    // 1. 卡片外框（宣纸宋雅小卡片，严密包裹文字，杜绝文字溢出）
    nodeGroup.append('rect')
      .attr('x', 0)
      .attr('y', -CARD_HEIGHT / 2)
      .attr('width', CARD_WIDTH)
      .attr('height', CARD_HEIGHT)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        return isMatched ? '#FFFFFF' : '#FAF9F6';
      })
      .attr('stroke', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        const baseColor = SECT_META[d.data.sect]?.color || '#94A3B8';
        return isMatched ? baseColor : '#CBD5E1';
      })
      .attr('stroke-width', d => {
        if (activeSect !== 'all' && d.data.sect === activeSect) return 2.5;
        return 1.6;
      })
      .attr('filter', 'url(#card-shadow)')
      .attr('class', 'transition-all duration-200 hover:stroke-amber-600');

    // 2. 左侧宗派圆点印记
    nodeGroup.append('circle')
      .attr('cx', 12)
      .attr('cy', 0)
      .attr('r', 4.5)
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#B45309')
      .attr('opacity', 0.9);

    // 3. 祖师姓名文本（书法宋体，大号清晰）
    nodeGroup.append('text')
      .attr('x', 24)
      .attr('y', -1)
      .text(d => t(d.data.name))
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-serif-zen, serif)')
      .attr('fill', '#0F172A')
      .attr('dominant-baseline', 'central');

    // 4. 祖师尊号/代数（小字清晰，不重叠）
    nodeGroup.append('text')
      .attr('x', 24)
      .attr('y', 11)
      .text(d => {
        const rawTitle = d.data.title.split('·')[0].trim();
        return t(rawTitle.length > 5 ? rawTitle.slice(0, 5) : rawTitle);
      })
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#64748B')
      .attr('opacity', 0.85);

    // 5. 右边缘展开/折叠圆形徽章
    const expandableNodes = nodeGroup.filter(d => Boolean(d.data.children || d.data._children));

    expandableNodes.append('circle')
      .attr('cx', CARD_WIDTH)
      .attr('cy', 0)
      .attr('r', 7.5)
      .attr('fill', d => {
        if (d.data._children) return SECT_META[d.data.sect]?.color || '#B45309';
        return '#F1F5F9';
      })
      .attr('stroke', d => {
        if (d.data._children) return '#FFFFFF';
        return '#CBD5E1';
      })
      .attr('stroke-width', 1.2);

    expandableNodes.append('text')
      .attr('x', CARD_WIDTH)
      .attr('y', d => (d.data._children ? 0.5 : 0))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(d => (d.data._children ? '+' : '−'))
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => (d.data._children ? '#FFFFFF' : '#64748B'));

    // 视口初始居中定位与宗派聚焦逻辑
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // 首次加载定位在【菩提达摩】或【六祖惠能】
      const targetNode = nodes.find(n => n.data.id === 'bodhidharma') || nodes[0];
      if (targetNode && typeof targetNode.x === 'number' && typeof targetNode.y === 'number') {
        const scale = 0.85;
        const initialX = width * 0.32 - targetNode.y * scale;
        const initialY = height * 0.45 - targetNode.x * scale;
        const transform = d3.zoomIdentity.translate(initialX, initialY).scale(scale);
        svg.call(zoom.transform, transform);
      }
    } else if (activeSect !== 'all') {
      // 当切换宗派筛选时，平滑聚焦该宗派节点区域
      const sectNodes = nodes.filter(n => n.data.sect === activeSect);
      if (sectNodes.length > 0) {
        const xs = sectNodes.map(n => n.x ?? 0);
        const ys = sectNodes.map(n => n.y ?? 0);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const targetX = (minY + maxY) / 2 + CARD_WIDTH / 2;
        const targetY = (minX + maxX) / 2;

        const scale = 0.85;
        const destX = width * 0.45 - targetX * scale;
        const destY = height * 0.5 - targetY * scale;

        svg.transition()
          .duration(700)
          .ease(d3.easeCubicOut)
          .call(zoom.transform, d3.zoomIdentity.translate(destX, destY).scale(scale));
      }
    }

  }, [rootData, activeSect, searchQuery, isFullScreen, onSelectNode, t]);

  // 控制操作：放大、缩小、复位
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 720;
    const transform = d3.zoomIdentity.translate(width * 0.15, height * 0.45).scale(0.8);
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, transform);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-[#FAF9F6] border border-amber-900/15 shadow-md overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none bg-[#FAF9F6]' : 'h-[720px]'
      }`}
    >
      {/* 顶部悬浮控制栏 */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-sm text-xs">
          <button
            onClick={handleExpandAll}
            className="px-3 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 font-semibold transition"
            title={t('展开所有枝脉分支')}
          >
            {t('全部展开')}
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 mx-1" />
          <button
            onClick={handleCollapseToMain}
            className="px-3 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 font-semibold transition"
            title={t('收起至六祖与五家宗师')}
          >
            {t('收起深层')}
          </button>
        </div>
      </div>

      {/* 右侧缩放控制按钮组 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex flex-col p-1 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-sm">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-xl hover:bg-amber-50 text-slate-700 transition"
            title={t('放大')}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl hover:bg-amber-50 text-slate-700 transition"
            title={t('缩小')}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-amber-50 text-slate-700 transition"
            title={t('重置视口')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-sm hover:bg-amber-50 text-slate-700 transition"
          title={isFullScreen ? t('退出全屏') : t('全屏查看')}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 底部交互指引小提示 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-sm border border-amber-200/60 text-[11px] text-slate-600 font-medium flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('点击卡片或右端【+】展开后代 · 支持滚轮缩放与平移拖拽 · 点击祖师查看法卷')}</span>
        </div>
      </div>

      {/* SVG 画布 */}
      <svg ref={svgRef} className="w-full h-full select-none" />
    </div>
  );
};
