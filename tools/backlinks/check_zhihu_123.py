# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

urls = [
    ("回答1: 坛经", "https://www.zhihu.com/question/2036422757978723800/answer/2080588671347061388"),
    ("回答2: 虚妄", "https://www.zhihu.com/question/1928206401152451835/answer/2080590075331613854"),
    ("回答3: 悟", "https://www.zhihu.com/question/1913876847906785200/answer/2080590300813252077"),
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    for name, u in urls:
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        text = page.evaluate("() => document.querySelector('.RichContent-inner')?.innerText || ''")
        has_hash = "###" in text or "**" in text
        print(f"[{name}] 长度: {len(text)}, 包含裸露符号(###/**): {has_hash}")
        if len(text) > 0:
            print("  前100字:", text[:100].replace("\n", " "))
            print("  后100字:", text[-100:].replace("\n", " "))
    ctx.close()
