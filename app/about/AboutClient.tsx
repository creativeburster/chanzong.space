'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BookOpen, FileText, Users, Shield, Mail } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function AboutClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={57} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <Breadcrumb items={[{ label: '关于本站' }]} />

          <div className="space-y-8">
            {/* 站点介绍 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <h1 className="text-2xl font-bold font-serif-zen text-slate-900">关于禅宗知识库</h1>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  禅宗知识库(chanzong.space)是一个非营利性的禅宗文献数字化项目，旨在将禅宗核心典籍以结构化、可检索、可对照的方式呈现给现代读者。
                  本站收录57部禅宗核心典籍，涵盖从达摩祖师四论、六祖坛经到宋代公案集、高丽禅法，并构建了祖师(143位)、概念(270个)、法门(65种)、公案(295则)、问答(1350条)五类知识实体的交叉网络。
                </p>
                <p className="text-[15px] leading-relaxed text-slate-700 mt-4">
                  所有典籍均提供原文与白话对照翻译，每部经典配有核心概念、相关公案、修持法门、人物关联与常见问答。
                  本站不隶属于任何宗教机构或商业组织，内容开放供学术研究、修行参考与文化传播使用。
                </p>
              </div>
            </section>

            {/* 文本来源 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-bold font-serif-zen text-slate-900">文本来源与校对</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  本站典籍原文主要源自以下公开数字资源：
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-[15px] text-slate-700">
                  <li>
                    <strong>CBETA 电子佛典集成</strong>(cbeta.org)：台湾中华电子佛典协会维护的佛教文献数据库，收录大正藏、卍续藏等，是本站最主要的原文来源。
                  </li>
                  <li>
                    <strong>大正新脩大藏经</strong>(Taishō Tripiṭaka)：日本大正年间编纂的汉文大藏经，共100卷，是国际佛学研究的标准版本。
                  </li>
                  <li>
                    <strong>识典古籍</strong>(shidianguji.com)：字节跳动与北京大学合作的古籍数字化平台，提供部分禅宗文献的标点整理本。
                  </li>
                  <li>
                    <strong>其他公开资源</strong>：包括各寺院流通本、学术机构整理本等，均在经典详情页标注具体出处。
                  </li>
                </ul>
                <p className="text-[15px] leading-relaxed text-slate-700 mt-4">
                  所有原文均经人工校对，修正OCR错误、标点遗漏与段落错乱。白话翻译由编辑团队基于原文深度学习后自主创作，力求准确传达原意且通俗易懂，非机器翻译或简单改写。
                </p>
              </div>
            </section>

            {/* 编辑原则 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-bold font-serif-zen text-slate-900">编辑原则</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <ul className="list-disc pl-6 space-y-2 text-[15px] text-slate-700">
                  <li><strong>尊重原文</strong>：不删改、不增补原文内容，保留历史版本的文字差异与异体字。</li>
                  <li><strong>白话翻译</strong>：每部经典的翻译为完整、全面的白话文，非节选或摘要；翻译基于对原文的深度理解，非逐字直译。</li>
                  <li><strong>结构化呈现</strong>：每部经典提炼关键词、主旨、重点内容、阅读难点、名句白话解读，帮助现代读者快速把握核心。</li>
                  <li><strong>交叉关联</strong>：经典与概念、公案、法门、人物建立双向链接，形成知识网络而非孤立文本。</li>
                  <li><strong>开放获取</strong>：全站内容免费开放，无广告、无付费墙，支持学术引用与文化传播。</li>
                </ul>
              </div>
            </section>

            {/* 版权声明 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-bold font-serif-zen text-slate-900">版权声明</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  本站收录的典籍原文属于公共领域或遵循原始授权协议(CBETA文本遵循其开放授权)。
                  白话翻译、结构化整理、知识图谱关联为本站原创内容，采用 <strong>Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)</strong> 授权：
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1 text-[15px] text-slate-700">
                  <li>允许非商业性使用、分享、改编，但须注明出处为"禅宗知识库 chanzong.space"。</li>
                  <li>禁止用于商业出版、付费课程、营利性数据库等商业用途。</li>
                  <li>学术引用请注明具体经典名称与页面链接。</li>
                </ul>
              </div>
            </section>

            {/* 联系方式 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-bold font-serif-zen text-slate-900">联系与反馈</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  如发现文本错误、翻译不当、关联遗漏，或有任何建议，欢迎通过以下方式联系：
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1 text-[15px] text-slate-700">
                  <li>GitHub Issues: <Link href="https://github.com/gstar-byte/chanzong.space/issues" className="text-amber-700 hover:underline">gstar-byte/chanzong.space</Link></li>
                  <li>邮箱: <a href="mailto:contact@chanzong.space" className="text-amber-700 hover:underline">contact@chanzong.space</a></li>
                </ul>
                <p className="text-[15px] leading-relaxed text-slate-700 mt-4">
                  本站为个人维护项目，回复可能不及时，但每条反馈都会认真阅读。
                </p>
              </div>
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>

      {searchOpen && <SearchModal isOpen={true} onClose={() => setSearchOpen(false)} items={[]} />}
    </div>
  );
}
