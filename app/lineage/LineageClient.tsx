'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GitFork,
  Search,
  Filter,
  X,
  BookOpen,
  MessageCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_KOANS } from '@/lib/taxonomy';
import { LineageNode, SECT_META } from '@/lib/lineageData';
import { D3LineageTree } from '@/components/lineage/D3LineageTree';
import { LineageViewTabs } from '@/components/lineage/LineageViewTabs';
import ZenQuoteCardModal from '@/components/ZenQuoteCardModal';
import { useLang } from '@/context/LangContext';

export default function LineageClient() {
  const { t, getHref } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSect, setActiveSect] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // 获取选中祖师在 ZEN_PERSONS 中的详细信息
  const matchedPerson = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.personId) {
      return ZEN_PERSONS.find((p) => p.id === selectedNode.personId) || null;
    }
    return (
      ZEN_PERSONS.find(
        (p) =>
          p.id === selectedNode.id ||
          p.name.includes(selectedNode.name) ||
          selectedNode.name.includes(p.name)
      ) || null
    );
  }, [selectedNode]);

  // 获取选中祖师相关的公案
  const matchedKoans = useMemo(() => {
    if (!selectedNode) return [];
    return ZEN_KOANS.filter(
      (k) =>
        k.master.includes(selectedNode.name) ||
        (selectedNode.personId && k.relatedPersons?.includes(selectedNode.personId))
    ).slice(0, 3);
  }, [selectedNode]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      <Sidebar
        onOpenSearch={() => setSearchOpen(true)}
        classicsCount={manifest.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10 space-y-6">
          {/* 面包屑与视图切换器 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Breadcrumb
              items={[{ label: t('知识图谱'), href: '/graph' }, { label: t('祖师法脉传承树') }]}
            />
            <LineageViewTabs />
          </div>

          {/* 页面主标题区 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/15 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs mb-2">
                  <GitFork className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('禅门正法血脉 · 师资印可世系')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-zen text-slate-900 tracking-wide">
                  {t('一花开五叶 · 禅宗法脉源流谱系树')}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {t('从灵山会上迦叶破颜微笑，到菩提达摩面壁少林；从六祖惠能曹溪顿教，到南岳青原衍化五家七宗。点击节点自由展开/收拢法嗣，探微宗门千年心印。')}
                </p>
              </div>

              {/* 搜索框 */}
              <div className="w-full lg:w-72 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('搜索祖师名号 / 宗派 / 法语...')}
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-stone-50 border border-amber-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 宗派选择过滤器标签栏 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-bold shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('宗派筛选')}:</span>
              </div>
              {Object.entries(SECT_META).map(([key, meta]) => {
                const isSelected = activeSect === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSect(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-xs scale-[1.02]'
                        : 'bg-stone-50 hover:bg-amber-50/60 text-slate-600 border-amber-200/60'
                    }`}
                  >
                    {t(meta.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* D3 交互式谱系树主图 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className={selectedNode ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <D3LineageTree
                activeSect={activeSect}
                searchQuery={searchQuery}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>

            {/* 选中的祖师详情抽屉卡片 */}
            {selectedNode && (
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border-2 border-amber-900/20 shadow-lg space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 inline-block"
                      style={{
                        backgroundColor: `${SECT_META[selectedNode.sect]?.color}15`,
                        borderColor: `${SECT_META[selectedNode.sect]?.color}40`,
                        color: SECT_META[selectedNode.sect]?.color,
                      }}
                    >
                      {t(SECT_META[selectedNode.sect]?.label || '禅门宗师')}
                    </span>
                    <h3 className="text-xl font-bold font-serif-zen text-slate-900">
                      {t(selectedNode.name)}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-amber-800 font-semibold">
                  {t(selectedNode.title)}
                </div>

                {selectedNode.era && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{t('世系时代')}: {t(selectedNode.era)}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-slate-700 font-serif-zen leading-relaxed">
                  {t(selectedNode.summary)}
                </div>

                {/* 关联公案 */}
                {matchedKoans.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t('传世机锋公案')}</span>
                    </div>
                    <div className="space-y-1.5">
                      {matchedKoans.map((k) => (
                        <Link
                          key={k.id}
                          prefetch={false}
                          href={getHref(`/koan/${k.id}`)}
                          className="block p-2 rounded-xl bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/50 text-[11px] text-rose-950 font-medium truncate transition"
                        >
                          问：“{t(k.question)}”
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 底部操作按钮 */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setCardModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('制作祖师法语海报')}</span>
                  </button>

                  {matchedPerson && (
                    <Link
                      prefetch={false}
                      href={getHref(`/persons/${matchedPerson.id}`)}
                      className="w-full py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <span>{t('深度研读祖师生平')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 页面底部：五家七宗宗风解说卡片网络 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-3xl bg-white border border-red-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <h4 className="font-bold text-sm text-red-950 font-serif-zen">
                  {t('临济宗 · 峻烈大机')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('以临济喝、三玄三要、四料简著称。宗风勇猛刚烈，如雷轰电掣，劈头一喝，截断情识妄念，直显本来天真佛。')}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950 font-serif-zen">
                  {t('曹洞宗 · 绵密默照')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('以宝镜三昧、五位君臣、默照禅见称。宗风绵密温雅，敲唱俱行，理微意细，如水赴海，潜移默化证得自性空灵。')}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h4 className="font-bold text-sm text-purple-950 font-serif-zen">
                  {t('沩仰宗 · 圆相暗契')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('以九十六种圆相为极则。师资唱和，父子一家，方圆默契，温润严整，以体用不二、心境一如接引具足善根之机。')}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-sky-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <h4 className="font-bold text-sm text-sky-950 font-serif-zen">
                  {t('云门宗 · 险绝一字')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('以云门三句（涵盖乾坤、截断众流、随波逐浪）及一字关为宗旨。孤危绝顶，高耸壁立，超脱言句名相之樊篱。')}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                <h4 className="font-bold text-sm text-amber-950 font-serif-zen">
                  {t('法眼宗 · 一切现成')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('以六相圆融、理事交彻为纲要。整肃丛林，会通唯识与华严，宗镜录会归群经，以一切现成、随缘契道为极致。')}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                <h4 className="font-bold text-sm text-orange-950 font-serif-zen">
                  {t('黄龙与杨岐 · 七宗大成')}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('临济下分黄龙派与杨岐派。黄龙以三关辨机，杨岐出圆悟克勤与大慧宗杲，碧岩录评唱与看话禅并盛，法流遍及天下。')}
              </p>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={manifest}
      />

      {/* 祖师法语宣纸海报弹窗 */}
      {selectedNode && (
        <ZenQuoteCardModal
          isOpen={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
          quote={selectedNode.summary}
          author={selectedNode.name}
          sourceTitle={selectedNode.title}
        />
      )}
    </div>
  );
}
