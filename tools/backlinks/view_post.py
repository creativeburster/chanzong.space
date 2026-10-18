# -*- coding: utf-8 -*-
import os
import json
import time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    bduss = json.load(f).get("BDUSS")

cookies = [
    {"name": "BDUSS", "value": bduss, "domain": ".baidu.com", "path": "/"},
    {"name": "BDUSS", "value": bduss, "domain": ".tieba.baidu.com", "path": "/"}
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://tieba.baidu.com/p/11005989246", wait_until="domcontentloaded", timeout=25000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/tieba_post_view.png")
    
    title = page.title()
    print("Page Title:", title)
    
    text = page.evaluate("() => document.body.innerText.slice(0, 500)")
    print("Page text snippet:", text.replace("\n", " ")[:200])
    
    browser.close()
