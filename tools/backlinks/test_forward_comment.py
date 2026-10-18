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
    
    # 查找【转发】按钮并点击
    forward_btn = page.locator('span:has-text("转发"), button:has-text("转发")').first
    print("Found forward btn:", forward_btn.is_visible())
    forward_btn.click()
    time.sleep(2)
    
    page.screenshot(path="tools/backlinks/forward_modal.png")
    
    # 查找弹窗里的输入框
    modal_textarea = page.locator('.woo-modal-main textarea, .woo-dialog textarea, textarea[placeholder*="新鲜事"], textarea').first
    print("Modal textarea found:", modal_textarea.is_visible())
    
    # 勾选“同时评论”
    comment_check = page.locator('label:has-text("同时评论") input, label:has-text("评论") input').first
    if comment_check.is_visible():
        print("Checking '同时评论'...")
        comment_check.check()
        time.sleep(0.5)
        
    comment_text = "三心不可得，正是直破凡夫的时间执念。过去已灭，未来未至，现在念念不住，若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)的文献拓扑时，也发现历代祖师对此处开示极多，真知灼见，受教了！"
    modal_textarea.fill(comment_text)
    time.sleep(1)
    
    page.screenshot(path="tools/backlinks/forward_filled.png")
    
    # 查找【评论】按钮
    comment_btn = page.locator('button:has-text("评论")').last
    print("Comment btn found:", comment_btn.is_visible())
    comment_btn.click()
    time.sleep(6)
    
    page.screenshot(path="tools/backlinks/forward_submitted.png")
    has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
    print("Comment now visible on page?", has_text)
    print("Forward and comment successfully completed!")
    browser.close()
