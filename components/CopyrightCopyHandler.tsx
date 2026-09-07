'use client';

import { useEffect } from 'react';

/**
 * 全站版权复制拦截器（知乎/简书模式）：
 * 当用户选中页面文字并复制时（无论是快捷键 Ctrl+C、Cmd+C，还是右键菜单复制）：
 * 1. 门槛低至 5 个字符以上（确保名言、诗偈、哪怕 5-10 字短句均能精准附加版权声明）；
 * 2. 同时向系统剪贴板写入 text/plain 与 text/html，确保微信（电脑端与手机端聊天框富文本）、Word、笔记应用粘贴时 100% 携带出处与链接；
 * 3. 采用捕获阶段 (capture: true) 优先监听，防止被其他组件拦截。
 */
export function CopyrightCopyHandler() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // 避免在用户输入框内打字编辑时受到打扰
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
      // 只要选中文本长度达到 5 个字以上（如短句、名言警句、法偈段落）即触发
      if (selectedText && selectedText.trim().length >= 5) {
        // 阻止浏览器默认剪贴板写入
        e.preventDefault();

        const rawTitle = document.title || '禅宗典籍';
        const pageTitle = rawTitle
          .replace(/\s*\|\s*禅宗知识库.*$/, '')
          .replace(/\s*·\s*禅宗知识库.*$/, '')
          .trim();
        const pageUrl = window.location.href;

        const attributionText = [
          '',
          '————————————',
          `出处：《${pageTitle}》`,
          `链接：${pageUrl}`,
          '来源：禅宗知识库 (chanzong.space)',
          '著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。',
        ].join('\n');

        const fullPlainText = selectedText + '\n' + attributionText;

        const htmlAttribution = `<br><br>————————————<br>出处：《${pageTitle}》<br>链接：<a href="${pageUrl}">${pageUrl}</a><br>来源：禅宗知识库 (chanzong.space)<br>著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。`;
        const fullHtmlText = `<div>${selectedText.replace(/\r\n|\n/g, '<br>')}${htmlAttribution}</div>`;

        // 1. 优先使用标准 clipboardData 写入纯文本和 HTML 富文本（微信聊天窗口优先读取 text/html）
        if (e.clipboardData) {
          e.clipboardData.clearData();
          e.clipboardData.setData('text/plain', fullPlainText);
          e.clipboardData.setData('text/html', fullHtmlText);
        }

        // 2. 补充 navigator.clipboard 兼容性保障
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(fullPlainText).catch(() => {});
        }
      }
    };

    // 绑定捕获阶段，确保优先级最高
    document.addEventListener('copy', handleCopy, true);
    window.addEventListener('copy', handleCopy, true);

    return () => {
      document.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('copy', handleCopy, true);
    };
  }, []);

  return null;
}
