# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

with open("tools/backlinks/.browser_profile/zhihu_cookie.json", "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

url = "https://www.zhihu.com/question/2053095292069852633"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("URL:", page.url)
    print("Title:", page.title())
    write_btn = page.query_selector('button:has-text("写回答"), a:has-text("写回答")')
    print("Has write btn:", bool(write_btn))
    my_ans_btn = page.query_selector('button:has-text("查看我的回答"), a:has-text("查看我的回答")')
    print("Has my ans btn:", bool(my_ans_btn))
    page.screenshot(path="tools/backlinks/zhihu_q_check.png")
    browser.close()
