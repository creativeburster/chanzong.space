# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    def on_req(req):
        if "comment" in req.url.lower() and req.method == "POST":
            print("POST URL:", req.url)
            print("POST HEADERS:", req.headers)
            print("POST DATA:", req.post_data)
            
    page.on("request", on_req)
    page.goto("https://www.zhihu.com/question/20420786/answer/15077462", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    page.locator('button:has-text("评论")').first.click()
    time.sleep(2)
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    page.keyboard.insert_text("受教！")
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    page.locator('button').filter(has_text='发布').last.click()
    time.sleep(3)
    ctx.close()
