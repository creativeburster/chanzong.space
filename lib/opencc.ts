import * as OpenCC from 'opencc-js';

// 初始化 OpenCC 高性能双向转换器
// 'twp': 包含台湾/传统繁体常用词汇习惯（如 打印->列印、软件->軟體、网络->網路、信息->資訊、默认->預設 等）
const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });
const t2sConverter = OpenCC.Converter({ from: 'twp', to: 'cn' });

const tradCache = new Map<string, string>();
const simpCache = new Map<string, string>();
const MAX_CACHE_SIZE = 10000;

export function convertToTrad(text: string): string {
  if (!text) return text;
  if (tradCache.has(text)) {
    return tradCache.get(text)!;
  }
  const result = s2tConverter(text);
  if (tradCache.size > MAX_CACHE_SIZE) {
    tradCache.clear();
  }
  tradCache.set(text, result);
  return result;
}

export function convertToSimp(text: string): string {
  if (!text) return text;
  if (simpCache.has(text)) {
    return simpCache.get(text)!;
  }
  const result = t2sConverter(text);
  if (simpCache.size > MAX_CACHE_SIZE) {
    simpCache.clear();
  }
  simpCache.set(text, result);
  return result;
}

/**
 * 安全 HTML 繁简转换：
 * 仅转换 HTML 标签外侧的文本节点，完整保留所有标签名、class 类名、id、style 与 href 属性！
 */
export function convertHtmlToTrad(html: string): string {
  if (!html) return html;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) return tag;
    return convertToTrad(text);
  });
}

/**
 * 根据语言偏好返回正确的站内跳转链接（繁体站自动带 /zh-tw 前缀）
 */
export function getLocalizedHref(href: string, isTraditional: boolean): string {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) {
    return href;
  }
  if (isTraditional) {
    if (href === '/' || href === '') return '/zh-tw';
    if (!href.startsWith('/zh-tw')) {
      return `/zh-tw${href.startsWith('/') ? href : `/${href}`}`;
    }
    return href;
  } else {
    if (href.startsWith('/zh-tw')) {
      const stripped = href.replace(/^\/zh-tw/, '');
      return stripped === '' ? '/' : stripped;
    }
    return href;
  }
}
