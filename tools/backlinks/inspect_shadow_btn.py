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
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

web_session = "0400698c3c69a108722d159d0d384befa89e22"
a1 = "19eca63805fhheoju31sd200qbutsq3q159qcs91u50000381143"

cookies = [
    {"name": "web_session", "value": web_session, "domain": ".xiaohongshu.com", "path": "/"},
    {"name": "a1", "value": a1, "domain": ".xiaohongshu.com", "path": "/"},
    {"name": "web_session", "value": web_session, "domain": "creator.xiaohongshu.com", "path": "/"},
    {"name": "a1", "value": a1, "domain": "creator.xiaohongshu.com", "path": "/"}
]

card_path = os.path.abspath(os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png"))

def inspect():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto("https://creator.xiaohongshu.com/publish/publish", timeout=35000)
        time.sleep(3)
        page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('*'));
            const tab = els.find(el => (el.innerText || '').trim() === '上传图文' && el.children.length === 0);
            if (tab) tab.click();
        }""")
        time.sleep(2)
        page.set_input_files("input[type='file']", card_path)
        time.sleep(5)
        
        info = page.evaluate("""() => {
            const host = document.querySelector('xhs-publish-btn');
            if (!host) return { found: false };
            const shadow = host.shadowRoot;
            return {
                found: true,
                outerHTML: host.outerHTML.slice(0, 300),
                hasShadow: !!shadow,
                shadowHTML: shadow ? shadow.innerHTML.slice(0, 1000) : '',
                children: Array.from(host.querySelectorAll('*')).map(c => ({
                    tag: c.tagName,
                    cls: c.className,
                    text: c.innerText,
                    html: c.outerHTML.slice(0, 150)
                }))
            };
        }""")
        print("xhs-publish-btn 详细结构:")
        print(json.dumps(info, ensure_ascii=False, indent=2))
        ctx.close()

if __name__ == "__main__":
    inspect()
