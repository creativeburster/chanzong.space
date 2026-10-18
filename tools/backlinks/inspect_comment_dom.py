# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

test_url = "https://weibo.com/2156211775/Rh5wjdjgi"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto(test_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    print("Page Title:", page.title())
    page.screenshot(path="tools/backlinks/weibo_detail_check.png")
    
    # 探测评论输入框
    comment_info = page.evaluate("""() => {
        const textareas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"]'));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        return {
            textareas: textareas.map(t => ({
                placeholder: t.placeholder || t.getAttribute('placeholder') || '',
                tag: t.tagName,
                className: t.className
            })),
            buttons: buttons.filter(b => b.length > 0 && b.length < 20)
        };
    }""")
    print("Comment Info:", json.dumps(comment_info, ensure_ascii=False, indent=2))
    browser.close()
