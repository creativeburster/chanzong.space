const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// 统一规范作者名称（去除唐·、宋·等朝代前缀和“著/述/集”后缀，便于聚类）
function normalizeAuthor(raw) {
  if (!raw) return '未知';
  let a = raw.replace(/^(东汉|西晋|东晋|南北朝|隋|唐|五代|北宋|南宋|宋|元|明|清|梁|后秦|姚秦|曹魏)[·\s]*/g, '');
  a = a.replace(/[\s·]*(著|述|集|编|撰|造|译|说|录|汇集|笔受|重编|重集).*$/g, '');
  return a.trim() || raw;
}

const map = {};
manifest.forEach(item => {
  const norm = normalizeAuthor(item.author);
  if (!map[norm]) map[norm] = { rawAuthors: new Set(), list: [] };
  map[norm].rawAuthors.add(item.author);
  map[norm].list.push(item);
});

console.log('=== 拥有 2 部及以上作品的禅师/宗师统计 ===\n');
const sorted = Object.entries(map)
  .filter(([_, data]) => data.list.length >= 2)
  .sort((a, b) => b[1].list.length - a[1].list.length);

sorted.forEach(([author, data]) => {
  console.log(`\n【${author}】(共 ${data.list.length} 部): 原始作者名: [${Array.from(data.rawAuthors).join(' / ')}]`);
  data.list.forEach(i => {
    console.log(`  - [idx ${i.idx}] 《${i.title}》 (id: ${i.id}, 分类: ${i.category})`);
  });
});
