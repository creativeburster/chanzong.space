# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    # 使用纯匿名 Context
    context = browser.new_context()
    page = context.new_page()
    
    test_urls = [
        "https://www.zhihu.com/question/20420786",
        "https://www.zhihu.com/question/20658406",
        "https://www.zhihu.com/question/21659858",
        "https://www.zhihu.com/question/21659858#comment-11572431692"
    ]
    
    for u in test_urls:
        page.goto(u, wait_until="domcontentloaded")
        time.sleep(2)
        print(f"URL: {u} -> 实际跳转: {page.url} | 标题: {page.title()} | 是否荒原: {'荒原' in page.content()}")
        
    browser.close()
