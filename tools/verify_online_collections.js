const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function verifyOnline() {
  console.log('=== 开始线上生产环境实测 (chanzong.space) ===\n');

  // 1. 合集总览大厅 (简体)
  const hallRes = await fetchUrl('https://chanzong.space/collections');
  console.log('1. /collections 状态码:', hallRes.status);
  const hallChars = (hallRes.html.match(/[\u4e00-\u9fa5]/g) || []).length;
  console.log('   直出汉字数:', hallChars);
  const titles = [
    '少室六门', '传法正宗三书', '黄檗断际禅师语录', '永明延寿一心法界全书', '普照国师修心指南',
    '圆悟佛果禅师禅法总集', '永嘉禅法合集', '牛头禅心性双璧', '玄沙师备禅师全录', '天童如净禅师录',
    '明代空谷禅师二编', '世亲菩萨唯识宗义集', '龙树菩萨中观根本论典集', '大圆满心性直指集'
  ];
  let foundCount = 0;
  for (const t of titles) {
    if (hallRes.html.includes(t)) foundCount++;
    else console.log('   [MISSING]:', t);
  }
  console.log('   14 个合集标题在 DOM 中出现:', foundCount + '/14');

  // 2. 合集总览大厅 (繁体)
  const twHallRes = await fetchUrl('https://chanzong.space/zh-tw/collections');
  console.log('\n2. /zh-tw/collections 状态码:', twHallRes.status);
  const twLang = twHallRes.html.includes('lang="zh-TW"');
  console.log('   lang="zh-TW" 标志:', twLang);
  const tradTitleCheck = twHallRes.html.includes('少室六門') && twHallRes.html.includes('傳法正宗三書') && twHallRes.html.includes('永明延壽一心法界全書');
  console.log('   繁体合集标题存在:', tradTitleCheck);

  // 3. 抽测合集详情页 (永明延寿一心法界全书)
  const yongmingRes = await fetchUrl('https://chanzong.space/collections/yongmingyixin');
  console.log('\n3. /collections/yongmingyixin 状态码:', yongmingRes.status);
  const yongmingChars = (yongmingRes.html.match(/[\u4e00-\u9fa5]/g) || []).length;
  console.log('   详情页汉字数:', yongmingChars);
  const booksCheck = yongmingRes.html.includes('唯心诀') && yongmingRes.html.includes('宗镜录') && yongmingRes.html.includes('万善同归集');
  console.log('   三部曲子典籍直出:', booksCheck);

  // 4. 检查 sitemap.xml
  const sitemapRes = await fetchUrl('https://chanzong.space/sitemap.xml');
  console.log('\n4. /sitemap.xml 状态码:', sitemapRes.status);
  const sitemapHasCollections = sitemapRes.html.includes('<loc>https://chanzong.space/collections</loc>');
  const sitemapHasYongming = sitemapRes.html.includes('collections/yongmingyixin');
  console.log('   sitemap 包含 /collections 大厅:', sitemapHasCollections);
  console.log('   sitemap 包含 /collections/yongmingyixin:', sitemapHasYongming);
}

verifyOnline().catch(console.error);
