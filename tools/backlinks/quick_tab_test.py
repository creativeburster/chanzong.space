# -*- coding: utf-8 -*-
import json
import time
from playwright.sync_api import sync_playwright

with open('tools/backlinks/.browser_profile/xhs_cookie.json', 'r', encoding='utf-8') as f:
    cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 尝试方法 1: dispatch_event
    res = page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab'));
        for (const t of tabs) {
            if (t.innerText.includes('上传图文')) {
                t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                return { method: 'dispatch', text: t.innerText };
            }
        }
        return { method: 'none' };
    }""")
    print("RES:", res)
    time.sleep(2)
    
    # 检查 input accept
    accept = page.evaluate("""() => {
        const inp = document.querySelector('input[type="file"]');
        return inp ? inp.accept : null;
    }""")
    print("FILE ACCEPT AFTER CLICK:", accept)
    
    page.screenshot(path="tools/backlinks/xhs_quick_tab.png")
    browser.close()
