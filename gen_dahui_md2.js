const fs = require('fs');

// Read existing markdown header (lines 1-46, before 原文 section)
const existingMd = fs.readFileSync('classics_markdown/45_dahuiyulu.md', 'utf8');
const headerEnd = existingMd.indexOf('## 原文');
const header = existingMd.substring(0, headerEnd);

// Read source text
const srcLines = fs.readFileSync('dahui_simplified.txt', 'utf8').split('\n');

// Find content start (after TOC, at the actual 奏劄 - line 223)
let start = 0;
for (let i = 200; i < srcLines.length; i++) {
  if (srcLines[i].includes('进大慧禅师语录奏劄')) {
    start = i;
    break;
  }
}

// Find content end (before 赞助资讯)
let end = srcLines.length;
for (let i = srcLines.length - 1; i >= 0; i--) {
  if (srcLines[i].includes('谢降赐大慧禅师语录入藏奏劄')) {
    // Find end of this section
    for (let j = i + 1; j < srcLines.length; j++) {
      if (srcLines[j].includes('赞助资讯') || srcLines[j].includes('卷目次')) {
        end = j;
        break;
      }
    }
    break;
  }
}

console.log('Source content: lines', start + 1, 'to', end);

// Build the complete markdown
let md = header;
md += '## 原文\n\n';

// Track volume headers to avoid duplicates
const seenVolumes = new Set();

for (let i = start; i < end; i++) {
  const line = srcLines[i];
  const trimmed = line.trim();
  
  if (!trimmed) continue;
  
  // Check if this is a volume header line
  const volMatch = trimmed.match(/卷第[一二三四五六七八九十]+/);
  if (volMatch && trimmed.length < 60) {
    const volKey = trimmed.substring(0, 30);
    if (!seenVolumes.has(volKey)) {
      seenVolumes.add(volKey);
      md += '\n### ' + trimmed + '\n\n';
      continue;
    }
    // Skip duplicate end-of-volume markers
    continue;
  }
  
  // Check for major section headers
  if (trimmed.length < 25 && !trimmed.includes('。')) {
    if (trimmed === '进大慧禅师语录奏劄' || 
        trimmed === '大慧普觉禅师塔铭' ||
        trimmed === '室中机缘' ||
        trimmed === '颂古' ||
        trimmed === '大慧普觉禅师自赞' ||
        trimmed === '普说' ||
        trimmed === '谢降赐大慧禅师语录入藏奏劄') {
      md += '\n### ' + trimmed + '\n\n';
      continue;
    }
  }
  
  md += trimmed + '\n';
}

fs.writeFileSync('classics_markdown/45_dahuiyulu.md', md);
console.log('Written markdown file:', md.length, 'chars,', md.split('\n').length, 'lines');
console.log('Volume headers found:', seenVolumes.size);
