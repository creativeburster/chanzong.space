const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const nextAppDir = path.join(__dirname, '..', '.next', 'server', 'app');

// 优先处理静态导出目录 out/，若不存在则回退 .next/server/app
const baseDir = fs.existsSync(outDir) ? outDir : nextAppDir;
const zhTwDir = path.join(baseDir, 'zh-tw');
const zhTwRootHtml = path.join(baseDir, 'zh-tw.html');

if (!fs.existsSync(zhTwDir) && !fs.existsSync(zhTwRootHtml)) {
  console.log('[postbuild_i18n] zh-tw directory not found, skipping.');
  process.exit(0);
}

let count = 0;

function updateHtmlLang(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<html lang="zh-CN"')) {
    content = content.replace('<html lang="zh-CN"', '<html lang="zh-TW"');
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      processDir(fullPath);
    } else if (file.isFile() && file.name.endsWith('.html')) {
      updateHtmlLang(fullPath);
    }
  }
}

console.log(`[postbuild_i18n] Updating lang="zh-TW" in ${path.relative(path.join(__dirname, '..'), baseDir)}...`);

if (fs.existsSync(zhTwRootHtml)) {
  updateHtmlLang(zhTwRootHtml);
}

processDir(zhTwDir);
console.log(`[postbuild_i18n] Successfully updated ${count} traditional HTML pages to lang="zh-TW"!`);
