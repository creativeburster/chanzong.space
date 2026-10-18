# -*- coding: utf-8 -*-
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

def inspect_reviews():
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
        
        # 1. 访问个人主页的书评列表
        profile_url = "https://book.douban.com/people/132002368/reviews"
        print(f"正在访问个人书评页面: {profile_url}")
        page.goto(profile_url, timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "douban_my_reviews_profile.png"))
        
        items = page.evaluate("""() => {
            const list = [];
            const elements = document.querySelectorAll('.review-item');
            for (const el of elements) {
                const titleEl = el.querySelector('h2 a');
                const timeEl = el.querySelector('.header-more');
                list.push({
                    title: titleEl ? titleEl.innerText.trim() : '',
                    url: titleEl ? titleEl.href : '',
                    time: timeEl ? timeEl.innerText.trim() : ''
                });
            }
            return list;
        }""")
        print("当前账号实际发布的书评列表:")
        print(json.dumps(items, ensure_ascii=False, indent=2))
        
        # 2. 检查 17808343
        print("\n检查 17808343:")
        page.goto("https://book.douban.com/review/17808343/", timeout=30000)
        time.sleep(2)
        print(f"17808343 标题: {page.title()}, URL: {page.url}")
        page.screenshot(path=os.path.join(CUR_DIR, "inspect_17808343.png"))
        
        # 3. 检查 17808375
        print("\n检查 17808375:")
        page.goto("https://book.douban.com/review/17808375/", timeout=30000)
        time.sleep(2)
        print(f"17808375 标题: {page.title()}, URL: {page.url}")
        page.screenshot(path=os.path.join(CUR_DIR, "inspect_17808375.png"))
        
        browser.close()

if __name__ == "__main__":
    inspect_reviews()
