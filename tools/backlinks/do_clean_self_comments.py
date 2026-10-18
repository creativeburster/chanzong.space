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
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

def delete_comments():
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
        print(f"正在访问: {url}")
        page.goto(url, timeout=30000)
        time.sleep(3)
        
        # 检查是否出现点击证明
        verify_btn = page.query_selector('input[value*="证明"], button:has-text("证明")')
        if verify_btn:
            print("遇到证明按钮，点击证明...")
            verify_btn.click()
            time.sleep(3)
            
        print(f"当前页面标题: {page.title()}, URL: {page.url}")
        
        # 滚动到底部
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        
        # 寻找属于自己的删除按钮
        # 评论区域的删除按钮通常在 .reply-doc 内部
        del_btns = page.locator('#comments a:has-text("删除")').all()
        print(f"找到评论区的删除按钮数量: {len(del_btns)}")
        
        while True:
            btn = page.locator('#comments a:has-text("删除")').first
            if btn.is_visible():
                print("点击删除一条自我评论...")
                btn.click()
                time.sleep(2.5)
            else:
                break
                
        page.screenshot(path=os.path.join(CUR_DIR, "douban_clean_done.png"))
        print("已完成清理并保存截图: douban_clean_done.png")
        browser.close()

if __name__ == "__main__":
    delete_comments()
