# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

cur_dir = os.path.dirname(os.path.abspath(__file__))
cookie_file = os.path.join(cur_dir, "douban_cookies.json")

with open(cookie_file, "r", encoding="utf-8") as f:
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
    
    test_url = "https://book.douban.com/review/9107380/"
    print(f"正在访问豆瓣外部书评: {test_url}")
    page.goto(test_url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/douban_review_probe_live.png")
    
    # 查找评论框与当前登录用户
    user_name = page.evaluate("() => document.querySelector('.nav-user-account .bn-more')?.innerText || ''")
    has_textarea = page.query_selector('textarea#last, textarea[name="rv_comment"]') is not None
    print(f"当前登录用户: {user_name}, 是否有评论输入框: {has_textarea}")
    browser.close()
