# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

URLS = [
    "https://zhuanlan.zhihu.com/p/2080669850339374326",
    "https://zhuanlan.zhihu.com/p/2080670079256211814",
    "https://zhuanlan.zhihu.com/p/2080669349367509859"
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent=REAL_UA)
    
    for u in URLS:
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        info = page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('.RichText a, a[href*="chanzong"]')).map(a => ({
                text: a.innerText,
                href: a.href,
                outerHTML: a.outerHTML
            }));
            const allText = document.querySelector('.RichText') ? document.querySelector('.RichText').innerText.slice(-200) : '';
            return {
                title: document.title,
                links: links,
                lastText: allText
            };
        }""")
        print(f"知乎文章 [{u}]:", json.dumps(info, ensure_ascii=False, indent=2))
        
    browser.close()
