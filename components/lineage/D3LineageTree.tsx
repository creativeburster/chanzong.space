'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowDownUp,
  ArrowLeftRight,
  Focus,
} from 'lucide-react';
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

type LayoutDirection = 'vertical' | 'horizontal';

// 卡片与步进尺寸规范
const CARD_WIDTH = 154;
const CARD_HEIGHT = 50;

// 垂直布局（自上而下）：nodeSize([STEP_X, STEP_Y])
const V_STEP_X = 176;
const V_STEP_Y = 96;

// 水平布局（从左到右）：nodeSize([STEP_Y, STEP_X])
const H_STEP_X = 220;
const H_STEP_Y = 66;

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

  // 布局方向：默认为用户喜爱的【自上而下垂直展开】
  const [direction, setDirection] = useState<LayoutDirection>('vertical');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 初始折叠函数：西天始祖与东土六祖、五家始祖展开；更深层弟子默认收起
  const createInitialTree = useCallback((): HierarchyDatum => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE));

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

  // 收起至主干宗师
  const handleCollapseToMain = () => {
    setRootData(createInitialTree());
  };

  // 切换布局方向
  const toggleDirection = () => {
    setDirection(prev => (prev === 'vertical' ? 'horizontal' : 'vertical'));
  };

  // 全览自适应居中函数（支持宗派智能聚焦与强制全部全览）
  const fitToView = useCallback((animate = true, forceAll = false) => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 720;

    // 查找所有可见节点
    const nodesGroup = svg.select('.nodes');
    if (nodesGroup.empty()) return;

    const nodeElements = nodesGroup.selectAll('g.tree-node').nodes() as SVGGraphicsElement[];
    if (nodeElements.length === 0) return;

    let targetNodes = nodeElements;
    if (!forceAll && activeSect !== 'all') {
      const sectMatched = nodeElements.filter(el => el.getAttribute('data-sect') === activeSect);
      if (sectMatched.length > 0) targetNodes = sectMatched;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    targetNodes.forEach(el => {
      const transform = el.getAttribute('transform');
      if (transform) {
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          if (x - CARD_WIDTH / 2 < minX) minX = x - CARD_WIDTH / 2;
          if (x + CARD_WIDTH / 2 > maxX) maxX = x + CARD_WIDTH / 2;
          if (y - CARD_HEIGHT / 2 < minY) minY = y - CARD_HEIGHT / 2;
          if (y + CARD_HEIGHT / 2 > maxY) maxY = y + CARD_HEIGHT / 2;
        }
      }
    });

    if (minX === Infinity) return;

    const treeW = maxX - minX;
    const treeH = maxY - minY;
    const padding = 70;

    // 计算最佳缩放比例（保证全览一览无余，宗派聚焦时可放大至 0.95）
    const maxAllowedScale = activeSect !== 'all' && !forceAll ? 0.95 : 0.9;
    const scale = Math.max(0.22, Math.min((width - padding * 2) / treeW, (height - padding * 2) / treeH, maxAllowedScale));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const tx = width / 2 - centerX * scale;
    const ty = height / 2 - centerY * scale;

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);

    if (animate) {
      svg.transition().duration(650).ease(d3.easeCubicOut).call(zoomRef.current.transform, transform);
    } else {
      svg.call(zoomRef.current.transform, transform);
    }
  }, [isFullScreen, activeSect]);

  // D3 渲染主逻辑
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 720;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // 1. 定义背景网格 Pattern 与高级阴影滤镜
    const defs = svg.append('defs');

    // 思维导图宣纸微点阵网格（Dot Matrix Grid）
    const pattern = defs.append('pattern')
      .attr('id', 'mindmap-dot-grid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 12)
      .attr('cy', 12)
      .attr('r', 1.2)
      .attr('fill', '#DCD3C1')
      .attr('opacity', 0.65);

    // 卡片柔和高级投影
    const filter = defs.append('filter')
      .attr('id', 'card-shadow')
      .attr('x', '-15%')
      .attr('y', '-20%')
      .attr('width', '135%')
      .attr('height', '150%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', '3')
      .attr('flood-color', '#1E293B')
      .attr('flood-opacity', '0.07');

    // 绘制温润背景与点阵层
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#FAF8F5');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#mindmap-dot-grid)');

    // 主画布组（视口）
    const g = svg.append('g').attr('class', 'tree-viewport');

    // 缩放平移交互
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    svg.on('dblclick.zoom', null);

    // 构建层级数据
    const root = d3.hierarchy<HierarchyDatum>(rootData);

    const isVertical = direction === 'vertical';

    // 核心布局：根据方向选择 nodeSize
    // 垂直模式：x为水平，y为垂直
    // 水平模式：x为垂直，y为水平
    const treeLayout = d3.tree<HierarchyDatum>()
      .nodeSize(isVertical ? [V_STEP_X, V_STEP_Y] : [H_STEP_Y, H_STEP_X])
      .separation((a, b) => (a.parent === b.parent ? 1.08 : 1.28));

    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    // 连线生成器（思维导图丝滑曲线）
    let linkPathGenerator: any;

    if (isVertical) {
      // 垂直自上而下：起点为父卡片底部中心，终点为子卡片顶部中心
      linkPathGenerator = d3.linkVertical<any, any>()
        .x(p => p[0])
        .y(p => p[1])
        .source(d => [d.source.x, d.source.y + CARD_HEIGHT / 2])
        .target(d => [d.target.x, d.target.y - CARD_HEIGHT / 2]);
    } else {
      // 水平从左到右：起点为父卡片右侧中心，终点为子卡片左侧中心
      linkPathGenerator = d3.linkHorizontal<any, any>()
        .x(p => p[0])
        .y(p => p[1])
        .source(d => [d.source.y + CARD_WIDTH / 2, d.source.x])
        .target(d => [d.target.y - CARD_WIDTH / 2, d.target.x]);
    }

    // 渲染思维导图连线
    g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', linkPathGenerator)
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
      .selectAll('g.tree-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('data-sect', d => d.data.sect)
      .attr('transform', d => {
        if (isVertical) {
          return `translate(${d.x},${d.y})`;
        } else {
          return `translate(${d.y},${d.x})`;
        }
      })
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

    // 搜索和宗派透明度
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

    // 1. 卡片外框：居中排布 (-CARD_WIDTH/2, -CARD_HEIGHT/2)
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2)
      .attr('y', -CARD_HEIGHT / 2)
      .attr('width', CARD_WIDTH)
      .attr('height', CARD_HEIGHT)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        return isMatched ? '#FFFFFF' : '#F8F6F0';
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
      .attr('class', 'transition-all duration-200');

    // 2. 左侧宗派装饰条（精致圆角印鉴条）
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2 + 1.5)
      .attr('y', -CARD_HEIGHT / 2 + 5)
      .attr('width', 4)
      .attr('height', CARD_HEIGHT - 10)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#B45309');

    // 3. 祖师姓名文本（书法宋体，字距雅致，y = -8，占上半区）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 16)
      .attr('y', -8)
      .text(d => t(d.data.name))
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-serif-zen, serif)')
      .attr('fill', '#0F172A')
      .attr('dominant-baseline', 'central');

    // 4. 祖师尊号/代数（y = 11，占下半区，彻底拉开 19px 纵向间距，两行垂直严格左对齐！）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 16)
      .attr('y', 11)
      .text(d => {
        const rawTitle = d.data.title.split('·')[0].trim();
        return t(rawTitle.length > 8 ? rawTitle.slice(0, 8) : rawTitle);
      })
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#78350F')
      .attr('opacity', 0.9);

    // 6. 展开/折叠徽章（思维导图经典 +/- 按钮）
    const expandableNodes = nodeGroup.filter(d => Boolean(d.data.children || d.data._children));

    // 根据方向放置在卡片底部中心（垂直布局）或右侧中心（水平布局）
    const badgeX = isVertical ? 0 : CARD_WIDTH / 2;
    const badgeY = isVertical ? CARD_HEIGHT / 2 : 0;

    expandableNodes.append('circle')
      .attr('cx', badgeX)
      .attr('cy', badgeY)
      .attr('r', 8)
      .attr('fill', d => {
        if (d.data._children) return SECT_META[d.data.sect]?.color || '#B45309';
        return '#FFFFFF';
      })
      .attr('stroke', d => {
        if (d.data._children) return '#FFFFFF';
        return SECT_META[d.data.sect]?.color || '#94A3B8';
      })
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#card-shadow)');

    expandableNodes.append('text')
      .attr('x', badgeX)
      .attr('y', badgeY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(d => {
        if (d.data._children) {
          // 如果收拢，显示收拢的子节点数量（例如 +3），极具思维导图专业感
          const count = d.data._children.length;
          return count > 1 ? `+${count}` : '+';
        }
        return '−';
      })
      .attr('font-size', d => (d.data._children && d.data._children.length > 1 ? '8.5px' : '10px'))
      .attr('font-weight', 'bold')
      .attr('fill', d => (d.data._children ? '#FFFFFF' : '#64748B'));

    // 首次渲染或方向变更时，自动进行一览无余居中自适应
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setTimeout(() => fitToView(false), 50);
    } else {
      setTimeout(() => fitToView(true), 50);
    }

  }, [rootData, direction, activeSect, searchQuery, isFullScreen, onSelectNode, t, fitToView]);

  // 控制操作：放大、缩小
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-[#FAF8F5] border border-amber-900/15 shadow-md overflow-hidden transition-all duration-300 select-none ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none bg-[#FAF8F5]' : 'h-[740px]'
      }`}
    >
      {/* 顶部悬浮控制栏（思维导图工具栏风格） */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* 展开/收拢控制 */}
        <div className="flex items-center p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xs text-xs">
          <button
            onClick={handleExpandAll}
            className="px-3 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 font-bold transition"
            title={t('展开所有法脉分支')}
          >
            {t('全部展开')}
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 mx-1" />
          <button
            onClick={handleCollapseToMain}
            className="px-3 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 font-bold transition"
            title={t('收起至主干与宗师')}
          >
            {t('收起深层')}
          </button>
        </div>

        {/* 布局方向切换开关：自上而下 / 从左到右 */}
        <button
          onClick={toggleDirection}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xs text-xs font-bold text-amber-900 hover:bg-amber-50 transition"
          title={direction === 'vertical' ? t('切换为水平横向展开') : t('切换为自上而下垂直展开')}
        >
          {direction === 'vertical' ? (
            <>
              <ArrowDownUp className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('自上而下 (纵向世系)')}</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('从左到右 (横向导图)')}</span>
            </>
          )}
        </button>

        {/* 一览无余自适应居中按钮 */}
        <button
          onClick={() => fitToView(true, true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xs text-xs font-bold text-slate-700 hover:bg-amber-50 transition"
          title={t('自适应画布，全局一览无余')}
        >
          <Focus className="w-3.5 h-3.5 text-amber-700" />
          <span>{t('一览无余')}</span>
        </button>
      </div>

      {/* 右侧缩放与全屏工具栏 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex flex-col p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xs">
          <button
            onClick={() => handleZoom(1.25)}
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
            onClick={() => fitToView(true)}
            className="p-2 rounded-xl hover:bg-amber-50 text-slate-700 transition"
            title={t('复位居中')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xs hover:bg-amber-50 text-slate-700 transition"
          title={isFullScreen ? t('退出全屏') : t('沉浸全屏导图')}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 底部交互指引与美学状态 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm border border-amber-200/70 text-[11px] text-slate-600 font-medium flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('思维导图交互：点击卡片或端点【+】展开后代 · 支持滚轮缩放与任意拖拽 · 点击【一览无余】瞬时居中全览')}</span>
        </div>
      </div>

      {/* SVG 画布 */}
      <svg ref={svgRef} className="w-full h-full select-none" />
    </div>
  );
};
