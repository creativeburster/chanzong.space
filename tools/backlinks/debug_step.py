# -*- coding: utf-8 -*-
import os
import sys
import json
import time
import glob
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

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
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/step1_load.png")
    
    # 切换图文
    page.mouse.click(425, 95)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/step2_tab.png")

    cards = glob.glob(os.path.join(CUR_DIR, "xhs_cards", "*.png"))
    card_path = os.path.abspath(cards[0])
    print("Uploading card:", card_path)
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if file_input:
        file_input.set_input_files(card_path)
        print("Set input files done, waiting 8s for processing...")
        time.sleep(8)
    else:
        print("No file input found!")
    page.screenshot(path="tools/backlinks/step3_uploaded.png")

    # 检查是否有标题输入框
    title_el = page.query_selector('input[placeholder*="填写标题"], input.d-text')
    print("Title element exists:", bool(title_el))
    
    # 获取页面上所有可见文本包含“发布”或“暂存”或红色按钮的元素
    elements = page.evaluate("""() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all.map(el => {
            const text = (el.innerText || '').trim();
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            const isClickable = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || style.cursor === 'pointer' || el.onclick != null || (el.className && typeof el.className === 'string' && el.className.includes('btn'));
            return {
                tag: el.tagName,
                text: text,
                className: typeof el.className === 'string' ? el.className : '',
                bg: style.backgroundColor,
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                isClickable: isClickable
            };
        }).filter(e => e.w > 20 && e.h > 20 && (e.text === '发布' || e.text === '暂存离开' || e.text.includes('发布笔记') || e.bg.includes('255, 36, 66') || e.bg.includes('rgb(255, 46') || e.bg.includes('rgb(235,') || e.bg.includes('rgb(255, 36')));
    }""")
    
    print("Matched elements count:", len(elements))
    for el in elements:
        print(f"  <{el['tag']}> text='{el['text']}' bg='{el['bg']}' rect=({el['x']},{el['y']},{el['w']},{el['h']}) clickable={el['isClickable']}")
    
    browser.close()
