'use client';

import { useEffect } from 'react';

/**
 * 全站版权复制拦截器（知乎模式）：
 * 当用户选中页面文本并复制时，若字数超过设定阈值（15字），
 * 自动在剪贴板末尾附带出处标题、页面链接、来源网站及版权声明，
 * 既保护站点原创版权，又防止因全文复制导致内存溢出。
 */
export function CopyrightCopyHandler() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // 避免在 input/textarea 内部输入框内复制时触发拦截
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const selection = window.getSelection();
      if (!selection) return;

      const selectedText = selection.toString();
      // 仅当选中文本达到 15 个字符以上（成句、成段）时附加版权声明
      // 短词查询（如复制单个词汇去搜索）保持纯净不受打扰
      if (selectedText.trim().length >= 15) {
        e.preventDefault();

        const pageTitle = document.title
          ? document.title.replace(/\s*\|\s*禅宗知识库.*$/, '').trim()
          : '禅宗典籍';
        const pageUrl = window.location.href;

        const copyrightFooter = [
          '',
          '————————————',
          `出处：《${pageTitle}》`,
          `链接：${pageUrl}`,
          '来源：禅宗知识库 (chanzong.space)',
          '著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。',
        ].join('\n');

        const fullText = selectedText + '\n' + copyrightFooter;

        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', fullText);
        }
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  return null;
}
