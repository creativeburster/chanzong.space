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
    page.goto("https://www.douban.com", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 尝试查找微博登录链接/按钮
    weibo_btn = page.locator('a[href*="weibo"], a[title*="微博"], .oauth-weibo, span.weibo').first
    if weibo_btn.is_visible():
        print("找到微博登录按钮，尝试点击...")
        # 监听弹出新页面
        with ctx.expect_page(timeout=10000) as new_page_info:
            weibo_btn.click()
        weibo_page = new_page_info.value
        time.sleep(3)
        print("微博授权页面 URL:", weibo_page.url)
        weibo_page.screenshot(path="tools/backlinks/douban_weibo_oauth.png")
    else:
        print("未找到微博直接链接，查找右上角扫码二维码...")
        # 点击右上角绿色二维码
        qr_switch = page.locator('.icon-qrcode, [class*="qrcode"]').first
        if qr_switch.is_visible():
            qr_switch.click()
            time.sleep(2)
        page.screenshot(path="tools/backlinks/douban_qr_login.png")
        
    ctx.close()
