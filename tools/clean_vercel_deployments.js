const { execSync } = require('child_process');

console.log('=== 获取 Vercel 历史部署列表 ===');
const rawJson = execSync('npx vercel list --scope chanzong --format json', { encoding: 'utf8' });
const data = JSON.parse(rawJson);

const deployments = data.deployments || [];
console.log(`共检索到 ${deployments.length} 个部署版本。`);

if (deployments.length <= 1) {
  console.log('当前仅有 1 个（或 0 个）部署版本，无需清理。');
  process.exit(0);
}

// 保留最新的生产版本 (index 0)
const currentActive = deployments[0];
console.log(`当前活跃的生产版本: https://${currentActive.url} (创建于: ${new Date(currentActive.createdAt).toLocaleString('zh-CN')}) [保持保留]`);

const toRemove = deployments.slice(1);
console.log(`准备清理 ${toRemove.length} 个历史部署快照...\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < toRemove.length; i++) {
  const d = toRemove[i];
  const url = d.url;
  const timeStr = new Date(d.createdAt).toLocaleString('zh-CN');
  process.stdout.write(`[${i + 1}/${toRemove.length}] 正在删除 ${url} (${timeStr})... `);
  try {
    execSync(`npx vercel rm https://${url} --yes --scope chanzong`, { stdio: 'pipe' });
    console.log('✓ 成功删除');
    successCount++;
  } catch (err) {
    console.log('✗ 失败:', err.message);
    failCount++;
  }
}

console.log(`\n=== 清理完成: 成功删除 ${successCount} 个旧快照, 失败 ${failCount} 个 ===`);
