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

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    print("Zhihu Home Title:", page.title())
    print("Zhihu Home URL:", page.url)
    page.screenshot(path="tools/backlinks/zhihu_home_test.png")
    
    # 尝试访问个人主页
    page.goto("https://www.zhihu.com/people/duliuxiang", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("Profile Title:", page.title())
    print("Profile URL:", page.url)
    page.screenshot(path="tools/backlinks/zhihu_profile_test.png")
    
    # 尝试访问写文章
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("Write Title:", page.title())
    print("Write URL:", page.url)
    page.screenshot(path="tools/backlinks/zhihu_write_test.png")
    
    browser.close()
