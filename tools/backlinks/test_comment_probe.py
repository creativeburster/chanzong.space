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
    page.goto('https://www.zhihu.com/question/20420786', wait_until='domcontentloaded', timeout=30000)
    time.sleep(3)
    
    # 查找评论按钮
    btns = page.locator('button').filter(has_text='评论').all()
    print(f'找到含评论的按钮数量: {len(btns)}')
    for i, b in enumerate(btns[:5]):
        try:
            print(f"Button {i}: text={b.inner_text().strip()!r}, class={b.get_attribute('class')}")
        except Exception as e:
            print(f"Error {i}: {e}")
            
    if btns:
        print("尝试点击第一个评论按钮...")
        btns[0].click()
        time.sleep(3)
        page.screenshot(path="tools/backlinks/test_comment_opened.png")
        print("点击后截图完成")
        
        # 查找评论输入框
        inputs = page.locator('input, [contenteditable="true"]').all()
        print(f"找到输入元素数量: {len(inputs)}")
        for j, inp in enumerate(inputs):
            try:
                print(f"Input {j}: tag={inp.evaluate('el => el.tagName')}, placeholder={inp.get_attribute('placeholder')}, aria={inp.get_attribute('aria-label')}, class={inp.get_attribute('class')}")
            except Exception as e:
                pass
                
    ctx.close()
