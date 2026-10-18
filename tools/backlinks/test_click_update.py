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
    
    update_btn = page.locator('button.Button--primary:has-text("更新"), button:has-text("更新"), button:has-text("发布")').last
    print("Found button with text:", update_btn.inner_text())
    update_btn.scroll_into_view_if_needed()
    time.sleep(0.5)
    update_btn.hover()
    time.sleep(0.5)
    update_btn.click()
    print("Clicked button! Waiting 5s...")
    time.sleep(5)
    
    print("Current URL:", page.url)
    page.screenshot(path="tools/backlinks/after_click_update.png")
    
    # 访问公开文章页看是否能直接打开
    public_url = "https://zhuanlan.zhihu.com/p/2080660444801511629"
    page.goto(public_url, wait_until="domcontentloaded", timeout=25000)
    time.sleep(3)
    print("Public Page Title:", page.title())
    print("Public Page URL:", page.url)
    page.screenshot(path="tools/backlinks/public_page_view.png")
    
    browser.close()
