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
    page.goto(url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    print("Page URL:", page.url)
    # 原生定位右下角发布按钮
    pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
    print("Pub btn visible:", pub_btn.is_visible())
    
    # 真实原生点击
    pub_btn.scroll_into_view_if_needed()
    time.sleep(1)
    pub_btn.hover()
    time.sleep(0.5)
    pub_btn.click()
    print("Clicked first publish button.")
    time.sleep(3)
    page.screenshot(path="tools/backlinks/native_click_step1.png")
    
    # 检查当前状态
    confirm_pub = page.locator('button.Button--primary:has-text("发布"), button:has-text("确认发布")').last
    if confirm_pub.is_visible():
        print("Second publish button is visible, clicking with native event...")
        confirm_pub.scroll_into_view_if_needed()
        time.sleep(0.5)
        confirm_pub.hover()
        time.sleep(0.5)
        confirm_pub.click()
        time.sleep(5)
        page.screenshot(path="tools/backlinks/native_click_step2.png")
        
    print("Final URL after native click:", page.url)
    browser.close()
