const fs = require('fs');
const path = require('path');

const serverApp = path.join('.next', 'server', 'app');

function inspectHtml(relPath) {
  const p = path.join(serverApp, relPath);
  if (!fs.existsSync(p)) {
    console.error('NOT FOUND:', p);
    return;
  }
  const html = fs.readFileSync(p, 'utf8');
  const hanChars = (html.match(/[\u4e00-\u9fa5]/g) || []).length;
  const langMatch = html.match(/<html[^>]*lang="([^"]+)"/);
  const lang = langMatch ? langMatch[1] : 'unknown';
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'no title';
  console.log(relPath.padEnd(45), 'chars:', String(hanChars).padStart(5), 'lang:', lang.padEnd(7), 'title:', title);
}

console.log('=== 合集总览与详情 HTML 直出核验 ===');
inspectHtml('collections.html');
inspectHtml('zh-tw/collections.html');
inspectHtml('collections/shaoshiliumen.html');
inspectHtml('zh-tw/collections/shaoshiliumen.html');
inspectHtml('collections/chuanfazhengzong.html');
inspectHtml('zh-tw/collections/chuanfazhengzong.html');
inspectHtml('collections/huangboyulu.html');
inspectHtml('zh-tw/collections/huangboyulu.html');
inspectHtml('collections/yongmingyixin.html');
inspectHtml('zh-tw/collections/yongmingyixin.html');
inspectHtml('collections/shiqinweishi.html');
inspectHtml('zh-tw/collections/shiqinweishi.html');
inspectHtml('collections/longshuzhongguan.html');
inspectHtml('zh-tw/collections/longshuzhongguan.html');
inspectHtml('collections/lianhuashengdayuanman.html');
inspectHtml('zh-tw/collections/lianhuashengdayuanman.html');
