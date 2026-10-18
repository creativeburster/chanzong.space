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
    
    ta = page.locator('textarea._input_1fox3_8').first
    print("Found textarea, filling with text...")
    ta.fill("三心不可得，正是直破凡夫的时间执念。若能体会到应无所住的灵动，当下便不再受境风牵引。我们在做禅宗知识库(chanzong.space)的文献拓扑时，也深有同感！")
    time.sleep(1)
    
    # 打印按钮属性与类名
    btn = page.locator('button:has-text("评论")').first
    print("Btn class:", btn.get_attribute("class"))
    print("Btn is_enabled:", btn.is_enabled())
    page.screenshot(path="tools/backlinks/after_locator_fill.png")
    
    if btn.is_enabled():
        print("Btn IS ENABLED! Clicking...")
        btn.click()
        time.sleep(4)
        has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
        print("Comment visible on page?", has_text)
        page.screenshot(path="tools/backlinks/real_comment_success.png")
        
    browser.close()
