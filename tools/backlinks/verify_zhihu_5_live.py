# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

ANSWERS = [
    ("达摩血脉论", "https://www.zhihu.com/question/1920463062604940234/answer/2080595715986813616"),
    ("楞严经核心", "https://www.zhihu.com/question/1936384195430687530/answer/2080595975081665597"),
    ("八识规矩颂", "https://www.zhihu.com/question/1962834109404542124/answer/2080596233115246671"),
    ("信心铭", "https://www.zhihu.com/question/459168425/answer/2080596824281310060"),
    ("永嘉证道歌", "https://www.zhihu.com/question/1967165225909335858/answer/2080597189684999141"),
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    for idx, (name, u) in enumerate(ANSWERS):
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        title = page.title()
        has_hash = page.evaluate("() => document.body.innerText.includes('###') || document.body.innerText.includes('**')")
        has_chanzong = page.evaluate("() => document.body.innerText.includes('chanzong.space')")
        print(f"[{idx+1}/5] {name}: Title={title[:20]}, 裸符号={has_hash}, 落地页外链={has_chanzong}")
        page.screenshot(path=f"tools/backlinks/zhihu_ans_{idx+1}_live.png")
    ctx.close()
