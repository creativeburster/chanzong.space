# -*- coding: utf-8 -*-
import os, time, json
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
    
    # 填标题
    title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
    title_el.click()
    title_el.fill("测试达摩二入四行")
    time.sleep(1)
    
    # 填正文
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
    editor.click()
    page.keyboard.insert_text("测试正文内容，达摩祖师理入与行入。")
    time.sleep(2)
    
    # 点击右上角发布按钮
    pub_btn = page.locator('button:has-text("发布")').last
    print("Pub button text:", pub_btn.inner_text())
    pub_btn.click()
    time.sleep(3)
    
    page.screenshot(path="tools/backlinks/zhuanlan_panel_inspect.png")
    
    modal_btns = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('.Modal button, [role="dialog"] button, .css-1yhmqf7 button, button'));
        return btns.map(b => ({ text: b.innerText.trim(), class: b.className }));
    }""")
    with open("tools/backlinks/zhuanlan_panel_btns.json", "w", encoding="utf-8") as f:
        json.dump(modal_btns, f, ensure_ascii=False, indent=2)
    print("Captured modal screenshot & btns")
    ctx.close()
