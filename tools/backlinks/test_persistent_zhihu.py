# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")
COOKIE_PATH = os.path.join(PROFILE_DIR, "zhihu_cookie.json")
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        args=["--no-first-run", "--no-default-browser-check", "--disable-blink-features=AutomationControlled"],
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    # 访问心经问题
    url = "https://www.zhihu.com/question/2053095292069852633"
    print("Navigating to:", url)
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("Page Title:", page.title())
    print("Page URL:", page.url)
    page.screenshot(path="tools/backlinks/persistent_zhihu_test.png")
    ctx.close()
