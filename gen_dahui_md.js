const fs = require('fs');
const lines = fs.readFileSync('dahui_simplified.txt', 'utf8').split('\n');

// Find content start (after TOC, at the actual 奏劄)
let start = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('进大慧禅师语录奏劄') && i > 200) {
    start = i;
    break;
  }
}

// Find content end (before 谢降赐...奏劄 and 赞助资讯)
let end = lines.length;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('谢降赐大慧禅师语录入藏奏劄')) {
    // Include this section too, find where it ends
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('赞助资讯') || lines[j].includes('卷目次')) {
        end = j;
        break;
      }
    }
    break;
  }
}

console.log('Content start line:', start + 1, ':', lines[start]);
console.log('Content end line:', end + 1, ':', lines[end]);

// Build markdown content
let md = '';
let inVolume = false;
let volumeTitle = '';

for (let i = start; i < end; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Check if this is a volume header
  if (line.match(/卷第[一二三四五六七八九十]+/) && line.length < 60) {
    // Skip duplicate end-of-volume markers (they appear at end of previous volume)
    // Only add as header if next line is different content
    md += '\n### ' + line + '\n\n';
    inVolume = true;
    continue;
  }
  
  // Check for section headers (奏劄, 塔铭, 室中机缘, 颂古, etc.)
  if (line.length < 30 && (line.includes('奏劄') || line.includes('塔铭') || line.includes('室中机缘') || line.includes('颂古') || line.includes('偈颂') || line.includes('赞佛祖') || line.includes('普说') || line.includes('法语') || line.includes('自赞'))) {
    // Only if it looks like a header, not content
    if (!line.includes('。') && !line.includes('师') && !line.includes('云')) {
      md += '\n### ' + line + '\n\n';
      continue;
    }
  }
  
  md += line + '\n';
}

// Write to temp file
fs.writeFileSync('_dahui_content.txt', md);
console.log('Generated content length:', md.length, 'chars');
console.log('Total lines in output:', md.split('\n').length);
