'use client';

import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  strongClass?: string;
  emClass?: string;
  codeClass?: string;
}

/**
 * 轻量 Markdown 格式化渲染组件
 * 解析并渲染 **加粗**、*斜体/要点*、`行内代码` 以及列表项（- 或 1.），消除所有裸露星号
 */
export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = '',
  strongClass = 'font-bold text-amber-950 dark:text-amber-100',
  emClass = 'font-semibold text-amber-800 dark:text-amber-300 not-italic',
  codeClass = 'font-serif-zen text-amber-900 bg-amber-50/90 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900 px-1.5 py-0.5 rounded-md text-[0.92em]',
}) => {
  if (!content) return null;

  // 正则：匹配 **加粗**、*斜体* 或 `行内代码`
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

  const renderInline = (line: string, lineKey: string) => {
    const parts = line.split(tokenRegex);
    return parts.map((part, pIdx) => {
      const k = `${lineKey}-p-${pIdx}`;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={k} className={strongClass}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={k} className={emClass}>
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={k} className={codeClass}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={k}>{part}</React.Fragment>;
    });
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        const k = `ln-${idx}`;
        if (!line) {
          return <div key={k} className="h-1.5" />;
        }

        // 匹配有序编号列表：如 "1. "、"2. "
        const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const text = orderedMatch[2];
          return (
            <div key={k} className="flex items-start gap-2.5 my-1.5 pl-1 leading-relaxed">
              <span className="select-none font-bold text-amber-800 dark:text-amber-300 text-xs mt-1 w-5 shrink-0 text-right">
                {num}.
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInline(text, k)}
              </div>
            </div>
          );
        }

        // 匹配无序列表：如 "- "、"* "
        const bulletMatch = line.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          const text = bulletMatch[1];
          return (
            <div key={k} className="flex items-start gap-2.5 my-1.5 pl-1 leading-relaxed">
              <span className="select-none text-amber-700/80 dark:text-amber-400 font-bold text-sm shrink-0 mt-0.5 leading-none">
                •
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInline(text, k)}
              </div>
            </div>
          );
        }

        // 普通正文段落
        return (
          <p key={k} className="leading-relaxed my-1">
            {renderInline(rawLine, k)}
          </p>
        );
      })}
    </div>
  );
};
