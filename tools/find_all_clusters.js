const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// 提取作者核心名字
const knownMasters = [
  '菩提达摩', '僧璨', '道信', '弘忍', '慧能', '六祖', '神会',
  '马祖道一', '百丈怀海', '黄檗希运', '临济义玄', '沩山灵祐', '仰山慧寂',
  '赵州从念念', '赵州', '云门文偃', '法眼文益', '玄沙师备', '雪峰义存',
  '洞山良价', '曹山本寂', '石头希迁', '药山惟俨', '德山宣鉴', '岩头全奯',
  '圜悟克勤', '圆悟', '佛果', '大慧宗杲', '宏智正觉', '天童如净', '虚堂智愚',
  '杨岐方会', '黄龙慧南', '白云守端', '五祖法演', '密菴咸杰', '无门慧开',
  '永嘉玄觉', '牛头法融', '圭峰宗密', '宗密', '永明延寿', '延寿', '知呐', '普照知呐',
  '傅大士', '善慧', '庞蕴', '庞居士', '宝志', '志公', '布袋和尚',
  '紫柏真可', '憨山德清', '莲池袾宏', '云栖袾宏', '蕅益智旭', '空谷景隆',
  '契嵩', '镡津契嵩', '希叟绍昙', '海印昭如', '剑关子益', '雪岩祖钦',
  '龙树', '世亲', '无著', '马鸣', '提婆', '清辩', '真谛', '玄奘', '鸠摩罗什', '僧肇',
  '求那跋陀罗', '实叉难陀', '义净', '不空', '善无畏', '莲花生'
];

const results = {};

manifest.forEach(item => {
  const author = item.author || '';
  let matched = null;
  for (const master of knownMasters) {
    if (author.includes(master)) {
      matched = master;
      break;
    }
  }
  const key = matched || author;
  if (!results[key]) results[key] = [];
  results[key].push(item);
});

// 合并别名
function mergeKeys(k1, k2, target) {
  if (results[k1] && results[k2]) {
    results[target] = [...(results[k1]||[]), ...(results[k2]||[])];
    if (target !== k1) delete results[k1];
    if (target !== k2) delete results[k2];
  }
}

mergeKeys('延寿', '永明延寿', '永明延寿');
mergeKeys('圜悟克勤', '圆悟', '圜悟克勤');
mergeKeys('傅大士', '善慧', '傅大士');
mergeKeys('契嵩', '镡津契嵩', '契嵩');
mergeKeys('宗密', '圭峰宗密', '宗密');
mergeKeys('知呐', '普照知呐', '知呐');

console.log('=== 全面聚类分析：包含 2 部及以上作品的核心人物 ===\n');

Object.entries(results)
  .filter(([_, list]) => list.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([name, list]) => {
    console.log(`\n【${name}】(共 ${list.length} 部经典):`);
    list.forEach(i => {
      console.log(`  - [idx ${i.idx}] 《${i.title}》 (id: ${i.id}) — ${i.author}`);
    });
  });
