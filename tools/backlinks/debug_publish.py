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
    page.mouse.click(425, 95)
    time.sleep(3)

    cards = glob.glob(os.path.join(CUR_DIR, "xhs_cards", "*.png"))
    card_path = os.path.abspath(cards[0])
    print("Using card:", card_path)
    file_input = page.query_selector("input.upload-input, input[type='file']")
    file_input.set_input_files(card_path)
    print("Waiting for upload to finish...")
    time.sleep(5)

    # 填写标题和正文
    title_input = page.query_selector('input[placeholder*="填写标题"], input.d-text')
    if title_input:
        title_input.fill("测试六祖坛经智慧")
    time.sleep(1)

    desc_area = page.query_selector('div[contenteditable="true"], .tiptap.ProseMirror')
    if desc_area:
        desc_area.click()
        page.keyboard.insert_text("本来无一物，何处惹尘埃。\n典籍全文导读已收录于：禅宗知识库 (chanzong.space)")
    time.sleep(1)
    page.keyboard.press("Escape")
    time.sleep(1)

    # 查看页面上所有的按钮信息
    btns_info = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button, [role="button"], div[class*="btn"]')).map((b, i) => {
            const rect = b.getBoundingClientRect();
            return {
                idx: i,
                tag: b.tagName,
                text: b.innerText ? b.innerText.trim() : '',
                className: typeof b.className === 'string' ? b.className : '',
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                visible: rect.width > 0 && rect.height > 0
            };
        }).filter(b => b.visible && (b.text.includes('发布') || b.text.includes('暂存')));
    }""")
    print("Found buttons:")
    for b in btns_info:
        print(f"  [{b['idx']}] <{b['tag']}> text='{b['text']}' class='{b['className']}' rect=({b['x']}, {b['y']}, {b['w']}, {b['h']})")

    # 尝试使用真实鼠标坐标点击“发布”按钮
    publish_btn = None
    for b in btns_info:
        if b['text'] == '发布':
            publish_btn = b
            break
    
    if publish_btn:
        cx = publish_btn['x'] + publish_btn['w'] // 2
        cy = publish_btn['y'] + publish_btn['h'] // 2
        print(f"Clicking publish at ({cx}, {cy})...")
        page.mouse.click(cx, cy)
        time.sleep(6)
        page.screenshot(path="tools/backlinks/debug_after_click.png")
        print("After click url:", page.url)

    browser.close()
