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
    
    # 监听评论 API
    page.on("request", lambda req: print(f"REQ: {req.method} {req.url}") if "comment" in req.url.lower() else None)
    page.on("response", lambda res: print(f"RES: {res.status} {res.url} -> {res.text()[:200] if 'comment' in res.url.lower() else ''}") if "comment" in res.url.lower() else None)
    
    # 打开一个具体回答页面
    # 例如六祖坛经的高赞回答页面，或者通过搜索进入具体回答
    url = "https://www.zhihu.com/question/20420786/answer/15077462"
    print(f"访问具体回答页面: {url}")
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 找到回答底部的评论按钮
    comment_btn = page.locator('.ContentItem-actions button:has-text("评论")').first
    if not comment_btn.is_visible():
        comment_btn = page.locator('button:has-text("条评论")').first
    print("点击回答评论按钮...")
    comment_btn.click()
    time.sleep(2)
    
    # 输入内容
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    page.keyboard.insert_text("受教了！慧能大师之见地直彻心源，确实如答主所言。")
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    # 点击发布
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("点击发布按钮...")
    pub_btn.click()
    time.sleep(4)
    
    page.screenshot(path="tools/backlinks/test_answer_comment_res.png")
    ctx.close()
