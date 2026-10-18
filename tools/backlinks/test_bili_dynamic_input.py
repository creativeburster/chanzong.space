# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

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
    
    # 查找输入框和发布按钮
    editor = page.query_selector('.bili-rich-textarea__inner')
    if editor:
        print("找到动态输入框，点击并输入...")
        editor.click()
        time.sleep(0.5)
        
        # 测试打字
        test_text = "【禅修心悟】“应无所住而生其心”，凡夫常在境上起分别，心随境转，故生无量烦恼。若见诸相非相，即见如来。\n\n研习经典原文与心性图谱：https://chanzong.space/classics/jingangjing"
        page.keyboard.insert_text(test_text)
        time.sleep(1)
        page.keyboard.press("Space")
        time.sleep(1)
        
    page.screenshot(path="tools/backlinks/bilibili_dyn_typed.png")
    
    # 查看发布按钮的状态
    btn_info = page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button, div, span')).find(el => el.innerText && el.innerText.trim() === '发布');
        return btn ? {
            tag: btn.tagName,
            className: btn.className,
            outerHTML: btn.outerHTML,
            disabled: btn.getAttribute('disabled')
        } : null;
    }""")
    print("发布按钮状态:", json.dumps(btn_info, ensure_ascii=False, indent=2))
    
    ctx.close()
