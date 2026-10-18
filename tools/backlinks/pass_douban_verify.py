# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("tools/backlinks/douban_cookies.json", "r", encoding="utf-8") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    url = "https://book.douban.com/subject/5214628/new_review"
    print(f"打开 {url} ...")
    page.goto(url, wait_until="domcontentloaded")
    time.sleep(3)
    
    if "misc/sorry" in page.url:
        print("检测到'止步'页面，尝试点击'点击证明'按钮...")
        btn = page.query_selector('input[value="点击证明"], button:has-text("点击证明")')
        if btn:
            btn.click()
            time.sleep(5)
            print("点击后页面 URL:", page.url)
            page.screenshot(path="tools/backlinks/douban_after_verify.png")
            # 保存更新后的 cookies
            new_cookies = ctx.cookies()
            with open("tools/backlinks/douban_cookies.json", "w", encoding="utf-8") as f:
                json.dump(new_cookies, f, ensure_ascii=False, indent=2)
            print("已更新 douban_cookies.json！")
    else:
        print("直接正常打开:", page.url)
        page.screenshot(path="tools/backlinks/douban_direct_open.png")
        
    browser.close()
