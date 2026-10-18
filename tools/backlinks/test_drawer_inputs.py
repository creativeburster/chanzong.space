# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

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
    
    # 点击第一个评论按钮
    comment_btns = page.locator('button:has-text("条评论")').all()
    print(f"点击第一个评论按钮: {comment_btns[0].inner_text().strip()}")
    comment_btns[0].click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/zhihu_comment_drawer_opened.png")
    
    # 查找评论弹窗或抽屉内的输入区域
    print("查找输入区域...")
    inputs = page.locator('input[placeholder*="评论"], div[contenteditable="true"], .Editable-content, div.DraftEditor-editorContainer').all()
    print(f"找到输入候选元素: {len(inputs)}")
    for idx, inp in enumerate(inputs):
        try:
            print(f"Input {idx}: tag={inp.evaluate('el => el.tagName')}, placeholder={inp.get_attribute('placeholder')}, visible={inp.is_visible()}")
        except Exception as e:
            pass
            
    # 查找发布按钮
    submits = page.locator('button:has-text("发布")').all()
    print(f"找到发布按钮数量: {len(submits)}")
    for idx, sub in enumerate(submits):
        try:
            print(f"Submit {idx}: text={sub.inner_text().strip()}, visible={sub.is_visible()}")
        except Exception as e:
            pass

    ctx.close()
