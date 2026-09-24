const fs = require('fs');

const simpCat = fs.readFileSync('.next/server/app/categories.html', 'utf8');
console.log('categories.html size:', simpCat.length, 'has 经藏分类:', simpCat.includes('经藏分类'));

const tradCat = fs.readFileSync('.next/server/app/zh-tw/categories.html', 'utf8');
console.log('zh-tw/categories.html size:', tradCat.length, 'has lang=zh-TW:', tradCat.includes('lang="zh-TW"'), 'has 經藏分類:', tradCat.includes('經藏分類'));

const simpYulu = fs.readFileSync('.next/server/app/categories/yulu.html', 'utf8');
console.log('categories/yulu.html size:', simpYulu.length, 'has 宗门语录:', simpYulu.includes('宗门语录'));

const tradYulu = fs.readFileSync('.next/server/app/zh-tw/categories/yulu.html', 'utf8');
console.log('zh-tw/categories/yulu.html size:', tradYulu.length, 'has lang=zh-TW:', tradYulu.includes('lang="zh-TW"'), 'has 宗門語錄:', tradYulu.includes('宗門語錄'));
