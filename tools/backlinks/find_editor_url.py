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
    
    page.goto("https://member.bilibili.com/platform/upload/text/new-article", wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    all_clickable = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
            const t = el.innerText ? el.innerText.trim() : '';
            return t.includes('创作') || t.includes('编辑') || t.includes('投稿');
        }).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            href: el.href || null,
            className: el.className
        })).slice(0, 15);
    }""")
    print("可点击元素:", json.dumps(all_clickable, ensure_ascii=False, indent=2))
    
    # 点击草稿箱里的“编辑”按钮试一下
    edit_btn = page.query_selector('button:has-text("编辑"), div:has-text("编辑")')
    if edit_btn:
        print("找到草稿编辑按钮，点击...")
        with ctx.expect_page() as new_p:
            edit_btn.click()
        np = new_p.value
        np.wait_for_load_state("domcontentloaded")
        time.sleep(3)
        print("草稿编辑页 URL:", np.url)
        np.screenshot(path="tools/backlinks/bilibili_draft_editor.png")
        
    ctx.close()
