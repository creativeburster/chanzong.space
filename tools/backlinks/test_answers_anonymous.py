# -*- coding: utf-8 -*-
import sys, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page()
    
    test_urls = [
        "https://www.zhihu.com/question/47436256/answer/2845485161",
        "https://www.zhihu.com/question/1928206401152451835/answer/2080590075331613854",
        "https://www.zhihu.com/question/35431631/answer/3463421632"
    ]
    
    for u in test_urls:
        page.goto(u, wait_until="domcontentloaded")
        time.sleep(2)
        print(f"URL: {u} -> 页面标题: {page.title()} | 是否荒原: {'荒原' in page.title()}")
        
    browser.close()
