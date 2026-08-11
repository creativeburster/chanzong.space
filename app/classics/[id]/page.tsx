import React from 'react';
import { notFound } from 'next/navigation';
import { getClassicById, getManifest } from '@/lib/data';
import { ClassicViewer } from './ClassicViewer';
import { marked } from 'marked';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const manifest = getManifest();
  return manifest.map((item) => ({
    id: item.id,
  }));
}

export default function ClassicPage({ params }: PageProps) {
  const { meta, content } = getClassicById(params.id);

  if (!meta) {
    notFound();
  }

  const manifest = getManifest();
  const currentIndex = manifest.findIndex((item) => item.id === meta.id);
  const prevItem = currentIndex > 0 ? manifest[currentIndex - 1] : null;
  const nextItem = currentIndex < manifest.length - 1 ? manifest[currentIndex + 1] : null;

  const htmlContent = marked.parse(content || '*正在提取该篇章全文中，请稍候刷新...*', { async: false });

  return (
    <ClassicViewer
      meta={meta}
      htmlContent={htmlContent}
      rawContent={content}
      manifest={manifest}
      prevItem={prevItem}
      nextItem={nextItem}
    />
  );
}
