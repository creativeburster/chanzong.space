# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        args=["--no-first-run", "--no-default-browser-check", "--disable-blink-features=AutomationControlled"],
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    url = "https://www.zhihu.com/question/2053095292069852633"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    my_btn = page.locator('button:has-text("查看我的回答"), a:has-text("查看我的回答")').first
    if my_btn.is_visible():
        print("Clicking '查看我的回答'...")
        my_btn.click()
        time.sleep(4)
        print("Current URL after click:", page.url)
        page.screenshot(path="tools/backlinks/my_xinjing_answer_view.png")
        
        # 提取答案内容
        content = page.evaluate("""() => {
            const rich = document.querySelector('.RichContent-inner, .CopyrightRichText-richText');
            return rich ? rich.innerText.slice(0, 500) : "not found";
        }""")
        print("My answer snippet:\n", content)
    else:
        print("Button not visible.")
        
    ctx.close()
