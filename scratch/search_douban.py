# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "backlinks"))
from browser_driver import get_browser_context

p, ctx, page = get_browser_context(headless=True)
page.goto('https://book.douban.com/subject_search?search_text=传心法要&cat=1001', wait_until='domcontentloaded')
time.sleep(3)

items = page.evaluate('''() => {
    const list = document.querySelectorAll('.item-root, .detail');
    return Array.from(list).map(it => {
        const titleEl = it.querySelector('.title-text, a');
        return titleEl ? {title: titleEl.innerText.trim(), href: titleEl.href} : null;
    }).filter(Boolean);
}''')
print('Search results count:', len(items))
for it in items[:4]:
    print('  -', it['title'], '->', it['href'])
    
ctx.close()
p.stop()
