# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"
REVIEW_URL = "https://book.douban.com/review/17808301/"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    page = browser.new_page(user_agent=REAL_UA)
    page.goto(REVIEW_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("独立书评页面标题:", page.title())
    print("当前URL:", page.url)
    page.screenshot(path="tools/backlinks/douban_review_17808301_live.png")
    print("已保存独立书评公开截图: tools/backlinks/douban_review_17808301_live.png")
    browser.close()
