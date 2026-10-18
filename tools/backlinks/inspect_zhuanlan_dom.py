# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

COOKIE_PATH = "tools/backlinks/.browser_profile/zhihu_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    dom_info = page.evaluate("""() => {
        const titleInput = document.querySelector('textarea, input');
        const contentEditor = document.querySelector('.public-DraftEditor-content, div[contenteditable="true"], .DraftEditor-editorContainer');
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim(),
            className: b.className
        }));
        
        return {
            hasTitle: !!titleInput,
            titleClass: titleInput ? titleInput.className : null,
            titleTag: titleInput ? titleInput.tagName : null,
            titlePlaceholder: titleInput ? titleInput.placeholder : null,
            hasContent: !!contentEditor,
            contentClass: contentEditor ? contentEditor.className : null,
            buttons: buttons.filter(b => b.text.length > 0 && b.text.length < 20)
        };
    }""")
    print("DOM Info:", json.dumps(dom_info, ensure_ascii=True, indent=2))
    browser.close()
