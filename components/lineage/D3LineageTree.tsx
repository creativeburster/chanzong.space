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

// 巨型大气思维导图卡片尺寸与步长规范（大方块、大字号，确保视觉分量与清晰可读）
const CARD_WIDTH = 340;
const CARD_HEIGHT = 116;

// 垂直布局（自上而下）：nodeSize([STEP_X, STEP_Y])
const V_STEP_X = 390;
const V_STEP_Y = 200;

// 水平布局（从左到右）：nodeSize([STEP_Y, STEP_X])
const H_STEP_X = 430;
const H_STEP_Y = 150;

// 舒适大字清晰阅读比例：1.0x（100% 原始矢量高清呈现，杜绝压缩发虚）
const COMFORTABLE_SCALE = 1.0;

// 各宗派核心宗师中枢锚点映射
const SECT_ANCHOR_MAP: Record<string, string[]> = {
  all: ['bodhidharma', 'huineng', 'shijiamouni'],
  india: ['shijiamouni', 'jiaye', 'bodhidharma'],
  main: ['bodhidharma', 'huineng', 'huike'],
  linji: ['linji', 'huangbo', 'baizhang', 'mazu'],
  yangqi: ['yangqi-fanghui', 'shishuang-chuyuan', 'linji'],
  huanglong: ['huanglong-huinan', 'shishuang-chuyuan', 'linji'],
  caodong: ['dongshan', 'caoshan-benji', 'shitou'],
  weiyang: ['weishan-lingyou', 'yangshan-huiji', 'baizhang'],
  yunmen: ['yunmen', 'xuefeng-yicun', 'deshan-xuanjian'],
  fayan: ['fayan-wenyi', 'luohan-guichen', 'xuansha-shibei'],
  other: ['niutou-farong', 'shenxiu', 'nanyang-huizhong']
};

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

  // 布局方向：默认为自上而下展开
  const [direction, setDirection] = useState<LayoutDirection>('vertical');
  // 主题配色：默认暗色
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 初始折叠函数：西天始祖与东土六祖、五家始祖展开；更深层弟子默认收起
  const createInitialTree = useCallback((): HierarchyDatum => {
    const data: HierarchyDatum = JSON.parse(JSON.stringify(ZEN_LINEAGE_TREE));

    const keepExpandedIds = new Set([
      'shijiamouni', 'jiaye', 'anan', 'shangnawaxiu', 'youpojudo', 'tiduojia', 'longshu', 'ti-po', 'banruoduoluo',
      'bodhidharma', 'huike', 'sengcan', 'daoxin', 'hongren', 'huineng',
      'huairang', 'xingsi', 'shenhui', 'nanyang-huizhong', 'yongjia',
      'mazu', 'baizhang', 'weishan-lingyou', 'huangbo', 'linji', 'yangshan-huiji',
      'shishuang-chuyuan', 'yangqi-fanghui', 'huanglong-huinan',
      'shitou', 'yaoshan-weiyan', 'yunyan-tancheng', 'dongshan', 'caoshan-benji',
      'tianhuang-daowu', 'longtan-chongxin', 'deshan-xuanjian', 'xuefeng-yicun', 'yunmen',
      'xuansha-shibei', 'luohan-guichen', 'fayan-wenyi', 'niutou-farong', 'shenxiu'
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

  // 确保目标宗师节点的祖先链全部展开
  const expandPathToTarget = useCallback((node: HierarchyDatum, targetId: string): boolean => {
    if (node.id === targetId) return true;
    const childList = node.children || node._children;
    if (!childList) return false;
    for (const child of childList) {
      if (expandPathToTarget(child, targetId)) {
        if (node._children) {
          node.children = node._children;
          node._children = undefined;
        }
        return true;
      }
    }
    return false;
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

  // 1. 舒适清晰大字中枢聚焦函数（字大 17px，清晰居中呈现目标宗师与脉络）
  const focusOnTargetNode = useCallback((targetId?: string, animate = true) => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || (isFullScreen ? window.innerHeight : 960);

    const nodesGroup = svg.select('.nodes');
    if (nodesGroup.empty()) return;

    let targetEl: SVGGraphicsElement | null = null;
    if (targetId) {
      targetEl = nodesGroup.select(`g.tree-node[data-id='${targetId}']`).node() as SVGGraphicsElement | null;
    }
    if (!targetEl && activeSect !== 'all') {
      const candidates = SECT_ANCHOR_MAP[activeSect] || [];
      for (const cid of candidates) {
        targetEl = nodesGroup.select(`g.tree-node[data-id='${cid}']`).node() as SVGGraphicsElement | null;
        if (targetEl) break;
      }
    }
    if (!targetEl) {
      targetEl = nodesGroup.select("g.tree-node[data-id='bodhidharma']").node() as SVGGraphicsElement | null;
    }
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

    // 采用 1.0x 舒适高清大字比例
    const scale = COMFORTABLE_SCALE;

    const isVert = direction === 'vertical';
    const tx = isVert ? (width / 2 - targetX * scale) : (width * 0.35 - targetX * scale);
    const ty = isVert ? (height * 0.38 - targetY * scale) : (height / 2 - targetY * scale);

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);

    if (animate) {
      svg.transition().duration(650).ease(d3.easeCubicOut).call(zoomRef.current.transform, transform);
    } else {
      svg.call(zoomRef.current.transform, transform);
    }
  }, [isFullScreen, activeSect, direction]);

  // 2. 全景宏观缩览函数（在用户显式点击【全景缩览】时启用，100% 完整展示整棵树全貌）
  const fitToView = useCallback((animate = true) => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || (isFullScreen ? window.innerHeight : 960);

    const nodesGroup = svg.select('.nodes');
    if (nodesGroup.empty()) return;

    const nodeElements = nodesGroup.selectAll('g.tree-node').nodes() as SVGGraphicsElement[];
    if (nodeElements.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    nodeElements.forEach(el => {
      const transform = el.getAttribute('transform');
      if (transform) {
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          // 计入卡片尺寸与底部折叠徽章(+/- 按钮)
          const left = x - CARD_WIDTH / 2;
          const right = x + CARD_WIDTH / 2;
          const top = y - CARD_HEIGHT / 2;
          const bottom = y + CARD_HEIGHT / 2 + 15;
          if (left < minX) minX = left;
          if (right > maxX) maxX = right;
          if (top < minY) minY = top;
          if (bottom > maxY) maxY = bottom;
        }
      }
    });

    if (minX === Infinity || maxX <= minX || maxY <= minY) return;

    const treeW = maxX - minX;
    const treeH = maxY - minY;

    // 顶部控制栏约 50px，必须为顶部预留安全边距（85px），确保最顶层祖师（如释迦佛、迦叶、达摩）绝不被控制钮遮挡！
    // 底部留出 55px 边距，确保底层宗师绝不被切出视口；左右各留 45px
    const padTop = 85;
    const padBottom = 55;
    const padX = 45;

    const availW = Math.max(100, width - padX * 2);
    const availH = Math.max(100, height - padTop - padBottom);

    // 设定全景保底舒适比例 (不低于 0.45)，绝不无节制缩小成火柴盒！
    const scaleX = availW / treeW;
    const scaleY = availH / treeH;
    const targetScale = Math.max(0.45, Math.min(scaleX, scaleY, 0.95));

    // 计算平移：
    // X 方向在整个视口中完全居中
    const centerX = (minX + maxX) / 2;
    const tx = width / 2 - centerX * targetScale;

    // Y 方向计算：
    let ty: number;
    if (treeH * targetScale <= availH) {
      // 能够完整容纳，垂直完全居中
      const centerY = (minY + maxY) / 2;
      ty = padTop + (availH / 2) - centerY * targetScale;
    } else {
      // 超出可用高度，顶部对齐 padTop，保证上方祖师清晰大字展现，下方用户可顺畅滑动
      ty = padTop - minY * targetScale;
    }

    const transform = d3.zoomIdentity.translate(tx, ty).scale(targetScale);

    if (animate) {
      svg.transition().duration(700).ease(d3.easeCubicOut).call(zoomRef.current.transform, transform);
    } else {
      svg.call(zoomRef.current.transform, transform);
    }
  }, [isFullScreen]);

  // 当外部 activeSect 改变时，若目标宗师节点深藏，自动沿着路径展开
  useEffect(() => {
    if (activeSect !== 'all') {
      const candidates = SECT_ANCHOR_MAP[activeSect] || [];
      if (candidates.length > 0) {
        const cloned: HierarchyDatum = JSON.parse(JSON.stringify(rootData));
        let changed = false;
        for (const cid of candidates) {
          if (expandPathToTarget(cloned, cid)) {
            changed = true;
          }
        }
        if (changed) {
          setRootData(cloned);
        }
      }
    }
  }, [activeSect, expandPathToTarget]);

  // D3 渲染主逻辑
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = isFullScreen ? window.innerHeight - 80 : 740;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const isDark = theme === 'dark';

    // 1. 定义背景网格与阴影滤镜
    const defs = svg.append('defs');

    // 点阵网格
    const pattern = defs.append('pattern')
      .attr('id', 'tree-dot-grid')
      .attr('width', 26)
      .attr('height', 26)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 13)
      .attr('cy', 13)
      .attr('r', 1.2)
      .attr('fill', isDark ? '#1E293B' : '#E2D9C8')
      .attr('opacity', isDark ? 0.65 : 0.7);

    // 卡片外层立体微阴影
    const filter = defs.append('filter')
      .attr('id', 'card-shadow')
      .attr('x', '-20%')
      .attr('y', '-25%')
      .attr('width', '140%')
      .attr('height', '150%');

    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', isDark ? '5' : '4')
      .attr('flood-color', isDark ? '#000000' : '#1E293B')
      .attr('flood-opacity', isDark ? '0.55' : '0.08');

    // 背景底色：深邃玄青夜空 #070D1B 或 宣纸白天色 #FAF8F5
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', isDark ? '#070D1B' : '#FAF8F5');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#tree-dot-grid)');

    // 主画布组（视口）
    const g = svg.append('g').attr('class', 'tree-viewport');

    // 缩放平移交互
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.04, 3.5])
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
      .separation((a, b) => (a.parent === b.parent ? 1.08 : 1.25));

    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    // 连线生成器（丝滑曲线）
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
        const isMatched = activeSect === 'all' || sect === activeSect;
        if (!isMatched) return isDark ? '#1E293B' : '#CBD5E1';
        return SECT_META[sect]?.color || (isDark ? '#F59E0B' : '#B45309');
      })
      .attr('stroke-width', d => {
        const isMatched = activeSect === 'all' || d.target.data.sect === activeSect;
        return isMatched ? 2.6 : 1.6;
      })
      .attr('stroke-opacity', d => {
        if (activeSect === 'all') return isDark ? 0.85 : 0.65;
        return d.target.data.sect === activeSect ? 0.98 : 0.25;
      })
      .attr('stroke-dasharray', d => (d.target.data.sect === 'other' ? '5,3' : 'none'));

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

    // 搜索和宗派高亮对比度
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

      if (!matchSearch) return 0.2;
      // 未激活节点保持 0.52 透明度，具有清晰轮廓，绝不会融入背景黑泥
      if (!matchSect && activeSect !== 'all') return 0.52;
      return 1;
    });

    // 1. 卡片外框：深色采用 #101C38 夜空蓝宝石色，浅色采用纯白 #FFFFFF
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2)
      .attr('y', -CARD_HEIGHT / 2)
      .attr('width', CARD_WIDTH)
      .attr('height', CARD_HEIGHT)
      .attr('rx', 18)
      .attr('ry', 18)
      .attr('fill', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        if (isDark) {
          return isMatched ? '#101C38' : '#0B1222';
        } else {
          return isMatched ? '#FFFFFF' : '#F9F7F2';
        }
      })
      .attr('stroke', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        const sectColor = SECT_META[d.data.sect]?.color || '#F59E0B';
        if (isMatched) return sectColor;
        return isDark ? '#1E2D48' : '#D1D5DB';
      })
      .attr('stroke-width', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        return isMatched ? 2.5 : 1.5;
      })
      .attr('filter', 'url(#card-shadow)')
      .attr('class', 'transition-all duration-200');

    // 2. 左侧宗派装饰竖条（饱满圆润大条）
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2 + 3.5)
      .attr('y', -CARD_HEIGHT / 2 + 12)
      .attr('width', 7)
      .attr('height', CARD_HEIGHT - 24)
      .attr('rx', 3.5)
      .attr('ry', 3.5)
      .attr('fill', d => SECT_META[d.data.sect]?.color || '#F59E0B');

    // 3. 祖师姓名文本（巨型大号 32px！加粗 800！沉稳大气，醒目极佳）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 28)
      .attr('y', -20)
      .text(d => t(d.data.name))
      .attr('font-size', '32px')
      .attr('font-weight', '800')
      .attr('font-family', 'var(--font-serif-zen), serif')
      .attr('fill', isDark ? '#FFFFFF' : '#0F172A')
      .attr('letter-spacing', '0.8px')
      .attr('dominant-baseline', 'central');

    // 4. 尊号专属小胶囊底衬（34px 大胶囊，增强尊号识别度与层次）
    nodeGroup.append('rect')
      .attr('x', -CARD_WIDTH / 2 + 24)
      .attr('y', 12)
      .attr('width', d => {
        const rawTitle = d.data.title.split('·')[0].trim();
        const displayTitle = t(rawTitle.length > 9 ? rawTitle.slice(0, 9) : rawTitle);
        return Math.min(270, displayTitle.length * 21 + 22);
      })
      .attr('height', 34)
      .attr('rx', 9)
      .attr('ry', 9)
      .attr('fill', d => {
        const isMatched = activeSect === 'all' || d.data.sect === activeSect;
        if (isDark) {
          return isMatched ? 'rgba(253, 230, 138, 0.16)' : 'rgba(255, 255, 255, 0.06)';
        } else {
          return isMatched ? 'rgba(217, 119, 6, 0.14)' : 'rgba(0, 0, 0, 0.05)';
        }
      });

    // 5. 祖师尊号/代数文本（大号 20px，粗体，浅金高光 #FDE68A，排版一清二楚）
    nodeGroup.append('text')
      .attr('x', -CARD_WIDTH / 2 + 35)
      .attr('y', 29)
      .text(d => {
        const rawTitle = d.data.title.split('·')[0].trim();
        return t(rawTitle.length > 9 ? rawTitle.slice(0, 9) : rawTitle);
      })
      .attr('font-size', '20px')
      .attr('font-weight', '600')
      .attr('font-family', 'var(--font-serif-zen), serif')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => {
        if (isDark) return '#FDE68A';
        return SECT_META[d.data.sect]?.color || '#92400E';
      });

    // 6. 展开/折叠徽章（加大号 +/- 按钮，半径16px，极其醒目好点）
    const expandableNodes = nodeGroup.filter(d => Boolean(d.data.children || d.data._children));

    const badgeX = isVertical ? 0 : CARD_WIDTH / 2;
    const badgeY = isVertical ? CARD_HEIGHT / 2 : 0;

    expandableNodes.append('circle')
      .attr('cx', badgeX)
      .attr('cy', badgeY)
      .attr('r', 16)
      .attr('fill', d => {
        if (d.data._children) return SECT_META[d.data.sect]?.color || '#F59E0B';
        return isDark ? '#101C38' : '#FFFFFF';
      })
      .attr('stroke', d => {
        if (d.data._children) return '#FFFFFF';
        return SECT_META[d.data.sect]?.color || (isDark ? '#38BDF8' : '#94A3B8');
      })
      .attr('stroke-width', 2.4)
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
      .attr('font-size', d => (d.data._children && d.data._children.length > 1 ? '14px' : '18px'))
      .attr('font-weight', 'bold')
      .attr('fill', d => {
        if (d.data._children) return '#FFFFFF';
        return isDark ? '#F1F5F9' : '#475569';
      });

    // 视图定位：
    // 默认进入页面为【全景缩览】，宏观总览整座法脉谱系全貌；用户亦可随时点击【聚焦中枢】切换至清晰大字
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setTimeout(() => fitToView(false), 50);
    } else {
      setTimeout(() => fitToView(true), 50);
    }

  }, [rootData, direction, theme, activeSect, searchQuery, isFullScreen, onSelectNode, t, focusOnTargetNode, fitToView]);

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
        isDark ? 'bg-[#070D1B] border-slate-800 text-slate-100' : 'bg-[#FAF8F5] border-amber-900/15 text-slate-900'
      } ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[850px] md:h-[920px] lg:h-[980px] xl:h-[1050px]'
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

        {/* 核心功能：聚焦中枢（大字高清 100% 原始比例） */}
        <button
          onClick={() => focusOnTargetNode(undefined, true)}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-sm text-xs font-bold transition ${
            isDark ? 'bg-amber-950/80 border-amber-600/80 text-amber-200 hover:bg-amber-900' : 'bg-amber-100/90 border-amber-400 text-amber-900 hover:bg-amber-200'
          }`}
          title={t('以大号清晰字号居中回看当前宗派核心宗师')}
        >
          <Focus className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('聚焦中枢 (清晰大字)')}</span>
        </button>

        {/* 全景缩览（宏观全局俯瞰） */}
        <button
          onClick={() => fitToView(true)}
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
            onClick={() => focusOnTargetNode(undefined, true)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
            title={t('复位聚焦大字')}
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

      {/* 底部交互指引与清晰大字状态说明 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className={`px-3.5 py-1.5 rounded-xl backdrop-blur-sm border text-[11px] font-medium flex items-center gap-1.5 shadow-sm ${
          isDark ? 'bg-slate-900/85 border-slate-700/80 text-slate-300' : 'bg-white/90 border-amber-200/70 text-slate-700'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('默认全景缩览全貌 · 文字已放大30%呈现 · 可随时点击【聚焦中枢】看高清大字 · 支持自由滚轮缩放')}</span>
        </div>
      </div>

      {/* SVG 画布：启用全矢量精准几何与抗锯齿锐化 */}
      <svg
        ref={svgRef}
        className="w-full h-full select-none"
        style={{
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
        }}
      />
    </div>
  );
};
