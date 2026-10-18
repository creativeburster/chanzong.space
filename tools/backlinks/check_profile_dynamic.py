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
    
    page.goto("https://www.zhihu.com", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 查找个人主页链接
    user_link = page.locator('a[href*="/people/"]').first
    href = user_link.get_attribute("href")
    print("个人主页链接:", href)
    
    my_profile_url = f"https://www.zhihu.com{href}" if href.startswith("/") else href
    page.goto(my_profile_url, wait_until="domcontentloaded")
    time.sleep(3)
    
    print("个人主页标题:", page.title())
    print("个人主页URL:", page.url)
    page.screenshot(path="tools/backlinks/my_zhihu_profile_activities.png")
    
    # 获取动态列表或内容
    page.goto(f"{my_profile_url}/activities", wait_until="domcontentloaded")
    time.sleep(3)
    page.screenshot(path="tools/backlinks/my_zhihu_dynamic.png")
    
    # 打印动态项
    items = page.locator('.List-item, .ActivityItem').all()
    print(f"动态条数: {len(items)}")
    for i, it in enumerate(items[:6]):
        print(f"Item {i}: {it.inner_text()[:100]!r}")
        
    ctx.close()
