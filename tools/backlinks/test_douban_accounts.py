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
    page.goto("https://accounts.douban.com/passport/login", wait_until="domcontentloaded")
    time.sleep(3)
    
    print("登录页面 URL:", page.url)
    page.screenshot(path="tools/backlinks/douban_accounts_login.png")
    
    # 点击二维码切换
    qr_btn = page.locator('.quick-form, .icon-qrcode, .qrcode-account, [class*="qrcode"]').first
    if qr_btn.is_visible():
        qr_btn.click()
        time.sleep(2)
        page.screenshot(path="tools/backlinks/douban_real_qrcode.png")
        print("已切换到二维码登录界面！")
        
    ctx.close()
