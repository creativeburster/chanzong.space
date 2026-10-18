# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cookie_file = os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json")
with open(cookie_file, 'r', encoding='utf-8') as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    ctx = browser.new_context()
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto('https://space.bilibili.com/520219006/dynamic', wait_until='domcontentloaded')
    time.sleep(4)
    
    # 找到时间元素并点击它
    item = page.locator('.bili-dyn-item').first
    time_el = item.locator('[class*="time"]').first
    print("Found time element text:", time_el.inner_text())
    
    with ctx.expect_page() as pinfo:
        time_el.click()
    newp = pinfo.value
    newp.wait_for_load_state("domcontentloaded")
    print("NEW PAGE URL:", newp.url)
    
    # 把第一条和第二条的直链都找出来
    items = page.locator('.bili-dyn-item').all()
    print("Total items:", len(items))
    for i, it in enumerate(items[:3]):
        t = it.locator('[class*="time"]').first
        txt = t.inner_text()
        print(f"Item {i} time: {txt}")
        
    browser.close()
