import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '404 · 此处无物 | 禅宗知识库',
  description: '本来无一物，何处惹尘埃。您访问的页面不存在或已迁移。',
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-800 mb-6 font-serif text-2xl border border-amber-200/60">
          空
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-3 tracking-wide">
          本来无一物
        </h1>
        
        <p className="text-stone-500 text-sm leading-relaxed mb-8">
          此处无门无路，莫向空处寻觅。<br />
          您寻访的篇章或条目不存在，亦或已随法脉迁流。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 text-sm font-medium transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/books"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium transition-colors border border-stone-200"
          >
            浏览百部典籍
          </Link>
          <Link
            href="/graph"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium transition-colors border border-stone-200"
          >
            探索知识图谱
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-400 font-mono">
          HTTP 404 · Page Not Found · chanzong.space
        </div>
      </div>
    </div>
  );
}
