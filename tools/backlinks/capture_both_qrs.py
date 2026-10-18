# -*- coding: utf-8 -*-
import os, sys, time
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
    
    # 1. 抓取微博二维码
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/weibo_qr_live.png")
    
    # 2. 抓取 B 站二维码
    page.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/bilibili_qr_live.png")
    
    ctx.close()
    print("Done capturing both QRs")
