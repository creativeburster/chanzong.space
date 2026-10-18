# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookie_list)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 聚焦输入框并模拟真实输入
    editor = page.query_selector('.bili-rich-textarea__inner')
    editor.click()
    time.sleep(0.5)
    
    # 用 type 逐字输入短文本看是否变色
    page.keyboard.type("静心参禅，直了成佛。https://chanzong.space", delay=50)
    time.sleep(1)
    
    # 查看发布按钮的状态
    btn_state = page.evaluate("""() => {
        const btn = document.querySelector('.bili-dyn-publishing__action');
        return {
            className: btn ? btn.className : null,
            style: btn ? btn.getAttribute('style') : null,
            color: btn ? window.getComputedStyle(btn).backgroundColor : null,
            cursor: btn ? window.getComputedStyle(btn).cursor : null
        };
    }""")
    print("逐字打字后按钮状态:", json.dumps(btn_state, ensure_ascii=False, indent=2))
    page.screenshot(path="tools/backlinks/bilibili_dyn_after_type.png")
    
    ctx.close()
