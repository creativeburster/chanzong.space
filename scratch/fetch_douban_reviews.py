# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "backlinks"))
from browser_driver import get_browser_context

p, ctx, page = get_browser_context(headless=True)
for sid in ["2355487", "33459093", "3005084", "1011855"]:
    page.goto(f"https://book.douban.com/subject/{sid}/", wait_until="domcontentloaded")
    time.sleep(2)
    title = page.title()
    reviews = page.evaluate('''() => {
        const links = Array.from(document.querySelectorAll('a[href*="/review/"]'));
        return links.map(a => ({title: a.innerText.trim(), href: a.href})).filter(r => r.title.length > 5);
    }''')
    print(f"Subject {sid} ({title}): found {len(reviews)} reviews")
    for r in reviews[:3]:
        print("   -", r['title'], "->", r['href'])
ctx.close()
p.stop()
