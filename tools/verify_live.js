const https = require('https');

function checkUrl(url, tests) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n=== Checking: ${url} ===`);
        console.log(`HTTP Status: ${res.statusCode}`);
        for (const [name, fn] of Object.entries(tests)) {
          console.log(`- ${name}: ${fn(data) ? 'PASS ✅' : 'FAIL ❌'}`);
        }
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  await checkUrl('https://chanzong.space/koan/koan-1', {
    'Has QAPage schema': d => d.includes('"@type":"QAPage"'),
    'Has acceptedAnswer': d => d.includes('"acceptedAnswer"'),
    'Has Infobox Section': d => d.includes('公案实体关系档案'),
    'Has Table structure': d => d.includes('<table')
  });

  await checkUrl('https://chanzong.space/methods/nianfo-chan', {
    'Has HowTo schema': d => d.includes('"@type":"HowTo"'),
    'Has HowToStep': d => d.includes('"@type":"HowToStep"'),
    'Has Infobox Section': d => d.includes('法门实体关系档案')
  });

  await checkUrl('https://chanzong.space/sitemap', {
    'Has details open': d => d.includes('<details open'),
    'Has classics links': d => d.includes('/classics/'),
    'Has koans links': d => d.includes('/koan/')
  });

  await checkUrl('https://chanzong.space/llms.txt', {
    'Is compact (<15KB)': d => d.length < 15000,
    'Mentions chan architecture': d => d.includes('禅宗知识库')
  });

  await checkUrl('https://chanzong.space/llms/classics.txt', {
    'Has full classics corpus': d => d.length > 50000 && d.includes('六祖坛经')
  });
}

main().catch(console.error);
