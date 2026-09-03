'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, ChevronRight, ChevronDown, Layers, Sparkles } from 'lucide-react';
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

export const D3LineageTree: React.FC<D3LineageTreeProps> = ({
  activeSect,
  searchQuery,
  onSelectNode,
}) => {
  const { t } = useLang();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // 原始树深拷贝作为状态
  const [rootData, setRootData] = useState<HierarchyDatum>(() => JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE)));
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 初始折叠深层节点（保留主干展开，深层分支可点击展开）
  useEffect(() => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE));

    // 递归折叠深于特定深度的节点
    function collapseDeep(d: HierarchyDatum, depth: number) {
      if (d.children) {
        // 如果到了临济楚圆之后或者深层，把 children 转存为 _children
        if (depth >= 4 && d.id !== 'huineng' && d.id !== 'huairang' && d.id !== 'xingsi' && d.id !== 'mazu' && d.id !== 'shitou') {
          d._children = d.children;
          d.children = undefined;
          if (d._children) {
            d._children.forEach(c => collapseDeep(c, depth + 1));
          }
        } else {
          d.children.forEach(c => collapseDeep(c, depth + 1));
        }
      }
    }

    collapseDeep(data, 0);
    setRootData(data);
  }, []);

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

  // 全部收起至六祖
  const handleCollapseToMain = () => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE));
    function collapse(d: HierarchyDatum, depth: number) {
      if (d.children) {
        if (depth >= 3) {
          d._children = d.children;
          d.children = undefined;
          if (d._children) d._children.forEach(c => collapse(c, depth + 1));
        } else {
          d.children.forEach(c => collapse(c, depth + 1));
        }
      }
    }
    collapse(data, 0);
    setRootData(data);
  };

  // D3 渲染主逻辑
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 700;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // 创建主画布组
    const g = svg.append('g').attr('class', 'tree-viewport');

    // 缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 构建层级数据
    const root = d3.hierarchy<HierarchyDatum>(rootData);

    // 树布局（横向布局：x 为垂直位置，y 为水平位置）
    // 动态计算树高度，使节点间距充裕不重叠
    const nodeCount = root.descendants().length;
    const dynamicHeight = Math.max(height, nodeCount * 42);
    const treeLayout = d3.tree<HierarchyDatum>()
      .size([dynamicHeight - 120, width - 260])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 1.8));

    treeLayout(root);

    // 渲染贝塞尔连接线
    const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<HierarchyDatum>, d3.HierarchyPointNode<HierarchyDatum>>()
      .x(d => d.y)
      .y(d => d.x);

    g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sect = d.target.data.sect;
        return SECT_META[sect]?.color || '#94A3B8';
      })
      .attr('stroke-width', d => {
        // 主干更粗
        if (d.target.data.sect === 'main' || d.target.data.sect === 'india') return 2.5;
        return 1.8;
      })
      .attr('stroke-opacity', d => {
        if (activeSect === 'all') return 0.5;
        return d.target.data.sect === activeSect ? 0.9 : 0.15;
      })
      .attr('stroke-dasharray', d => {
        if (d.target.data.sect === 'other') return '4,3';
        return 'none';
      });

    // 节点分组
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // 如果有可折叠的子节点，切换展开/折叠
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

    // 搜索高亮与宗派透明度
    node.attr('opacity', d => {
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

      if (!matchSearch) return 0.2;
      if (!matchSect && activeSect !== 'all') return 0.25;
      return 1;
    });

    // 外圈光晕（代表有折叠的子代）
    node.filter(d => Boolean(d.data._children || d.data.children))
      .append('circle')
      .attr('r', 11)
      .attr('fill', 'none')
      .attr('stroke', d => SECT_META[d.data.sect]?.color || '#B45309')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.data._children ? '3,2' : 'none')
      .attr('opacity', 0.8);

    // 主节点圆心
    node.append('circle')
      .attr('r', 6.5)
      .attr('fill', d => {
        if (d.data._children) return '#FFFFFF'; // 折叠中为空心
        return SECT_META[d.data.sect]?.color || '#B45309';
      })
      .attr('stroke', d => SECT_META[d.data.sect]?.color || '#B45309')
      .attr('stroke-width', 2.5);

    // 祖师姓名文本
    node.append('text')
      .attr('dy', '0.35em')
      .attr('x', d => (d.children || d.data._children) ? -14 : 14)
      .attr('text-anchor', d => (d.children || d.data._children) ? 'end' : 'start')
      .text(d => t(d.data.name))
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-serif-zen, serif)')
      .attr('fill', d => {
        const isSelected = activeSect === 'all' || d.data.sect === activeSect;
        return isSelected ? '#1E293B' : '#94A3B8';
      })
      .attr('stroke', '#FAF9F6')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke fill');

    // 尊号胶囊小标签
    node.append('text')
      .attr('dy', '1.6em')
      .attr('x', d => (d.children || d.data._children) ? -14 : 14)
      .attr('text-anchor', d => (d.children || d.data._children) ? 'end' : 'start')
      .text(d => t(d.data.title.split('·')[0].trim()))
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#64748B')
      .attr('opacity', 0.85);

    // 居中初始视口
    const initialTransform = d3.zoomIdentity.translate(90, (height - dynamicHeight) / 2 + 50).scale(0.85);
    svg.call(zoom.transform, initialTransform);

  }, [rootData, activeSect, searchQuery, isFullScreen]);

  // 控制操作：放大、缩小、复位
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const initialTransform = d3.zoomIdentity.translate(90, 80).scale(0.85);
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, initialTransform);
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
            title={t('收起至六祖主干')}
          >
            {t('收起分支')}
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
        <div className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm border border-amber-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('点击圆圈节点可展开/收起分支 · 滚轮缩放与拖拽画布 · 点击祖师查看法脉详情')}</span>
        </div>
      </div>

      {/* SVG 画布 */}
      <svg ref={svgRef} className="w-full h-full select-none" />
    </div>
  );
};
