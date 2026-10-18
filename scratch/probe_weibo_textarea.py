# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILE_DIR = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile")
COOKIE_PATH = os.path.join(PROFILE_DIR, "weibo_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cdict = json.load(f)

cookies = []
for k, v in cdict.items():
    cookies.append({"name": k, "value": v, "domain": ".weibo.com", "path": "/"})
    cookies.append({"name": k, "value": v, "domain": ".weibo.cn", "path": "/"})

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookies)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://weibo.com", wait_until="domcontentloaded")
    time.sleep(5)
    
    # 查找所有 textarea 和可输入框
    tas = page.locator("textarea").all()
    print("Found textareas:", len(tas))
    for i, t in enumerate(tas):
        print(i, t.evaluate("e => ({cls: e.className, ph: e.placeholder, visible: e.offsetWidth > 0})"))
        
    page.screenshot(path="scratch/weibo_ready_test.png")
    ctx.close()
