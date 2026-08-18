const fs = require('fs');
const t = fs.readFileSync('lib/translations.ts', 'utf8');
const idx = t.indexOf('dahuiyulu:');
const end = t.indexOf('\n  ],', idx);
const section = t.substring(idx, end);
const lines = section.split('\n').filter(l => l.trim().startsWith("'"));

// Extract volume markers from each translation segment
const volSet = new Set();
lines.forEach(l => {
  const m = l.match(/卷第([一二三四五六七八九十]+)/);
  if (m) volSet.add(m[1]);
  else {
    const m2 = l.match(/【([^】]+)】/);
    if (m2) volSet.add(m2[1].substring(0, 20));
  }
});

console.log('Volumes covered in translations:');
volSet.forEach(v => console.log(' ', v));
console.log('Total unique sections:', volSet.size);
