# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

cur_dir = os.path.dirname(os.path.abspath(__file__))
cookie_file = os.path.join(cur_dir, "douban_cookies.json")

with open(cookie_file, "r", encoding="utf-8") as f:
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
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    test_url = "https://book.douban.com/review/9107380/"
    page.goto(test_url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(2)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    page.screenshot(path="tools/backlinks/douban_bottom_probe.png")
    
    form_info = page.evaluate("""() => {
        const textareas = Array.from(document.querySelectorAll('textarea'));
        const forms = Array.from(document.querySelectorAll('form'));
        const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        return {
            textareas: textareas.map(t => ({ id: t.id, name: t.name, class: t.className })),
            forms: forms.map(f => ({ id: f.id, action: f.action })),
            buttons: btns.map(b => ({ val: b.value || b.innerText, type: b.type, class: b.className }))
        };
    }""")
    print("Form info:", json.dumps(form_info, ensure_ascii=False, indent=2))
    browser.close()
