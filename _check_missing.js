const fs = require('fs');
const lines = fs.readFileSync('dahui_simplified.txt', 'utf8').split('\n');

// Find all volume boundaries
const vols = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.match(/卷第[一二三四五六七八九十]+/) && l.length < 60) {
    vols.push({ title: l, line: i + 1 });
  }
}

// Also find section markers
const sections = ['进大慧禅师语录奏劄', '大慧普觉禅师塔铭', '室中机缘', '颂古', '大慧普觉禅师自赞', '普说', '谢降赐大慧禅师语录入藏奏劄'];
for (let i = 200; i < lines.length; i++) {
  const l = lines[i].trim();
  if (sections.includes(l) && l.length < 30) {
    vols.push({ title: l, line: i + 1 });
  }
}

// Sort by line number
vols.sort((a, b) => a.line - b.line);

// Calculate sizes
const missing = ['卷第六', '卷第九', '卷第十一', '卷第十二', '卷第二十一', '卷第二十五', '卷第二十六', '卷第二十七', '卷第二十八', '卷第二十九', '卷第三十'];

for (let i = 0; i < vols.length; i++) {
  const start = vols[i].line;
  const end = i + 1 < vols.length ? vols[i + 1].line : lines.length;
  const charCount = lines.slice(start - 1, end - 1).join('').replace(/\s/g, '').length;
  const isMissing = missing.some(m => vols[i].title.includes(m));
  if (isMissing) {
    console.log(`[MISSING] ${vols[i].title} | lines ${start}-${end} | ${charCount} chars`);
  }
}
