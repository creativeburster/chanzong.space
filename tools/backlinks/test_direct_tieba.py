# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)

cookies = []
for k, v in cd.items():
    cookies.append({"name": k, "value": v, "domain": ".baidu.com", "path": "/"})
    cookies.append({"name": k, "value": v, "domain": ".tieba.baidu.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("直接访问【禅宗吧】...")
    page.goto("https://tieba.baidu.com/f?kw=%E7%A6%85%E5%AE%97", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    page.screenshot(path="tools/backlinks/tieba_chanzong.png")
    
    title = page.title()
    print("Page title:", title)
    
    # 检查是否有滑块验证码
    has_captcha = page.evaluate("() => !!document.querySelector('.vcode-spin-button, .geetest_radar, [class*=\"captcha\"], [class*=\"verify\"]')")
    print("Has captcha:", has_captcha)

    browser.close()
