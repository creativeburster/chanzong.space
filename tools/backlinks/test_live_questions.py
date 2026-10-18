# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context()
    page = context.new_page()
    
    live_questions = [
        "https://www.zhihu.com/question/35431631",  # 楞严经
        "https://www.zhihu.com/question/60596323",  # 达摩血脉论
        "https://www.zhihu.com/question/38814717",  # 信心铭
        "https://www.zhihu.com/question/27156107"   # 永嘉证道歌
    ]
    
    for u in live_questions:
        page.goto(u, wait_until="domcontentloaded")
        time.sleep(2)
        print(f"URL: {u} -> 页面标题: {page.title()} | 是否荒原: {'荒原' in page.title()}")
        
    browser.close()
