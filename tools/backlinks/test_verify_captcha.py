# -*- coding: utf-8 -*-
"""
尝试自动点选豆瓣验证码并删除自我评论
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
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

def solve_and_clean():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent=REAL_UA,
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())
        
        url = "https://book.douban.com/review/17808301/"
        page.goto(url, timeout=30000)
        time.sleep(3)
        
        verify_btn = page.query_selector('input[value*="证明"], button:has-text("证明")')
        if verify_btn:
            verify_btn.click()
            time.sleep(2.5)
            
        page.screenshot(path=os.path.join(CUR_DIR, "douban_current_verify_state.png"))
        
        # 检查是否还在验证码页面
        img_el = page.query_selector('.captcha-img, img[src*="captcha"], .tcaptcha-img')
        if not img_el:
            # 寻找普通 img
            imgs = page.locator('img').all()
            print(f"页面 img 总数: {len(imgs)}")
            
        browser.close()

if __name__ == "__main__":
    solve_and_clean()
