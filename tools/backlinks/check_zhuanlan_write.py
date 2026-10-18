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
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/zhuanlan_current_state.png")
    
    # 打印当前标题和正文摘要
    title = page.evaluate('() => document.querySelector("textarea.Input, textarea[placeholder*=\'请输入标题\']")?.value || ""')
    content_len = page.evaluate('() => document.querySelector(".public-DraftEditor-content, div[contenteditable=\'true\']")?.innerText.length || 0')
    print("Draft Title:", title)
    print("Content length:", content_len)
    
    # 查看发布按钮
    btn_info = page.evaluate('''() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(b => ({ text: b.innerText.trim(), class: b.className, disabled: b.disabled }));
    }''')
    print("Buttons:", btn_info)
    ctx.close()
