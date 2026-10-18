import { SIMP_CHARS, TRAD_CHARS, PHRASE_OVERRIDES } from './opencc-sync-dict';

let s2tConverter: ((text: string) => string) | null = null;
let t2sConverter: ((text: string) => string) | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

const tradCache = new Map<string, string>(Object.entries(PHRASE_OVERRIDES));
const simpCache = new Map<string, string>();
const MAX_CACHE_SIZE = 15000;

// 构建极速同步单字映射表（供客户端首帧 Hydration 0ms 零延迟同步转换，彻底消除 React 水合 #418/#425 与简繁闪回）
const s2tCharMap = new Map<string, string>();
const t2sCharMap = new Map<string, string>();
for (let i = 0; i < SIMP_CHARS.length; i++) {
  s2tCharMap.set(SIMP_CHARS[i], TRAD_CHARS[i]);
  t2sCharMap.set(TRAD_CHARS[i], SIMP_CHARS[i]);
}

function syncConvertToTrad(text: string): string {
  if (PHRASE_OVERRIDES[text]) return PHRASE_OVERRIDES[text];
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += s2tCharMap.get(ch) || ch;
  }
  return out;
}

function syncConvertToSimp(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += t2sCharMap.get(ch) || ch;
  }
  return out;
}

// 服务端环境（SSG 静态生成）直接同步初始化 OpenCC 保证 HTML 全量繁体预渲染
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenCC = require('opencc-js');
    s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' });
  } catch {
    // ignore
  }
}

/**
 * 客户端按需异步加载完整 OpenCC 词库模块
 */
export async function ensureOpenCC(): Promise<void> {
  if (s2tConverter && t2sConverter) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const OpenCC = await import('opencc-js');
      s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
      t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' });
    } catch (e) {
      console.error('Failed to load OpenCC:', e);
    }
  })();

  return initPromise;
}

export function convertToTrad(text: string): string {
  if (!text) return text;
  if (tradCache.has(text)) {
    return tradCache.get(text)!;
  }
  if (!s2tConverter) {
    if (typeof window !== 'undefined' && !isInitializing) {
      isInitializing = true;
      ensureOpenCC();
    }
    return syncConvertToTrad(text);
  }
  const result = s2tConverter(text);
  if (tradCache.size > MAX_CACHE_SIZE) {
    tradCache.clear();
    for (const [k, v] of Object.entries(PHRASE_OVERRIDES)) {
      tradCache.set(k, v);
    }
  }
  tradCache.set(text, result);
  return result;
}

export function convertToSimp(text: string): string {
  if (!text) return text;
  if (simpCache.has(text)) {
    return simpCache.get(text)!;
  }
  if (!t2sConverter) {
    if (typeof window !== 'undefined' && !isInitializing) {
      isInitializing = true;
      ensureOpenCC();
    }
    return syncConvertToSimp(text);
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
