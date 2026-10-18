const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('🚀 开始线上实测 (https://chanzong.space)...');

  // 1. 简体分类大厅
  const res1 = await fetchUrl('https://chanzong.space/categories');
  console.log('\n[1] /categories:', res1.status, 'HTML length:', res1.data.length);
  console.log('  包含 "经藏分类大厅":', res1.data.includes('经藏分类大厅'));
  console.log('  包含 "宗门语录":', res1.data.includes('宗门语录'));
  console.log('  包含 "印心经藏":', res1.data.includes('印心经藏'));

  // 2. 繁体分类大厅
  const res2 = await fetchUrl('https://chanzong.space/zh-tw/categories');
  console.log('\n[2] /zh-tw/categories:', res2.status, 'HTML length:', res2.data.length);
  console.log('  包含 lang="zh-TW":', res2.data.includes('lang="zh-TW"'));
  console.log('  包含 "經藏分類大廳":', res2.data.includes('經藏分類大廳'));
  console.log('  包含 "宗門語錄":', res2.data.includes('宗門語錄'));

  // 3. 简体分类详情页 (宗门语录)
  const res3 = await fetchUrl('https://chanzong.space/categories/yulu');
  console.log('\n[3] /categories/yulu:', res3.status, 'HTML length:', res3.data.length);
  console.log('  包含 "宗门语录":', res3.data.includes('宗门语录'));
  console.log('  包含 "大机大用":', res3.data.includes('大机大用'));
  console.log('  包含 "马祖道一":', res3.data.includes('马祖道一') || res3.data.includes('江西马祖道一'));

  // 4. 繁体分类详情页 (宗门语录)
  const res4 = await fetchUrl('https://chanzong.space/zh-tw/categories/yulu');
  console.log('\n[4] /zh-tw/categories/yulu:', res4.status, 'HTML length:', res4.data.length);
  console.log('  包含 lang="zh-TW":', res4.data.includes('lang="zh-TW"'));
  console.log('  包含 "宗門語錄":', res4.data.includes('宗門語錄'));

  // 5. 经典详情页分类跳转胶囊 (以碧岩录为例)
  const res5 = await fetchUrl('https://chanzong.space/classics/biyanlu');
  console.log('\n[5] /classics/biyanlu:', res5.status, 'HTML length:', res5.data.length);
  console.log('  包含 /categories/gongan 链接:', res5.data.includes('/categories/gongan'));
  console.log('  包含 /categories/yulu 链接:', res5.data.includes('/categories/yulu'));

  // 6. 检查顶栏下拉菜单
  console.log('\n[6] 顶部导航菜单:');
  console.log('  首页包含 /categories:', res1.data.includes('/categories'));
  console.log('  首页包含 /collections:', res1.data.includes('/collections'));
  console.log('  首页包含 /books:', res1.data.includes('/books'));

  console.log('\n🎉 全部端点实测完毕！');
}

run().catch(console.error);
