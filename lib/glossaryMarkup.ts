import { GlossaryEntry } from '@/lib/glossary';

/**
 * 将 HTML 文本中的生僻字/禅宗术语注入带 dataset 与拼音上标的 <ruby> 标签
 * 确保绝不破坏 HTML 标签内部的属性和结构，优先匹配长词，且严格保证：
 * 全篇每个生僻字词仅标注【首次出现】的位置，绝不重复标注导致密密麻麻！
 */
export function injectGlossaryMarkups(
  html: string,
  entries: GlossaryEntry[],
  showPinyinAbove: boolean = true
): string {
  if (!html || !entries || entries.length === 0) return html;

  // 1. 去重并按词长降序排列
  const map = new Map<string, GlossaryEntry>();
  for (const e of entries) {
    if (e.char && !map.has(e.char)) {
      map.set(e.char, e);
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.char.length - a.char.length);
  if (sorted.length === 0) return html;

  // 2. 正则转义
  const escapeRegExp = (s: string) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const pattern = new RegExp(sorted.map((e) => escapeRegExp(e.char)).join('|'), 'g');

  // 3. 全局记录已标注过的生僻词（每个词在全文中仅标注第一次出现的位置，杜绝密密麻麻！）
  const markedSet = new Set<string>();

  // 4. 按 HTML 标签拆分，只在纯文本段做替换
  const parts = html.split(/(<[^>]+>)/g);
  for (let i = 0; i < parts.length; i += 2) {
    let text = parts[i];
    if (!text) continue;

    parts[i] = text.replace(pattern, (match) => {
      // 如果这个词已经标注过，则绝不再重复标注！
      if (markedSet.has(match)) {
        return match;
      }
      markedSet.add(match);

      const entry = map.get(match);
      if (!entry) return match;
      const charEnc = encodeURIComponent(entry.char);
      const pinyinEnc = encodeURIComponent(entry.pinyin);
      const meaningEnc = encodeURIComponent(entry.meaning);

      const pinyinHtml = showPinyinAbove
        ? `<span class="zen-pinyin-rt text-[10px] sm:text-[11px] font-sans font-bold leading-none text-amber-700 dark:text-amber-400 tracking-normal mb-0.5 select-none opacity-90">${entry.pinyin}</span>`
        : '';

      return `<ruby id="glossary-term-${charEnc}" class="zen-glossary-term cursor-pointer select-none px-1 py-0.5 mx-0.5 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-950 dark:text-amber-100 border-b-2 border-amber-600/70 hover:bg-amber-500/30 hover:border-amber-700 dark:hover:bg-amber-500/35 transition-all font-semibold inline-flex flex-col items-center align-middle" data-char="${charEnc}" data-pinyin="${pinyinEnc}" data-meaning="${meaningEnc}" title="轻触固定查看详细释义与真人发音">${pinyinHtml}<span class="zen-char-rb leading-normal">${match}</span></ruby>`;
    });
  }

  return parts.join('');
}
