# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")

PAGES = [
    {"url": "https://zhuanlan.zhihu.com/p/1979190068804612718", "name": "tanjing"},
    {"url": "https://www.zhihu.com/question/1913876847906785200", "name": "jingang"},
    {"url": "https://www.zhihu.com/question/1930541820477174046", "name": "lengyan"}
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    for item in PAGES:
        print(f"检查页面 {item['name']}...")
        page.goto(item["url"], wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        btn = page.locator('button:has-text("评论")').first
        if btn.is_visible():
            btn.click()
            time.sleep(2)
            # 点击【最新】
            latest_tab = page.locator('button:has-text("最新")').first
            if latest_tab.is_visible():
                latest_tab.click()
                time.sleep(2)
            page.screenshot(path=f"tools/backlinks/tab_latest_{item['name']}.png")
            c = page.content()
            print(f"{item['name']} - 包含 i禅修: {'i禅修' in c}")
            
    ctx.close()
