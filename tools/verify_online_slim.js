const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== 验证线上生产环境 (https://chanzong.space) ===');
  const faq = await fetchUrl('https://chanzong.space/faq');
  const details = (faq.match(/<details/g) || []).length;
  const questions = (faq.match(/"@type":"Question"/g) || []).length;
  console.log('1. 线上 /faq -> 原生 details 数量:', details, 'JSON-LD Question 数量:', questions);

  const zhFaq = await fetchUrl('https://chanzong.space/zh-tw/faq');
  const zhDetails = (zhFaq.match(/<details/g) || []).length;
  const zhQuestions = (zhFaq.match(/"@type":"Question"/g) || []).length;
  console.log('2. 线上 /zh-tw/faq -> 原生 details 数量:', zhDetails, 'JSON-LD Question 数量:', zhQuestions);

  const qifo = await fetchUrl('https://chanzong.space/classics/qifo');
  console.log('3. 线上 /classics/qifo -> 包含白话今译:', qifo.includes('白话今译'));
  
  const zjl = await fetchUrl('https://chanzong.space/classics/zongjinglu');
  console.log('4. 线上 /classics/zongjinglu -> 包含最后一句:', zjl.includes('真如无尽之福。如法界比微尘。岂可校量乎'));
}

run().catch(console.error);
