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
    
    # 1. 点击底部的“发表评论”
    input_trigger = page.locator('text="发表评论"').first
    input_trigger.click()
    time.sleep(1.5)
    
    # 2. 定位输入框并填入评论
    ta = page.locator('textarea[placeholder*="写评论"]').first
    ta.fill("三心不可得，正是直破凡夫的时间执念。过去已灭，未来未至，现在念念不住，若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)文献拓扑时，也发现历代祖师对此处开示极多，真知灼见，受教了！")
    time.sleep(1)
    
    page.screenshot(path="tools/backlinks/m_comment_typed.png")
    
    # 3. 点击右上角的【发送】
    send_btn = page.locator('text="发送"').first
    print("Found send btn, clicking...")
    send_btn.click()
    time.sleep(5)
    
    page.screenshot(path="tools/backlinks/m_comment_submitted.png")
    
    # 4. 检查是否成功返回详情页并展示评论
    has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
    print("🎉 Comment online on m.weibo.cn?", has_text)
    
    browser.close()
