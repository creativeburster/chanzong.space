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

def check_profile():
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
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        print("访问豆瓣个人中心...")
        page.goto("https://www.douban.com/mine/", timeout=30000)
        time.sleep(3)
        print(f"实际重定向到的个人主页 URL: {page.url}")
        page.screenshot(path=os.path.join(CUR_DIR, "douban_mine_home.png"))
        
        # 查找该主页下的所有动态、日记、评论、书评
        items = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.stream-items .title a, .review-item h2 a, a[href*="/review/"], a[href*="/note/"]')).map(a => ({
                title: a.innerText.trim(),
                url: a.href
            }));
        }""")
        print("个人主页公开动态/书评/日记列表:")
        print(json.dumps(items, ensure_ascii=False, indent=2))
        
        browser.close()

if __name__ == "__main__":
    check_profile()
