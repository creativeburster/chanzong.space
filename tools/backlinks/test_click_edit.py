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
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://member.bilibili.com/platform/upload/text/new-article", wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    # 点击编辑按钮
    btn = page.query_selector('.draft-list button:has-text("编辑"), button:has-text("编辑")')
    if btn:
        print("点击编辑...")
        btn.click()
        time.sleep(5)
        print("跳转后页面标题:", page.title())
        print("跳转后页面URL:", page.url)
        page.screenshot(path="tools/backlinks/bilibili_article_editor_current.png")
    ctx.close()
