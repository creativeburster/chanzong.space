/**
 * 经典正文分卷解析工具
 * 自动识别带有 <h3> 分卷标题的大部头经典，实现卷级导航与单卷/全卷阅读模式切换
 */

export interface ClassicVolume {
  index: number;
  title: string;
  html: string;
}

export interface ParsedClassicVolumes {
  guideHtml: string;
  volumes: ClassicVolume[];
  isMultiVolume: boolean;
}

/**
 * 从 marked 解析后的 HTML 中分离导读部分与各分卷
 */
export function splitClassicVolumes(htmlContent: string): ParsedClassicVolumes {
  if (!htmlContent) {
    return { guideHtml: '', volumes: [], isMultiVolume: false };
  }

  // 1. 定位 "📜 典籍原文" 的二级标题
  // marked 将 ## 标题渲染为 <h2>
  const bodyHeaderRegex = /<h2[^>]*>(?:📜\s*)?典籍原文<\/h2>/i;
  const match = htmlContent.match(bodyHeaderRegex);

  if (!match || match.index === undefined) {
    return {
      guideHtml: htmlContent,
      volumes: [],
      isMultiVolume: false,
    };
  }

  const guideHtml = htmlContent.slice(0, match.index + match[0].length);
  const bodyHtml = htmlContent.slice(match.index + match[0].length);

  // 2. 匹配 bodyHtml 中的所有 <h3> 标题
  // 形式如: <h3 id="...">标题文本</h3>
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  const h3Matches: { index: number; length: number; title: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = h3Regex.exec(bodyHtml)) !== null) {
    const rawTitle = m[1].replace(/<[^>]+>/g, '').trim();
    h3Matches.push({
      index: m.index,
      length: m[0].length,
      title: rawTitle,
    });
  }

  // 如果分卷标题少于 2 个，则不作为多卷处理
  if (h3Matches.length < 2) {
    return {
      guideHtml,
      volumes: [],
      isMultiVolume: false,
    };
  }

  // 3. 按照 <h3> 拆分各卷
  const volumes: ClassicVolume[] = [];
  let volIndex = 1;

  // 检查在第一个 <h3> 之前是否有实质内容（如序跋、全书总目等）
  const preludeHtml = bodyHtml.slice(0, h3Matches[0].index).trim();
  if (preludeHtml.length > 30) {
    const rawFirstLine = preludeHtml.replace(/<[^>]+>/g, '').trim().split('\n')[0].trim();
    const preludeTitle = rawFirstLine && rawFirstLine.length < 30 ? `卷首 · ${rawFirstLine}` : '卷首 · 序文与总目';
    volumes.push({
      index: volIndex++,
      title: preludeTitle,
      html: `<h3 id="volume-prelude" class="text-xl font-bold font-serif mb-4 text-[#8C6D46] dark:text-[#E6C280]">${preludeTitle}</h3>\n${preludeHtml}`,
    });
  }

  for (let i = 0; i < h3Matches.length; i++) {
    const current = h3Matches[i];
    const startIndex = current.index;
    const endIndex = i + 1 < h3Matches.length ? h3Matches[i + 1].index : bodyHtml.length;
    const volumeHtml = bodyHtml.slice(startIndex, endIndex).trim();

    volumes.push({
      index: volIndex++,
      title: current.title,
      html: volumeHtml,
    });
  }

  return {
    guideHtml,
    volumes,
    isMultiVolume: true,
  };
}
