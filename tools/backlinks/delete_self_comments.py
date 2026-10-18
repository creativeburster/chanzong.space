# -*- coding: utf-8 -*-
"""
删除在自己书评 (17808301) 下不合逻辑的自我回复
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

def delete_self_comments():
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
        
        # 监听 dialog 弹窗（点击删除时通常有 confirm("真的要删除?")）
        page.on("dialog", lambda d: d.accept())
        
        url = "https://book.douban.com/review/17808301/"
        print(f"访问自身书评页面: {url}")
        page.goto(url, timeout=30000)
        time.sleep(3)
        
        # 寻找属于自己的删除链接
        delete_links = page.locator('a:has-text("删除")').all()
        print(f"找到删除按钮数量: {len(delete_links)}")
        
        # 循环点击删除评论（注意排除顶部的书评自身删除按钮）
        # 评论区域通常在 #comments 或 .reply-doc 或带有 data-cid
        for _ in range(5):
            comment_del_btn = page.locator('.reply-doc a:has-text("删除"), .comment-item a:has-text("删除")').first
            if comment_del_btn.is_visible():
                print("发现自己的评论删除按钮，点击删除...")
                comment_del_btn.click()
                time.sleep(2)
            else:
                break
                
        time.sleep(2)
        page.screenshot(path=os.path.join(CUR_DIR, "douban_self_comments_deleted.png"))
        print("已保存删除后的截图: douban_self_comments_deleted.png")
        
        browser.close()

if __name__ == "__main__":
    delete_self_comments()
