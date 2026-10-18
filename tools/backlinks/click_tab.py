# -*- coding: utf-8 -*-
import json
import time
from playwright.sync_api import sync_playwright

with open('tools/backlinks/.browser_profile/xhs_cookie.json', 'r', encoding='utf-8') as f:
    cd = json.load(f)
cookies = [{'name': k, 'value': v.strip('"'), 'domain': '.xiaohongshu.com', 'path': '/'} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, args=['--disable-blink-features=AutomationControlled'])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto('https://creator.xiaohongshu.com/publish/publish', wait_until='domcontentloaded')
    time.sleep(4)
    
    # 原生 JS 点击真正可见的【上传图文】
    success = page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab, div[class*="tab"]'));
        for (const t of tabs) {
            const rect = t.getBoundingClientRect();
            if (t.innerText.includes('上传图文') && rect.width > 0 && rect.left >= 0) {
                t.click();
                return { clicked: true, text: t.innerText, rect };
            }
        }
        return { clicked: false };
    }""")
    print("CLICK RESULT:", json.dumps(success, ensure_ascii=False))
    time.sleep(3)
    page.screenshot(path="tools/backlinks/xhs_image_tab_active.png")
    
    # 检查当前 input type="file" 的数量与属性
    file_inputs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
            accept: el.accept,
            className: el.className
        }));
    }""")
    print("FILE INPUTS:", json.dumps(file_inputs, ensure_ascii=False))
    browser.close()
