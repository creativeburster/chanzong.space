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
    
    # 1. 展开评论
    page.locator('button:has-text("条评论")').first.click()
    time.sleep(2)
    
    # 2. 点击真正的 DraftEditor
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    print("点击 DraftEditor 输入框...")
    editor.click()
    time.sleep(1)
    
    # 3. 键盘输入测试文字
    page.keyboard.insert_text("测试输入，阿弥陀佛")
    time.sleep(1)
    
    # 4. 查看当前界面与按钮
    page.screenshot(path="tools/backlinks/test_comment_input_success.png")
    
    pub_btns = page.locator('button:has-text("发布")').all()
    print(f"输入后找到发布按钮: {len(pub_btns)}")
    for b in pub_btns:
        print(f"Button: text={b.inner_text()}, visible={b.is_visible()}, disabled={b.is_disabled()}")
        
    ctx.close()
print("DraftEditor 验证完毕！")
