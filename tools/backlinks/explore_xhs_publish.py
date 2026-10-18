# -*- coding: utf-8 -*-
"""
探索小红书【上传图文】页面结构与输入元素
"""
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")

def explore():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = []
    for k, v in cookie_dict.items():
        cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
        cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})
        
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=30000)
        time.sleep(4)
        
        # 查找【上传图文】Tab
        print("点击【上传图文】Tab...")
        image_tab = page.query_selector('div:has-text("上传图文"), span:has-text("上传图文")')
        if image_tab:
            page.evaluate("el => el.click()", image_tab)
            time.sleep(3)
            
        page.screenshot(path="tools/backlinks/xhs_tab_image.png")
        
        # 探测 DOM 元素
        dom_info = page.evaluate("""() => {
            const inputs = Array.from(document.querySelectorAll('input')).map(el => ({
                type: el.type,
                placeholder: el.placeholder,
                className: el.className
            }));
            const textareas = Array.from(document.querySelectorAll('textarea')).map(el => ({
                placeholder: el.placeholder,
                className: el.className
            }));
            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).length;
            const buttons = Array.from(document.querySelectorAll('button')).map(el => el.innerText.trim()).filter(Boolean);
            
            return {
                fileInputs,
                inputs,
                textareas,
                buttons
            };
        }""")
        
        print("DOM 探测结果:", json.dumps(dom_info, ensure_ascii=False, indent=2))
        browser.close()

if __name__ == "__main__":
    explore()
