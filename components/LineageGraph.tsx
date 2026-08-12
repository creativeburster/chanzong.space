'use client';

import React from 'react';
import Link from 'next/link';
import { GitFork, ArrowDown, Sparkles, Award } from 'lucide-react';
import { useLang } from '@/context/LangContext';

interface MasterNode {
  id?: string;
  name: string;
  title?: string;
  sect?: string;
  sectColor?: string;
  sub?: string;
}

export const LineageGraph: React.FC = () => {
  const { t } = useLang();

  // 1. 直传主干 (达摩至惠能)
  const patriarchs: MasterNode[] = [
    { id: 'bodhidharma', name: '菩提达摩', title: '东土初祖', sub: '直指人心 见性成佛' },
    { id: 'huike', name: '二祖慧可', title: '二祖', sub: '断臂求法 安心法门' },
    { id: 'sengcan', name: '三祖僧璨', title: '三祖', sub: '信心铭 绝能所' },
    { id: 'daoxin', name: '四祖道信', title: '四祖', sub: '入道方便 农禅并重' },
    { id: 'hongren', name: '五祖弘忍', title: '五祖', sub: '东山法门 最上乘论' },
    { id: 'huineng', name: '六祖惠能', title: '六祖', sub: '菩提本无树 曹溪顿教' },
  ];

  // 2. 六祖门下五大分支
  const huinengDisciples: MasterNode[] = [
    { id: 'nanyang-huizhong', name: '南阳慧忠', title: '国师', sub: '无缝塔' },
    { id: 'yongjia', name: '永嘉玄觉', title: '真觉禅师', sub: '证道歌' },
    { id: 'shenhui', name: '荷泽神会', title: '荷泽宗', sub: '显宗记 奠定南宗正统' },
    { id: 'huairang', name: '南岳怀让', title: '南岳系主干', sub: '磨砖作镜 开马祖一脉' },
    { id: 'xingsi', name: '青原行思', title: '青原系主干', sub: '圣谛亦不为 开石头一脉' },
  ];

  return (
    <section id="lineage" className="py-16 bg-[#FAF9F6] border-y border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 页头标题 */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-sm mb-3">
            <GitFork className="w-4 h-4 text-amber-700" />
            <span>{t('禅宗传法世系图表')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-zen text-slate-900 tracking-wide">
            {t('一花开五叶 · 五家七宗法脉图')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('源自菩提达摩东来，六祖惠能发扬，下衍南岳怀让、青原行思二大主脉，衍生临济、沩仰、曹洞、云门、法眼五家宗派世系脉络。')}
          </p>
        </div>

        {/* ================= 1. 第一部分：达摩至六祖直传主干 ================= */}
        <div className="max-w-xl mx-auto mb-16 relative">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-900 text-amber-100 tracking-wider">
              {t('【祖师直传主线】')}
            </span>
          </div>

          <div className="space-y-3 relative z-10">
            {patriarchs.map((node, idx) => (
              <React.Fragment key={idx}>
                <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-500 transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-900/10 border border-amber-900/20 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 font-serif-zen">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {node.id ? (
                          <Link
                            href={`/persons/${node.id}`}
                            className="text-base font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors hover:underline"
                          >
                            {t(node.name)}
                          </Link>
                        ) : (
                          <span className="text-base font-bold font-serif-zen text-slate-900">
                            {t(node.name)}
                          </span>
                        )}
                        {node.title && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 border border-amber-200">
                            {t(node.title)}
                          </span>
                        )}
                      </div>
                      {node.sub && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {t(node.sub)}
                        </div>
                      )}
                    </div>
                  </div>
                  {node.id && (
                    <Link
                      href={`/persons/${node.id}`}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {t('查看')} →
                    </Link>
                  )}
                </div>

                {idx < patriarchs.length - 1 && (
                  <div className="flex justify-center my-1 text-amber-700">
                    <ArrowDown className="w-4 h-4 animate-bounce opacity-60" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 箭线下指到六祖门下 */}
        <div className="flex justify-center -mt-8 mb-8">
          <div className="w-0.5 h-12 bg-gradient-to-b from-amber-600 to-amber-400" />
        </div>

        {/* ================= 2. 第二部分：六祖门下五大旁出与分枝 ================= */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-800 text-amber-50 tracking-wider shadow-sm">
              {t('【六祖门下五大支系】')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {huinengDisciples.map((d, idx) => {
              const isMainBranch = d.name.includes('南岳') || d.name.includes('青原');
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isMainBranch
                      ? 'bg-amber-900 text-white border-amber-800 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white text-slate-900 border-amber-200/80 shadow-sm'
                  }`}
                >
                  <div className="text-xs font-semibold opacity-70 mb-1">
                    {d.title}
                  </div>
                  {d.id ? (
                    <Link
                      href={`/persons/${d.id}`}
                      className={`text-base font-bold font-serif-zen hover:underline ${
                        isMainBranch ? 'text-amber-100' : 'text-slate-900 hover:text-amber-800'
                      }`}
                    >
                      {t(d.name)}
                    </Link>
                  ) : (
                    <div className="text-base font-bold font-serif-zen">
                      {t(d.name)}
                    </div>
                  )}
                  <div className={`text-xs mt-1 truncate ${isMainBranch ? 'text-amber-200/80' : 'text-slate-500'}`}>
                    {t(d.sub || '')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 箭线下指到两大主脉 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto -mt-8 mb-8">
          <div className="flex justify-center">
            <div className="w-0.5 h-10 bg-amber-600" />
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-10 bg-amber-600" />
          </div>
        </div>

        {/* ================= 3. 第三部分：南岳 vs 青原 两大系世系演化图表 ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 左干：南岳怀让系（马祖道一 -> 临济宗 & 沩仰宗） */}
          <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded-md">
                    {t('南岳一系')}
                  </span>
                  <h3 className="text-xl font-bold font-serif-zen text-slate-900 mt-2">
                    {t('南岳怀让 → 马祖道一')}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 font-serif-zen italic">
                  {t('【江西洪州宗风】')}
                </div>
              </div>

              {/* 马祖 */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center mb-6">
                <div className="text-xs font-bold text-amber-800">{t('洪州大师')}</div>
                <Link href="/persons/mazu" className="text-lg font-bold font-serif-zen text-slate-900 hover:text-amber-800 hover:underline">
                  {t('马祖道一')}
                </Link>
                <div className="text-xs text-slate-500 mt-0.5">{t('即心即佛 · 平常心是道')}</div>
              </div>

              {/* 下分两枝：百丈 & 南泉 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 百丈分支 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">{t('百丈系')}</div>
                    <Link href="/persons/baizhang" className="text-base font-bold font-serif-zen text-slate-900 hover:text-amber-800 hover:underline">
                      {t('百丈怀海')}
                    </Link>
                    <div className="text-[11px] text-slate-500 mb-3">{t('一日不作 一日不食')}</div>

                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      {/* 黄檗 -> 临济宗 */}
                      <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200">
                        <Link href="/persons/huangbo" className="text-xs font-bold text-slate-900 hover:underline">
                          {t('黄檗希运')}
                        </Link>
                        <div className="mt-1 flex items-center justify-between">
                          <Link href="/persons/linji" className="text-xs font-bold font-serif-zen text-rose-900 hover:underline">
                            {t('临济义玄')}
                          </Link>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-sm">
                            {t('临济宗')}
                          </span>
                        </div>
                      </div>

                      {/* 沩山 -> 沩仰宗 */}
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                        <Link href="/persons/weishan-lingyou" className="text-xs font-bold text-slate-900 hover:underline">
                      {t('沩山灵祐')}
                    </Link>
                        <div className="mt-1 flex items-center justify-between">
                          <Link href="/persons/yangshan-huiji" className="text-xs font-bold font-serif-zen text-amber-900 hover:underline">{t('仰山慧寂')}</Link>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white shadow-sm">
                            {t('沩仰宗')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 南泉分支 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">{t('南泉系')}</div>
                    <Link href="/persons/nanquan-puyuan" className="text-base font-bold font-serif-zen text-slate-900 hover:text-amber-800 hover:underline">{t('南泉普愿')}</Link>
                    <div className="text-[11px] text-slate-500 mb-3">{t('南泉斩猫')}</div>

                    <div className="pt-3 border-t border-slate-200">
                      <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200">
                        <Link href="/persons/zhaozhou" className="text-xs font-bold font-serif-zen text-sky-900 hover:underline">
                          {t('赵州从谂')}
                        </Link>
                        <div className="text-[10px] text-sky-700 mt-0.5">{t('吃茶去 · 庭前柏树子')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-4 italic text-center">
                    {t('【南有雪峰 · 北有赵州】')}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 右干：青原行思系（石头希迁 -> 曹洞宗 & 云门宗 & 法眼宗） */}
          <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-md">
                    {t('青原一系')}
                  </span>
                  <h3 className="text-xl font-bold font-serif-zen text-slate-900 mt-2">
                    {t('青原行思 → 石头希迁')}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 font-serif-zen italic">
                  {t('【湖南石头宗风】')}
                </div>
              </div>

              {/* 石头 */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center mb-6">
                <div className="text-xs font-bold text-emerald-800">{t('石头大师')}</div>
                <Link href="/persons/shitou" className="text-lg font-bold font-serif-zen text-slate-900 hover:text-emerald-800 hover:underline">
                  {t('石头希迁')}
                </Link>
                <div className="text-xs text-slate-500 mt-0.5">{t('参同契 · 草庵歌')}</div>
              </div>

              {/* 下分三枝：曹洞、云门、法眼 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 曹洞宗 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">{t('药山枝线')}</div>
                    <Link href="/persons/yaoshan-weiyan" className="text-xs font-bold text-slate-900 hover:underline">{t('药山惟俨')}</Link>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      <Link href="/persons/dongshan" className="hover:underline hover:text-emerald-800">
                        {t('洞山良价')}
                      </Link>
                    </div>
                    <Link href="/persons/caoshan-benji" className="text-[11px] text-slate-500 mt-0.5 hover:underline">{t('曹山本寂')}</Link>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-emerald-600 text-white shadow-sm block">
                      {t('曹洞宗')}
                    </span>
                  </div>
                </div>

                {/* 云门宗 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">{t('天皇枝线')}</div>
                    <div className="text-[11px] text-slate-700">
                      <Link href="/persons/tianhuang-daowu" className="hover:text-purple-700 hover:underline">{t('天皇道悟')}</Link>
                      {' → '}
                      <Link href="/persons/longtan-chongxin" className="hover:text-purple-700 hover:underline">{t('龙潭')}</Link>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <Link href="/persons/deshan-xuanjian" className="hover:text-purple-700 hover:underline">{t('德山宣鉴')}</Link>
                      {' → '}
                      <Link href="/persons/xuefeng-yicun" className="hover:text-purple-700 hover:underline">{t('雪峰')}</Link>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      <Link href="/persons/yunmen" className="hover:text-purple-700 hover:underline">{t('云门文偃')}</Link>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-purple-600 text-white shadow-sm block">
                      {t('云门宗')}
                    </span>
                  </div>
                </div>

                {/* 法眼宗 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">{t('罗汉枝线')}</div>
                    <Link href="/persons/luohan-guichen" className="text-xs font-bold text-slate-900 hover:underline">{t('罗汉桂琛')}</Link>
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      <Link href="/persons/xuansha-shibei" className="hover:text-indigo-700 hover:underline">{t('玄沙师备')}</Link>
                    </div>
                    <Link href="/persons/fayan-wenyi" className="text-xs font-bold text-slate-900 mt-1 hover:underline">{t('法眼文益')}</Link>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-indigo-600 text-white shadow-sm block">
                      {t('法眼宗')}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
