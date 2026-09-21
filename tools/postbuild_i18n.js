const fs = require('fs');
const path = require('path');

const zhTwDir = path.join(__dirname, '..', '.next', 'server', 'app', 'zh-tw');

if (!fs.existsSync(zhTwDir)) {
  console.log('[postbuild_i18n] zh-tw directory not found, skipping.');
  process.exit(0);
}

let count = 0;

function processDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      processDir(fullPath);
    } else if (file.isFile() && file.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<html lang="zh-CN"')) {
        content = content.replace('<html lang="zh-CN"', '<html lang="zh-TW"');
        fs.writeFileSync(fullPath, content, 'utf8');
        count++;
      }
    }
  }
}

console.log('[postbuild_i18n] Updating lang="zh-TW" for all traditional HTML pages...');

const zhTwRootHtml = path.join(__dirname, '..', '.next', 'server', 'app', 'zh-tw.html');
if (fs.existsSync(zhTwRootHtml)) {
  let content = fs.readFileSync(zhTwRootHtml, 'utf8');
  if (content.includes('<html lang="zh-CN"')) {
    content = content.replace('<html lang="zh-CN"', '<html lang="zh-TW"');
    fs.writeFileSync(zhTwRootHtml, content, 'utf8');
    count++;
  }
}

processDir(zhTwDir);
console.log(`[postbuild_i18n] Successfully updated ${count} traditional HTML pages to lang="zh-TW"!`);
