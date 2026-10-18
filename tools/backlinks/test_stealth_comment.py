# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=[
            "--disable-blink-features=AutomationControlled"
        ]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    page.on("request", lambda req: print(f"REQ: {req.method} {req.url}") if "comment" in req.url.lower() else None)
    page.on("response", lambda res: print(f"RES: {res.status} {res.url} -> {res.text()[:200] if 'comment' in res.url.lower() else ''}") if "comment" in res.url.lower() else None)
    
    url = "https://www.zhihu.com/question/20420786/answer/15077462"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    page.locator('.ContentItem-actions button:has-text("评论")').first.click()
    time.sleep(2)
    
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    page.keyboard.insert_text("赞同！慧能大师本来无一物之见地，确是直指本来面目。")
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("点击发布按钮...")
    pub_btn.click()
    time.sleep(4)
    
    page.screenshot(path="tools/backlinks/test_real_ua_comment.png")
    ctx.close()
