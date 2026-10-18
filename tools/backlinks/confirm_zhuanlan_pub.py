# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/zhihu_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

url = "https://zhuanlan.zhihu.com/p/2080660444801511629/edit"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto(url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 查找发布按钮
    pub_btn = page.query_selector('button:has-text("发布")')
    print("Found pub_btn:", bool(pub_btn))
    if pub_btn:
        page.evaluate("el => el.click()", pub_btn)
        time.sleep(2)
        
        # 再次查找发布按钮（确认发布）
        second_pub_btn = page.query_selector('button.Button--primary:has-text("发布"), button:has-text("发布")')
        if second_pub_btn:
            print("Clicking second publish button...")
            page.evaluate("el => el.click()", second_pub_btn)
            time.sleep(5)
            
    print("Final URL:", page.url)
    page.screenshot(path="tools/backlinks/zhuanlan_pub_success.png")
    browser.close()
