# -*- coding: utf-8 -*-
"""
探索微博输入框和发送按钮的精确选择器
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

def explore():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        info = page.evaluate("""() => {
            const textareas = Array.from(document.querySelectorAll('textarea')).map(el => ({
                placeholder: el.placeholder,
                className: el.className,
                name: el.name
            }));
            const editables = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(el => ({
                className: el.className,
                innerText: el.innerText
            }));
            const buttons = Array.from(document.querySelectorAll('button')).map(el => ({
                text: el.innerText.trim(),
                className: el.className
            })).filter(b => b.text.includes('发送') || b.text.includes('发布'));
            
            return {
                textareas,
                editables,
                buttons
            };
        }""")
        
        print("DOM 探测结果:", json.dumps(info, ensure_ascii=False, indent=2))
        browser.close()

if __name__ == "__main__":
    explore()
