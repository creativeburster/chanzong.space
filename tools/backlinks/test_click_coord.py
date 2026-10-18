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
    
    # 找到具体“上传图文”文字的 bounding_box
    tab_box = page.evaluate("""() => {
        const spans = Array.from(document.querySelectorAll('span, div'));
        for (const s of spans) {
            if (s.children.length === 0 && s.innerText.trim() === '上传图文') {
                const r = s.getBoundingClientRect();
                if (r.width > 0 && r.left > 0) {
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
                }
            }
        }
        return null;
    }""")
    print("COORDINATE:", tab_box)
    
    if tab_box:
        page.mouse.click(tab_box["x"], tab_box["y"])
        time.sleep(3)
        page.screenshot(path="tools/backlinks/xhs_tab_clicked_coord.png")
        print("点击坐标完成！")
        
        # 再次检测是否出现上传图文的 input
        inputs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
                accept: el.accept,
                className: el.className
            }));
        }""")
        print("AFTER CLICK INPUTS:", json.dumps(inputs, ensure_ascii=False))
        
    browser.close()
