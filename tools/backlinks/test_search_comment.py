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
    time.sleep(4)
    print('PAGE URL:', page.url)
    print('PAGE TITLE:', page.title())
    page.screenshot(path='tools/backlinks/test_zhihu_search.png')
    
    # 查看搜索出来的回答
    items = page.locator('.SearchResult-Card, .ContentItem').all()
    print(f'搜索卡片数量: {len(items)}')
    
    # 查看评论按钮
    comment_btns = page.locator('button:has-text("条评论"), button:has-text("添加评论")').all()
    print(f'页面上的评论按钮数量: {len(comment_btns)}')
    for i, b in enumerate(comment_btns[:3]):
        try:
            print(f'Comment Btn {i}: text={b.inner_text().strip()!r}')
        except Exception:
            pass
            
    ctx.close()
