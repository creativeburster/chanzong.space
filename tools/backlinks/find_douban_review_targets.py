# -*- coding: utf-8 -*-
"""
查找豆瓣上关于《金刚经》、《心经》或禅宗经典的热门公开书评URL
"""
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")

def find_targets():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 1. 金刚经书籍页面
        print("访问金刚经书评列表...")
        page.goto("https://book.douban.com/subject/27125958/reviews", timeout=30000)
        time.sleep(3)
        jingang_reviews = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.main-bd h2 a, a[href*="/review/"]')).map(a => ({
                title: a.innerText.trim(),
                url: a.href
            })).filter(item => item.url.includes('/review/') && item.title.length > 2).slice(0, 5);
        }""")
        print("金刚经书评:", jingang_reviews)
        
        # 2. 心经书籍页面
        print("访问心经书籍书评...")
        page.goto("https://book.douban.com/subject/1077221/reviews", timeout=30000)
        time.sleep(3)
        xinjing_reviews = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.main-bd h2 a, a[href*="/review/"]')).map(a => ({
                title: a.innerText.trim(),
                url: a.href
            })).filter(item => item.url.includes('/review/') && item.title.length > 2).slice(0, 5);
        }""")
        print("心经书评:", xinjing_reviews)
        
        browser.close()

if __name__ == "__main__":
    find_targets()
