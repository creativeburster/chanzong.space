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
    
    # 查找所有的输入控件
    inputs = page.evaluate("""() => {
        const allText = Array.from(document.querySelectorAll('textarea, input, div[contenteditable="true"]'));
        return allText.map(el => ({
            tag: el.tagName,
            class: el.className,
            placeholder: el.placeholder || el.getAttribute('placeholder'),
            value: el.value || el.innerText,
            isContentEditable: el.isContentEditable
        }));
    }""")
    print("Inputs found:", json.dumps(inputs, ensure_ascii=False, indent=2))
    browser.close()
