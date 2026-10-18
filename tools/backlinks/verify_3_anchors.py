# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

URLS = [
    "https://book.douban.com/review/17808301/",
    "https://book.douban.com/review/17808303/",
    "https://book.douban.com/review/17808304/"
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent=REAL_UA)
    
    for u in URLS:
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        info = page.evaluate("""() => {
            const a = document.querySelector('.review-content a.link, a[href*="chanzong"]');
            return a ? {
                title: document.title,
                anchorText: a.innerText,
                href: a.href,
                outerHTML: a.outerHTML
            } : null;
        }""")
        print(f"URL [{u}] 锚文本检查结果:", info)
        
    browser.close()
