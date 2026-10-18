# -*- coding: utf-8 -*-
import os, time
from playwright.sync_api import sync_playwright

cur_dir = os.path.dirname(os.path.abspath(__file__))
profile_dir = os.path.join(cur_dir, ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 点击右上角橙色登录按钮
    login_btn = page.query_selector('a:has-text("登录/注册"), button:has-text("登录/注册"), .login_btn')
    if login_btn:
        login_btn.click()
        time.sleep(2)
        
    page.screenshot(path="tools/backlinks/weibo_qr_fresh.png")
    print("Saved weibo_qr_fresh.png")
    ctx.close()
