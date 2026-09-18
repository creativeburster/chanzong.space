import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '404 · 此處無物 | 禪宗知識庫',
  description: '本來無一物，何處惹塵埃。您訪問的頁面不存在或已遷移。',
};

export default function NotFoundZhTw() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-800 mb-6 font-serif text-2xl border border-amber-200/60">
          空
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-3 tracking-wide">
          本來無一物
        </h1>
        
        <p className="text-stone-500 text-sm leading-relaxed mb-8">
          此處無門無路，莫向空處尋覓。<br />
          您尋訪的篇章或條目不存在，亦或已隨法脈遷流。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/zh-tw"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 text-sm font-medium transition-colors"
          >
            返回首頁
          </Link>
          <Link
            href="/zh-tw/books"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium transition-colors border border-stone-200"
          >
            瀏覽百部典籍
          </Link>
          <Link
            href="/zh-tw/graph"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium transition-colors border border-stone-200"
          >
            探索知識圖譜
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-400 font-mono">
          HTTP 404 · Page Not Found · chanzong.space
        </div>
      </div>
    </div>
  );
}
