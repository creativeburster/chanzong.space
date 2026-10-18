# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com/2156211775/Rh5wjdjgi", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 600)")
    time.sleep(1)
    
    # 定位并聚焦输入框
    box = page.locator('textarea[placeholder*="评论"], textarea._input_1fox3_8').first
    box.click()
    time.sleep(0.5)
    
    # 模拟真实逐字敲入
    test_str = "应无所住而生其心，受教了！"
    page.keyboard.type(test_str, delay=50)
    time.sleep(1)
    
    btn = page.locator('button:has-text("评论")').first
    btn_class = btn.get_attribute("class")
    print("Btn class after real keyboard typing:", btn_class)
    print("Has disabled in class?", "disabled" in btn_class)
    
    if "disabled" not in btn_class:
        print("🎉 按钮已解除禁用！点击发送...")
        btn.click()
        time.sleep(4)
        has_text = page.evaluate("() => document.body.innerText.includes('应无所住而生其心，受教了！')")
        print("Success posted?", has_text)
        page.screenshot(path="tools/backlinks/real_typed_success.png")
        
    browser.close()
