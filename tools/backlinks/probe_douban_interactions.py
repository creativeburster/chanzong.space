# -*- coding: utf-8 -*-
"""
探测豆瓣热门禅宗经典书评下的评论（回应）与二级楼中楼回复功能
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

def probe_douban():
    cookies = []
    if os.path.exists(COOKIE_FILE):
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
        if cookies:
            ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 访问金刚经热门长篇书评
        test_review_url = "https://book.douban.com/review/17808301/"
        print(f"正在访问豆瓣长篇书评: {test_review_url}")
        page.goto(test_review_url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        page.screenshot(path=os.path.join(CUR_DIR, "douban_review_probe.png"))
        print("已保存豆瓣书评截图: douban_review_probe.png")
        
        # 检查是否被重定向到 sec.douban.com 或 misc/sorry
        print(f"当前页面实际 URL: {page.url}")
        
        # 检查评论输入框
        comments_box = page.query_selector('textarea#last, textarea[name="rv_comment"], textarea')
        print(f"检测到回应 textarea: {bool(comments_box)}")
        
        # 检查回应列表中的【回复】按钮
        reply_links = page.locator('a:has-text("回复"), a.reply_btn, a[href*="reply"]').all()
        print(f"检测到回复链接数量: {len(reply_links)}")
        for idx, rl in enumerate(reply_links[:5]):
            print(f"  回复链接 {idx+1}: text={rl.inner_text().strip()}, href={rl.get_attribute('href')}")
            
        browser.close()

if __name__ == "__main__":
    probe_douban()
