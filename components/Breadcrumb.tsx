'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useLang } from '@/context/LangContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t, getHref } = useLang();

  // 避免调用方传入已经包含“首页”导致重复显示两遍“首页”
  const cleanItems = items.filter(
    (item, idx) =>
      !(
        idx === 0 &&
        (item.label === '首页' ||
          item.label === '首頁' ||
          item.label === t('首页') ||
          item.href === '/')
      )
  );

  const fullItems: BreadcrumbItem[] = [
    { label: '首页', href: '/' },
    ...cleanItems,
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: `https://chanzong.space${getHref(item.href)}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="面包屑导航" className="flex items-center flex-wrap gap-1 text-[13px] font-semibold text-slate-500 mb-4">
        {fullItems.map((item, idx) => {
          const isLast = idx === fullItems.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-0.5 shrink-0" />
              )}
              {item.href && !isLast ? (
                <Link prefetch={false} href={getHref(item.href)}
                  className="hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                >
                  {idx === 0 && <Home className="w-3.5 h-3.5" />}
                  {t(item.label)}
                </Link>
              ) : (
                <span className="text-slate-700 inline-flex items-center gap-1">
                  {idx === 0 && <Home className="w-3.5 h-3.5" />}
                  {t(item.label)}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};
