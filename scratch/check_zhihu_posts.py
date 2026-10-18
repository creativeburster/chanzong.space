# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "backlinks"))
from browser_driver import get_browser_context

p, ctx, page = get_browser_context(headless=True)
page.goto('https://www.zhihu.com/creator/manage/creation/all', wait_until='domcontentloaded')
time.sleep(5)
page.screenshot(path='scratch/zhihu_articles_list.png')

articles = page.evaluate('''() => {
    const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="zhuanlan.zhihu.com/p/"]'));
    return links.map(a => ({title: a.innerText.trim(), href: a.href}));
}''')
print('Found articles:', len(articles))
for a in articles[:5]:
    print('  -', a['title'], '->', a['href'])
ctx.close()
p.stop()
