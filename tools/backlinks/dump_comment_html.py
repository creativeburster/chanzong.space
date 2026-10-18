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
    
    # 获取整个评论输入卡片的 HTML
    card_html = page.evaluate("""() => {
        const box = document.querySelector('textarea._input_1fox3_8');
        if (!box) return 'no textarea found';
        let parent = box.parentElement;
        for (let i = 0; i < 4; i++) {
            if (parent && parent.parentElement) parent = parent.parentElement;
        }
        return parent ? parent.outerHTML : 'no parent';
    }""")
    print("Card HTML length:", len(card_html))
    with open("tools/backlinks/comment_card.html", "w", encoding="utf-8") as f:
        f.write(card_html)
    print("Saved tools/backlinks/comment_card.html")
    browser.close()
