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
  Eye,
  Sun,
  Moon,
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
type ThemeMode = 'dark' | 'light';

// 大号舒展卡片尺寸与步长规范（确保字号大、排版呼吸感强）
const CARD_WIDTH = 166;
const CARD_HEIGHT = 54;

// 垂直布局（自上而下）：nodeSize([STEP_X, STEP_Y])
const V_STEP_X = 188;
const V_STEP_Y = 106;

// 水平布局（从左到右）：nodeSize([STEP_Y, STEP_X])
const H_STEP_X = 236;
const H_STEP_Y = 74;

// 舒适清晰阅读缩放比例（保证字号 14px 饱满清晰，绝不缩成火柴盒）
const COMFORTABLE_SCALE = 0.85;

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
  // 主题配色：默认与 /graph 页面一致为【深邃夜空沉浸宇宙色 #0B1329】
  const [theme, setTheme] = useState<ThemeMode>('dark');
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

  // 切换昼夜主题
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. 舒适清晰中枢聚焦函数（字号 14px，大号易读，居中菩提达摩与六祖）
  const focusOnCenter = useCallback((animate = true) => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 740;

    const nodesGroup = svg.select('.nodes');
    if (nodesGroup.empty()) return;

    // 优先寻找【菩提达摩】或【六祖惠能】
    let targetEl = nodesGroup.select("g.tree-node[data-id='bodhidharma']").node() as SVGGraphicsElement | null;
    if (!targetEl) {
      targetEl = nodesGroup.select("g.tree-node[data-id='huineng']").node() as SVGGraphicsElement | null;
    }
    if (!targetEl) {
      targetEl = nodesGroup.select("g.tree-node").node() as SVGGraphicsElement | null;
    }

    if (!targetEl) return;

    const transformStr = targetEl.getAttribute('transform');
    if (!transformStr) return;
    const match = /translate\(([^,]+),([^)]+)\)/.exec(transformStr);
    if (!match) return;

    const targetX = parseFloat(match[1]);
    const targetY = parseFloat(match[2]);

    const scale = COMFORTABLE_SCALE; // 0.85 黄金清晰阅读比

    // 垂直布局居中偏上一点，便于向下观览
    const tx = width / 2 - targetX * scale;
    const ty = height * 0.38 - targetY * scale;

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);

    if (animate) {
      svg.transition().duration(700).ease(d3.easeCubicOut).call(zoomRef.current.transform, transform);
    } else {
      svg.call(zoomRef.current.transform, transform);
    }
  }, [isFullScreen]);

  // 2. 全局缩览全景自适应函数（宏观俯瞰整棵大树）
  const fitToView = useCallback((animate = true, forceAll = false) => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 740;

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
    const padding = 60;

    // 缩览计算比例
    const scale = Math.max(0.24, Math.min((width - padding * 2) / treeW, (height - padding * 2) / treeH, 0.95));

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
    const height = isFullScreen ? window.innerHeight - 80 : 740;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const isDark = theme === 'dark';

    // 1. 定义背景与阴影滤镜
    const defs = svg.append('defs');

    // 点阵网格
    const pattern = defs.append('pattern')
      .attr('id', 'tree-dot-grid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 12)
      .attr('cy', 12)
      .attr('r', 1.2)
      .attr('fill', isDark ? '#1E293B' : '#DCD3C1')
      .attr('opacity', isDark ? 0.8 : 0.65);

    // 卡片柔和高级投影
    const filter = defs.append('filter')
      .attr('id', 'card-shadow')
      .attr('x', '-20%')
      .attr('y', '-25%')
      .attr('width', '140%')
      .attr('height', '150%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', isDark ? '4' : '3')
      .attr('flood-color', isDark ? '#000000' : '#1E293B')
      .attr('flood-opacity', isDark ? '0.45' : '0.07');

    // 绘制与 /graph 页面一致的深邃宇宙蓝黑底色，或温润宣纸白天色
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', isDark ? '#0B1329' : '#FAF8F5');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#tree-dot-grid)');

    // 主画布组（视口）
    const g = svg.append('g').attr('class', 'tree-viewport');

    // 缩放平移交互
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .wheelDelta((event) => -event.deltaY * 0.002)
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
    const treeLayout = d3.tree<HierarchyDatum>()
      .nodeSize(isVertical ? [V_STEP_X, V_STEP_Y] : [H_STEP_Y, H_STEP_X])
      .separation((a, b) => (a.parent === b.parent ? 1.08 : 1.28));

    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    // 连线生成器（思维导图丝滑曲线）
    let linkPathGenerator: any;

    if (isVertical) {
      linkPathGenerator = d3.linkVertical<any, any>()
        .x(p => p[0])
        .y(p => p[1])
        .source(d => [d.source.x, d.source.y + CARD_HEIGHT / 2])
        .target(d => [d.target.x, d.target.y - CARD_HEIGHT / 2]);
    } else {
      linkPathGenerator = d3.linkHorizontal<any, any>()
        .x(p => p[0])
        .y(p => p[1])
        .source(d => [d.source.y + CARD_WIDTH / 2, d.source.x])
        .target(d => [d.target.y - CARD_WIDTH / 2, d.target.x]);
    }

    // 渲染思维导图连线（深色模式下为明亮通透的发光流线）
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
        return SECT_META[sect]?.color || (isDark ? '#F59E0B' : '#B45309');
      })
      .attr('stroke-width', d => {
        if (d.target.data.sect === 'main' || d.target.data.sect === 'india') return 2.4;
        return 2.0;
      })
      .attr('stroke-opacity', d => {
        if (activeSect === 'all') return isDark ? 0.75 : 0.55;
        return d.target.data.sect === activeSect ? 0.98 : 0.15;
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
      .attr('data-id', d => d.data.id)
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

    // 1. 卡片外框：深色夜空卡片 (#0F172A) 或 浅色卡片
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2)
      .attr('y', -CARD_HEIGHT / 2)
      .attr('width', CARD_WIDTH)
      .attr('height', CARD_HEIGHT)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        if (isDark) {
          return isMatched ? '#0F172A' : '#0B132B';
        } else {
          return isMatched ? '#FFFFFF' : '#F8F6F0';
        }
      })
      .attr('stroke', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        const baseColor = SECT_META[d.data.sect]?.color || (isDark ? '#38BDF8' : '#94A3B8');
        return isMatched ? baseColor : (isDark ? '#1E293B' : '#CBD5E1');
      })
      .attr('stroke-width', d => {
        if (activeSect !== 'all' && d.data.sect === activeSect) return 2.6;
        return isDark ? 1.8 : 1.6;
      })
      .attr('filter', 'url(#card-shadow)')
      .attr('class', 'transition-all duration-200');

    // 2. 左侧宗派装饰条（精致圆角印鉴条）
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2 + 1.5)
      .attr('y', -CARD_HEIGHT / 2 + 6)
      .attr('width', 4)
      .attr('height', CARD_HEIGHT - 12)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#F59E0B');

    // 3. 祖师姓名文本（大号高亮白色，字号 14.5px，字距雅致，y = -9，占上半区）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 16)
      .attr('y', -9)
      .text(d => t(d.data.name))
      .attr('font-size', '14.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-serif-zen, serif)')
      .attr('fill', isDark ? '#FFFFFF' : '#0F172A')
      .attr('dominant-baseline', 'central')
      .style('text-shadow', isDark ? '0 1px 3px rgba(0,0,0,0.85)' : 'none');

    // 4. 祖师尊号/代数（字号 11px，清晰明亮的浅金色 #FDE68A，y = 12，占下半区，彻底拉开 21px 间距，绝不重叠！）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 16)
      .attr('y', 12)
      .text(d => {
        const rawTitle = d.data.title.split('·')[0].trim();
        return t(rawTitle.length > 9 ? rawTitle.slice(0, 9) : rawTitle);
      })
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => {
        if (isDark) return '#FDE68A';
        return SECT_META[d.data.sect]?.color || '#78350F';
      })
      .attr('opacity', isDark ? 0.95 : 0.9);

    // 5. 展开/折叠徽章（思维导图经典 +/- 按钮）
    const expandableNodes = nodeGroup.filter(d => Boolean(d.data.children || d.data._children));

    const badgeX = isVertical ? 0 : CARD_WIDTH / 2;
    const badgeY = isVertical ? CARD_HEIGHT / 2 : 0;

    expandableNodes.append('circle')
      .attr('cx', badgeX)
      .attr('cy', badgeY)
      .attr('r', 8.5)
      .attr('fill', d => {
        if (d.data._children) return SECT_META[d.data.sect]?.color || '#F59E0B';
        return isDark ? '#0F172A' : '#FFFFFF';
      })
      .attr('stroke', d => {
        if (d.data._children) return '#FFFFFF';
        return SECT_META[d.data.sect]?.color || (isDark ? '#38BDF8' : '#94A3B8');
      })
      .attr('stroke-width', 1.8)
      .attr('filter', 'url(#card-shadow)');

    expandableNodes.append('text')
      .attr('x', badgeX)
      .attr('y', badgeY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(d => {
        if (d.data._children) {
          const count = d.data._children.length;
          return count > 1 ? `+${count}` : '+';
        }
        return '−';
      })
      .attr('font-size', d => (d.data._children && d.data._children.length > 1 ? '9px' : '10.5px'))
      .attr('font-weight', 'bold')
      .attr('fill', d => {
        if (d.data._children) return '#FFFFFF';
        return isDark ? '#F1F5F9' : '#64748B';
      });

    // 初始首屏：直接以 0.85 黄金清晰大字号居中聚焦在【菩提达摩】核心中枢！
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setTimeout(() => focusOnCenter(false), 50);
    } else if (activeSect !== 'all') {
      setTimeout(() => fitToView(true, false), 50);
    }

  }, [rootData, direction, theme, activeSect, searchQuery, isFullScreen, onSelectNode, t, focusOnCenter, fitToView]);

  // 控制操作：放大、缩小
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 select-none ${
        isDark ? 'bg-[#0B1329] border-slate-800 text-slate-100' : 'bg-[#FAF8F5] border-amber-900/15 text-slate-900'
      } ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[750px]'
      }`}
    >
      {/* 顶部悬浮控制栏（毛玻璃与高对比度控制钮） */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* 展开/收拢控制 */}
        <div className={`flex items-center p-1 rounded-2xl backdrop-blur-md border shadow-sm text-xs ${
          isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' : 'bg-white/95 border-amber-200/90 text-slate-700'
        }`}>
          <button
            onClick={handleExpandAll}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-slate-700'
            }`}
            title={t('展开所有法脉分支')}
          >
            {t('全部展开')}
          </button>
          <div className={`w-[1px] h-3.5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <button
            onClick={handleCollapseToMain}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-amber-50 text-slate-700'
            }`}
            title={t('收起至主干与宗师')}
          >
            {t('收起深层')}
          </button>
        </div>

        {/* 核心功能：聚焦中枢（字大清晰） */}
        <button
          onClick={() => focusOnCenter(true)}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-sm text-xs font-bold transition ${
            isDark ? 'bg-amber-950/80 border-amber-700/60 text-amber-200 hover:bg-amber-900' : 'bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200'
          }`}
          title={t('以大号清晰字号居中回看东土祖师主干')}
        >
          <Focus className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('聚焦中枢 (清晰大字)')}</span>
        </button>

        {/* 全景缩览（宏观全局） */}
        <button
          onClick={() => fitToView(true, true)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl backdrop-blur-md border shadow-sm text-xs font-bold transition ${
            isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800' : 'bg-white/95 border-amber-200/90 text-slate-700 hover:bg-amber-50'
          }`}
          title={t('缩览全图，纵览全脉')}
        >
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>{t('全景缩览')}</span>
        </button>

        {/* 布局方向切换开关：自上而下 / 从左到右 */}
        <button
          onClick={toggleDirection}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl backdrop-blur-md border shadow-sm text-xs font-bold transition ${
            isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800' : 'bg-white/95 border-amber-200/90 text-slate-700 hover:bg-amber-50'
          }`}
          title={direction === 'vertical' ? t('切换为水平横向展开') : t('切换为自上而下垂直展开')}
        >
          {direction === 'vertical' ? (
            <>
              <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('自上而下')}</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('从左到右')}</span>
            </>
          )}
        </button>

        {/* 昼夜主题一键切换 */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-2xl backdrop-blur-md border shadow-sm transition ${
            isDark ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800' : 'bg-white/95 border-amber-200/90 text-slate-700 hover:bg-amber-50'
          }`}
          title={isDark ? t('切换为温润宣纸浅色') : t('切换为深邃夜空沉浸深色')}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* 右侧缩放与全屏工具栏 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className={`flex flex-col p-1 rounded-2xl backdrop-blur-md border shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-300' : 'bg-white/95 border-amber-200/90 text-slate-700'
        }`}>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
            title={t('放大')}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
            title={t('缩小')}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => focusOnCenter(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
            title={t('复位聚焦')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className={`p-2.5 rounded-2xl backdrop-blur-md border shadow-sm transition ${
            isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800' : 'bg-white/95 border-amber-200/90 text-slate-700 hover:bg-amber-50'
          }`}
          title={isFullScreen ? t('退出全屏') : t('沉浸全屏导图')}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 底部交互指引与美学状态 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className={`px-3.5 py-1.5 rounded-xl backdrop-blur-sm border text-[11px] font-medium flex items-center gap-1.5 shadow-sm ${
          isDark ? 'bg-slate-900/85 border-slate-700/80 text-slate-400' : 'bg-white/90 border-amber-200/70 text-slate-600'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('默认以 0.85 舒适大字号呈现 · 点击卡片或端点【+】展开后代 · 支持滚轮缩放与自由拖拽')}</span>
        </div>
      </div>

      {/* SVG 画布 */}
      <svg ref={svgRef} className="w-full h-full select-none" />
    </div>
  );
};
