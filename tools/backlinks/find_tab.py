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
    
    # 查找所有包含“图文”的元素
    tabs = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('*'));
        return els.filter(el => el.innerText && el.innerText.trim() === '上传图文').map(el => ({
            tag: el.tagName,
            className: el.className,
            outerHTML: el.outerHTML
        }));
    }""")
    print("MATCHED TABS:", json.dumps(tabs, ensure_ascii=False, indent=2))
    
    # 用鼠标点击坐标或者 click
    el = page.query_selector("span:text-is('上传图文'), div:text-is('上传图文'), li:has-text('上传图文')")
    if el:
        print("找到元素，点击中...")
        el.click()
        time.sleep(3)
        page.screenshot(path="tools/backlinks/xhs_after_click_tab.png")
        print("点击后截图完成！")
    else:
        print("未找到上传图文元素！")
        
    browser.close()
