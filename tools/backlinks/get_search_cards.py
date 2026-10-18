# -*- coding: utf-8 -*-
import os, sys, time
from urllib.parse import quote
from playwright.sync_api import sync_playwright

KEYWORDS = ["六祖坛经", "金刚经", "首楞严经"]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page()
    
    for kw in KEYWORDS:
        url = f"https://www.zhihu.com/search?type=content&q={quote(kw)}"
        page.goto(url, wait_until="domcontentloaded")
        time.sleep(3)
        
        cards = page.evaluate("""() => {
            const list = [];
            const titles = document.querySelectorAll('.SearchResult-Card h2 a, .ContentItem-title a');
            for (let a of titles) {
                const href = a.href;
                if (href.includes('/answer/') || href.includes('/p/')) {
                    list.push({ title: a.innerText.trim(), href });
                }
            }
            return list.slice(0, 3);
        }""")
        print(f"搜索【{kw}】精选回答列表:", cards)
        
    browser.close()
