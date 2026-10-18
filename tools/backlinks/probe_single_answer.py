# -*- coding: utf-8 -*-
import os, time
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"
with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://www.zhihu.com/question/2075478984276686445/answer/2081125123013206499", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/zhihu_answer_single_inspect.png")
    
    # 查找评论相关按钮
    btns = page.evaluate("""() => {
        const elements = Array.from(document.querySelectorAll('button, a'));
        return elements.filter(el => el.innerText.includes('评论')).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            class: el.className
        }));
    }""")
    print("Found comment buttons:", btns)
    ctx.close()
