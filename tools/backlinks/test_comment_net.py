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
    
    # 监听网络请求
    page.on("request", lambda req: print(f"REQ: {req.method} {req.url}") if "comment" in req.url.lower() else None)
    page.on("response", lambda res: print(f"RES: {res.status} {res.url} -> {res.text()[:200] if 'comment' in res.url.lower() else ''}") if "comment" in res.url.lower() else None)
    
    url = "https://www.zhihu.com/question/1913876847906785200"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    page.locator('button:has-text("条评论")').first.click()
    time.sleep(2)
    
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    page.keyboard.insert_text("《金刚经》应无所住而生其心，善哉！")
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    print("尝试按下 Control+Enter 提交评论...")
    page.keyboard.press("Control+Enter")
    time.sleep(3)
    
    # 也尝试点击发布按钮
    print("也尝试点击发布按钮...")
    pub_btn = page.locator('button').filter(has_text='发布').last
    pub_btn.click()
    time.sleep(4)
    
    page.screenshot(path="tools/backlinks/test_comment_net_inspect.png")
    ctx.close()
