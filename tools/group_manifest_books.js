const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

const groups = {};
manifest.forEach(b => {
  const cat = b.category || '未分类';
  if (!groups[cat]) groups[cat] = [];
  groups[cat].push({ id: b.id, title: b.title });
});

for (const [cat, books] of Object.entries(groups)) {
  console.log(`\n### ${cat} (${books.length})`);
  console.log(books.map(b => `${b.id}: ${b.title}`).join(' | '));
}
