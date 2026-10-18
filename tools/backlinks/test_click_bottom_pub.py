# -*- coding: utf-8 -*-
import os, time
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"
with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 找到底部的发布按钮
    bottom_pub = page.locator('button.Button--blue:has-text("发布"), button.css-d0uhtl:has-text("发布")').last
    print("Clicking bottom pub button...")
    bottom_pub.click()
    time.sleep(3)
    
    page.screenshot(path="tools/backlinks/after_bottom_pub_click.png")
    ctx.close()
