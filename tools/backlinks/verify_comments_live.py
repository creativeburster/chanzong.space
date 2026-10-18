# -*- coding: utf-8 -*-
import os, sys, time
from urllib.parse import quote
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
    
    # 检查第 1 条
    print("检查第 1 条评论...")
    page.goto("https://zhuanlan.zhihu.com/p/1979190068804612718", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.locator('button:has-text("评论")').first.click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/verify_comment_1.png")
    c1 = page.content()
    print("第 1 条包含 i禅修:", "i禅修" in c1, "包含 磨砖作镜:", "磨砖作镜" in c1)
    
    # 检查第 2 条
    print("检查第 2 条评论...")
    page.goto("https://www.zhihu.com/question/1913876847906785200", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.locator('button:has-text("条评论"), button:has-text("评论")').first.click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/verify_comment_2.png")
    c2 = page.content()
    print("第 2 条包含 i禅修:", "i禅修" in c2, "包含 应无所住:", "应无所住" in c2)
    
    # 检查第 3 条
    print("检查第 3 条评论...")
    page.goto("https://www.zhihu.com/question/1930541820477174046", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.locator('button:has-text("条评论"), button:has-text("评论")').first.click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/verify_comment_3.png")
    c3 = page.content()
    print("第 3 条包含 i禅修:", "i禅修" in c3, "包含 狂心若歇:", "狂心若歇" in c3)

    ctx.close()
