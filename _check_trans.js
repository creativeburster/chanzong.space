const fs = require('fs');
const t = fs.readFileSync('lib/translations.ts', 'utf8');
const idx = t.indexOf('dahuiyulu:');
const end = t.indexOf('\n  ],', idx);
const section = t.substring(idx, end);
const lines = section.split('\n').filter(l => l.trim().startsWith("'"));
console.log('Current translation segments:', lines.length);
