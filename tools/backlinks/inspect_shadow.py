# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)

cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(4)

    page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab'));
        for (const t of tabs) {
            if (t.innerText.includes('上传图文')) {
                t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                break;
            }
        }
    }""")
    time.sleep(2)

    card_path = os.path.abspath("tools/backlinks/xhs_cards/card_1788834670.png")
    page.query_selector("input[type='file']").set_input_files(card_path)
    time.sleep(6)

    # 检查 xhs-publish-btn
    res = page.evaluate("""() => {
        const btn = document.querySelector('xhs-publish-btn');
        if (!btn) return { error: 'No xhs-publish-btn found' };
        
        let shadow = btn.shadowRoot;
        let innerHTML = shadow ? shadow.innerHTML : btn.innerHTML;
        let buttons = [];
        if (shadow) {
            buttons = Array.from(shadow.querySelectorAll('button, div, span')).map(b => {
                const r = b.getBoundingClientRect();
                return {
                    tag: b.tagName,
                    text: b.innerText,
                    className: b.className,
                    x: r.x, y: r.y, w: r.width, h: r.height
                };
            });
        } else {
            buttons = Array.from(btn.querySelectorAll('button, div, span')).map(b => {
                const r = b.getBoundingClientRect();
                return {
                    tag: b.tagName,
                    text: b.innerText,
                    className: b.className,
                    x: r.x, y: r.y, w: r.width, h: r.height
                };
            });
        }
        const rect = btn.getBoundingClientRect();
        return {
            hasShadow: !!shadow,
            innerHTML: innerHTML.slice(0, 300),
            rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            buttons: buttons.filter(b => b.w > 30 && b.h > 20)
        };
    }""")

    print("xhs-publish-btn analysis:")
    print(json.dumps(res, ensure_ascii=False, indent=2))
    browser.close()
