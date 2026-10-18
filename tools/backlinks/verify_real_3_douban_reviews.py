# -*- coding: utf-8 -*-
"""
验证并截图真正的豆瓣 3 篇经典长篇书评：
17808301 - 六祖坛经
17808303 - 金刚经
17808304 - 心经
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

REVIEWS = [
    ("17808301", "六祖坛经", "https://book.douban.com/review/17808301/"),
    ("17808303", "金刚经", "https://book.douban.com/review/17808303/"),
    ("17808304", "心经", "https://book.douban.com/review/17808304/")
]

def verify_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page()
        for rid, name, url in REVIEWS:
            print(f"正在访问真正的书评 [{name}]: {url}")
            page.goto(url, timeout=30000)
            time.sleep(2)
            shot_name = f"tools/backlinks/real_douban_review_{rid}.png"
            page.screenshot(path=shot_name)
            print(f"[{name}] 页面标题: {page.title()}")
            print(f"已保存真实书评截图: {shot_name}")
            
        browser.close()

if __name__ == "__main__":
    verify_all()
