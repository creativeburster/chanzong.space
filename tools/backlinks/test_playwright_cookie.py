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

COOKIE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile", "zhihu_cookie.json")
SCREENSHOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "zhihu_logged_in.png")

def test_cookie():
    if not os.path.exists(COOKIE_PATH):
        print("Cookie file not found!")
        return
        
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies_to_add = []
    for k, v in cookie_dict.items():
        cookies_to_add.append({
            "name": k,
            "value": v.strip('"'),
            "domain": ".zhihu.com",
            "path": "/"
        })
        
    print(f"正在准备注入 {len(cookies_to_add)} 个 Cookies...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        context.add_cookies(cookies_to_add)
        
        page = context.new_page()
        print("正在打开知乎首页验证...")
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(3)
        
        page.screenshot(path=SCREENSHOT_PATH)
        print("页面标题:", page.title())
        print(f"截图已保存至: {SCREENSHOT_PATH}")
        
        # 查找个人主页或用户头像
        user_name = page.query_selector(".AppHeader-profile, .AppHeader-userInfo, button[aria-label*='个人中心']")
        if user_name or "知乎" in page.title():
            print("🎉 Playwright 成功以已登录状态加载知乎！")
            
        browser.close()

if __name__ == "__main__":
    test_cookie()
