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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

def check_login():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
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
        
        print("正在打开微博首页...")
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(4)
        page.screenshot(path=os.path.join(CUR_DIR, "weibo_home_live.png"))
        
        # 寻找个人主页入口
        profile_link = page.evaluate("""() => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            for (const a of allLinks) {
                if (a.href.includes('weibo.com/u/') || (a.href.includes('weibo.com/') && /\\/\\d{8,}/.test(a.href))) {
                    return a.href;
                }
            }
            return null;
        }""")
        print(f"检测到微博个人主页链接: {profile_link}")
        browser.close()

if __name__ == "__main__":
    check_login()
