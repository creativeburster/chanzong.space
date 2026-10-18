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

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

REVIEW_EDIT_URL = "https://book.douban.com/review/17808304/edit"

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
    
    page.goto(REVIEW_EDIT_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 查找所有的工具栏 a 标签
    links = page.evaluate("""() => {
        const toolbar = document.querySelector('.DRE-toolbar, [class*="toolbar"]');
        if (!toolbar) return [];
        return Array.from(toolbar.querySelectorAll('a, button, [role="button"]')).map(el => ({
            className: el.className,
            title: el.title,
            text: el.innerText.trim(),
            outerHTML: el.outerHTML
        }));
    }""")
    print("工具栏所有按钮:", json.dumps(links, ensure_ascii=False, indent=2))
    
    # 点击那个 🔗 按钮看有什么反应
    page.evaluate("""() => {
        const linkBtn = document.querySelector('.DRE-ui-button-link, [class*="button-link"], [class*="link"]');
        if (linkBtn) linkBtn.click();
    }""")
    time.sleep(2)
    page.screenshot(path="tools/backlinks/douban_click_link_icon.png")
    
    popup_info = page.evaluate("""() => {
        const pop = document.querySelector('.DRE-popover, .DRE-dialog, [class*="popover"], [class*="tooltip"]');
        return pop ? pop.outerHTML : "no popup";
    }""")
    print("点击后弹窗/气泡:", popup_info)
    
    ctx.close()
