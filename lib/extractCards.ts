/* ---- 经典页面自动卡片提取器：从markdown原文自动解析偈颂/公案/修行指南/现代应用 ---- */

export interface KoanItem {
  question: string;
  answer: string;
}

export interface ExtractedCards {
  verses: string[];        // 核心偈颂
  koans: KoanItem[];       // 公案精选
  practices: string[];     // 修行指南
  modernApp: string[];     // 现代应用
  keyQuotes: string[];     // 核心语句（加粗/引用句）
}

/** 从markdown原文中提取偈颂（连续短句韵文段落） */
function extractVerses(content: string): string[] {
  const verses: string[] = [];
  // 匹配显式偈颂段落
  const versePatterns = [
    /偈[曰云]?\s*[：:]\s*([\s\S]{10,300}?)(?=\n\n|\n###|\n##|$)/g,
    /颂[曰云]?\s*[：:]\s*([\s\S]{10,300}?)(?=\n\n|\n###|\n##|$)/g,
    /(?:述|作|示)(?:一)?偈[曰云]?\s*[：:]\s*([\s\S]{10,300}?)(?=\n\n|\n###|\n##|$)/g,
  ];
  for (const pat of versePatterns) {
    let m;
    while ((m = pat.exec(content)) !== null) {
      const text = m[1].trim().replace(/\n+/g, '，').replace(/，{2,}/g, '，');
      if (text.length > 10 && text.length < 500 && !verses.some(v => v === text)) {
        verses.push(text);
      }
    }
  }
  // 匹配markdown中的加粗偈颂行（如五位颂）
  const boldPattern = /\*\*([^*]{4,20})\*\*[：:]\s*([^*\n]{10,100})/g;
  let bm: RegExpExecArray | null;
  while ((bm = boldPattern.exec(content)) !== null) {
    const text = `**${bm[1]}**：${bm[2].trim()}`;
    if (!verses.some(v => v.includes(bm![1]))) {
      verses.push(text);
    }
  }
  return verses.slice(0, 8);
}

/** 提取公案问答 */
function extractKoans(content: string): KoanItem[] {
  const koans: KoanItem[] = [];
  // 匹配 问/答 或 僧问/师云 模式
  const patterns = [
    /(?:僧)?问[：:]\s*["「]?([^"」\n]{4,60}?)["」]?\s*[。，]?\s*(?:师|师云|师曰|答)[曰云答]?[：:]\s*["「]?([^"」\n]{2,80}?)["」]?(?=[\s。，\n])/g,
    /(?:僧|学人|徒)问[：:]\s*["「]?([^"」\n]{4,60}?)["」]?\s*[。，]?\s*(?:师|大师|和尚)[曰云答]?[：:]\s*["「]?([^"」\n]{2,80}?)["」]?(?=[\s。，\n])/g,
  ];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(content)) !== null) {
      const q = m[1].trim();
      const a = m[2].trim();
      if (q.length >= 4 && a.length >= 2 && !koans.some(k => k.question === q)) {
        koans.push({ question: q, answer: a });
      }
    }
  }
  return koans.slice(0, 10);
}

/** 提取修行指南（含"如何""方法""步骤""修"等关键词的实用段落） */
function extractPractices(content: string): string[] {
  const practices: string[] = [];
  const lines = content.split('\n');
  let inKeySection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/📌|重点内容|修行|方法|步骤|如何/.test(trimmed)) inKeySection = true;
    if (/^##/.test(trimmed) && !/📌|重点内容/.test(trimmed)) inKeySection = false;
    if (inKeySection && trimmed.startsWith('-') && trimmed.length > 20) {
      const text = trimmed.replace(/^-\s*/, '').replace(/\*\*/g, '');
      if (text.length > 15 && text.length < 300) practices.push(text);
    }
  }
  return practices.slice(0, 6);
}

/** 提取现代应用（从导读和重点内容中提取对现代人的启示） */
function extractModernApp(content: string): string[] {
  const apps: string[] = [];
  const lines = content.split('\n');
  let inIntro = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/💡|导读|核心旨趣/.test(trimmed)) { inIntro = true; continue; }
    if (/^##/.test(trimmed) && !/💡|导读/.test(trimmed)) inIntro = false;
    if (inIntro && trimmed.length > 30 && !trimmed.startsWith('#') && !trimmed.startsWith('>') && !trimmed.startsWith('-')) {
      const clean = trimmed.replace(/\*\*/g, '');
      if (clean.length > 20 && clean.length < 400) apps.push(clean);
    }
  }
  // 从难点中提取
  let inPitfall = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/⚠️|难点|误区/.test(trimmed)) { inPitfall = true; continue; }
    if (/^##/.test(trimmed) && !/⚠️|难点/.test(trimmed)) inPitfall = false;
    if (inPitfall && /^\d/.test(trimmed) && trimmed.length > 20) {
      const clean = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
      if (clean.length > 15 && clean.length < 300) apps.push(clean);
    }
  }
  return apps.slice(0, 5);
}

/** 提取核心语句（加粗句、引用句） */
function extractKeyQuotes(content: string): string[] {
  const quotes: string[] = [];
  // 提取加粗的核心句
  const boldPattern = /\*\*([^*]{6,80})\*\*/g;
  let m;
  while ((m = boldPattern.exec(content)) !== null) {
    const text = m[1].trim();
    if (!/[：:关键词主旨重点难点]/.test(text) && !quotes.includes(text)) {
      quotes.push(text);
    }
  }
  return quotes.slice(0, 8);
}

/** 主提取函数 */
export function extractCards(rawContent: string): ExtractedCards {
  return {
    verses: extractVerses(rawContent),
    koans: extractKoans(rawContent),
    practices: extractPractices(rawContent),
    modernApp: extractModernApp(rawContent),
    keyQuotes: extractKeyQuotes(rawContent),
  };
}

/** 从manifest自动推断历史背景 */
export function inferHistory(meta: { author: string; category: string; word_count: number }, personEra?: string) {
  const eraKeywords = '后秦|东晋|隋|唐|宋|五代|高丽|明|清|元|南北朝|北宋|南宋|梁|梁代|唐代|宋代|元代|明代|清代';
  const eraMatch = meta.author.match(new RegExp('^(' + eraKeywords + ')'));
  let era = eraMatch?.[1] || '';
  if (era === '唐代') era = '唐';
  if (era === '宋代') era = '宋';
  if (era === '元代') era = '元';
  if (era === '明代') era = '明';
  if (era === '清代') era = '清';
  if (era === '梁代') era = '南北朝';
  if (era === '梁') era = '南北朝';
  if (era === '北宋' || era === '南宋') era = '宋';

  if (!era && personEra) {
    const pe = personEra.match(new RegExp('^(' + eraKeywords + ')'));
    if (pe) {
      era = pe[1];
      if (era === '唐代') era = '唐';
      if (era === '宋代') era = '宋';
      if (era === '元代') era = '元';
      if (era === '明代') era = '明';
      if (era === '清代') era = '清';
      if (era === '梁代' || era === '梁') era = '南北朝';
      if (era === '北宋' || era === '南宋') era = '宋';
    }
  }
  const eraMap: Record<string, string> = {
    '后秦': '十六国后秦（384-417），鸠摩罗什来华译经，大乘经典大量传入',
    '东晋': '东晋（317-420），般若学与玄学会通，禅法初传',
    '南北朝': '南北朝（420-589），达摩东来，禅宗初传东土',
    '隋': '隋代（581-618），三祖僧璨著《信心铭》，禅宗法脉延续',
    '唐': '唐代（618-907），禅宗黄金时代，五家七宗相继兴起',
    '五代': '五代十国（907-979），禅宗五家分化的关键时期',
    '宋': '宋代（960-1279），禅宗由盛转精，语录灯录大量编纂',
    '高丽': '高丽王朝（918-1392），朝鲜半岛禅宗兴盛期',
    '元': '元代（1271-1368），禅净合流趋势加强',
    '明': '明代（1368-1644），禅宗与净土融合，注疏整理工作兴盛',
    '清': '清代（1644-1911），禅宗渐趋式微，以传承维系为主',
  };
  const sizeLabel = meta.word_count < 1000 ? '短篇' : meta.word_count < 10000 ? '中篇' : meta.word_count < 50000 ? '长篇' : '大部头';
  return {
    era,
    eraDesc: eraMap[era] || '',
    sizeLabel,
    wordCount: meta.word_count,
  };
}
