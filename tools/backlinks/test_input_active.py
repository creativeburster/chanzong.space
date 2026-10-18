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
    page.goto('https://www.zhihu.com/search?type=content&q=六祖坛经', wait_until='domcontentloaded', timeout=30000)
    time.sleep(3)
    
    # 点击评论按钮
    page.locator('button:has-text("条评论")').first.click()
    time.sleep(2)
    
    # 查找包含“理性发言”的输入框
    input_box = page.locator('input[placeholder*="理性发言"], div:has-text("理性发言，友善互动")').last
    print("点击输入框前...")
    input_box.click()
    time.sleep(2)
    page.screenshot(path="tools/backlinks/test_after_input_clicked.png")
    
    # 检查现在的发布按钮
    pub_btns = page.locator('button:has-text("发布")').all()
    print(f"点击后找到发布按钮: {len(pub_btns)}")
    for b in pub_btns:
        print(f"Button: text={b.inner_text()}, visible={b.is_visible()}")
        
    ctx.close()
