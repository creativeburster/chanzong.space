const fs = require('fs');

const faqHtml = fs.readFileSync('.next/server/app/faq.html', 'utf8');
const detailsCount = (faqHtml.match(/<details/g) || []).length;
const jsonLdMatch = faqHtml.match(/"@type":"Question"/g);
console.log('FAQ HTML details 数量:', detailsCount, 'JSON-LD Question 数量:', jsonLdMatch ? jsonLdMatch.length : 0);

const pxHtml = fs.readFileSync('.next/server/app/classics/qifo.html', 'utf8');
console.log('七佛偈 HTML 包含白话今译:', pxHtml.includes('白话今译'));
const zjlHtml = fs.readFileSync('.next/server/app/classics/zongjinglu.html', 'utf8');
console.log('宗镜录包含最后一句:', zjlHtml.includes('真如无尽之福。如法界比微尘。岂可校量乎'));

// 检查 chunk 目录中与 classics 相关的 chunk
const chunks = fs.readdirSync('.next/static/chunks');
console.log(`生成 chunks 总数: ${chunks.length}`);
