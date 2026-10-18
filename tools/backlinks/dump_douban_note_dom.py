# -*- coding: utf-8 -*-
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
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")

def dump_dom():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        page.goto("https://www.douban.com/note/create", timeout=30000)
        time.sleep(3)
        
        elements = page.evaluate("""() => {
            const res = [];
            const all = document.querySelectorAll('input, textarea, div[contenteditable="true"], button, [role="button"]');
            for (const el of all) {
                res.push({
                    tag: el.tagName,
                    type: el.type || '',
                    placeholder: el.placeholder || '',
                    className: el.className,
                    text: el.innerText.trim().slice(0, 30),
                    isContentEditable: el.isContentEditable,
                    visible: el.offsetParent !== null
                });
            }
            return res;
        }""")
        print(json.dumps(elements, ensure_ascii=False, indent=2))
        browser.close()

if __name__ == "__main__":
    dump_dom()
