# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

test_url = "https://weibo.com/2156211775/Rh5wjdjgi"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto(test_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 往下滚动 600 像素
    page.evaluate("window.scrollBy(0, 700)")
    time.sleep(2)
    page.screenshot(path="tools/backlinks/weibo_comment_area.png")
    
    # 查找评论输入框和发送按钮
    comment_box = page.query_selector('textarea[placeholder*="评论"], textarea._input_1fox3_8, textarea')
    print("Found comment box:", bool(comment_box))
    
    comment_btn = page.query_selector('button:has-text("评论"), button:has-text("发送")')
    print("Found comment btn:", bool(comment_btn))
    if comment_btn:
        print("Btn text:", comment_btn.inner_text())
        
    browser.close()
