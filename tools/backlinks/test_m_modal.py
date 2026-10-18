# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.cn", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={"width": 414, "height": 896},
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://m.weibo.cn/detail/5340727993172310", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 点击底部的“发表评论”
    input_trigger = page.locator('text="发表评论"').first
    input_trigger.click()
    time.sleep(2)
    page.screenshot(path="tools/backlinks/m_weibo_modal.png")
    
    # 查找输入框和发送按钮
    elements = page.evaluate("""() => {
        const textareas = Array.from(document.querySelectorAll('textarea'));
        const buttons = Array.from(document.querySelectorAll('button, a.btn, a[class*="send"], a[class*="btn"]')).map(b => b.innerText.trim());
        return {
            textareas: textareas.map(t => ({ class: t.className, placeholder: t.placeholder })),
            buttons: buttons
        };
    }""")
    print("Modal elements:", json.dumps(elements, ensure_ascii=False, indent=2))
    browser.close()
