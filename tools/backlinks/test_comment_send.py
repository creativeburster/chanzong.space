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
    ctx = p.chromium.launch_persistent_context(
        user_data_dir="tools/backlinks/.browser_profile",
        channel="msedge",
        headless=True
    )
    ctx.add_cookies(cookies)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://weibo.com/2156211775/Rh5wjdjgi", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 600)")
    time.sleep(1)
    
    # 定位输入框
    box = page.locator('textarea[placeholder*="评论"], textarea._input_1fox3_8').first
    box.click()
    time.sleep(0.5)
    
    comment_content = "三心不可得，正是直破凡夫的时间执念。过去已灭，未来未至，现在念念不住，若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)的文献拓扑时，也发现历代祖师对此处开示极多，真知灼见，受教了！"
    
    page.keyboard.insert_text(comment_content)
    time.sleep(1)
    
    btn = page.locator('button:has-text("评论")').first
    print("Btn text:", btn.inner_text())
    print("Btn is enabled:", btn.is_enabled())
    
    btn.scroll_into_view_if_needed()
    time.sleep(0.5)
    btn.hover()
    time.sleep(0.5)
    btn.click()
    print("Clicked comment btn with logged-in cookies! Waiting 5s...")
    time.sleep(5)
    
    page.screenshot(path="tools/backlinks/comment_logged_after_click.png")
    
    has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
    print("Is comment on page now?", has_text)
    
    ctx.close()
