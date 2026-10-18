# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        ctx.add_cookies(json.load(f))
    page = ctx.new_page()
    page.goto("https://juejin.cn/editor/drafts/new", timeout=35000)
    time.sleep(3)
    pub_btn = page.query_selector("button:has-text('发布')")
    if pub_btn:
        pub_btn.click()
        time.sleep(3)
        page.screenshot(path="scratch/juejin_drawer_debug.png")
        inputs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('input')).map(i => ({
                placeholder: i.placeholder,
                class: i.className,
                type: i.type
            }));
        }""")
        print("Inputs in drawer:", json.dumps(inputs, ensure_ascii=False, indent=2))
    ctx.close()
