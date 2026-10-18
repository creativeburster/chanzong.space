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

    # 打印包含“发布”或“暂存”或位于底部的所有元素
    nodes = page.evaluate("""() => {
        const results = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
            const t = (node.innerText || '').trim();
            const rect = node.getBoundingClientRect();
            // 只要是在底部区域 (y > 700) 或者是 button
            if (rect.y > 700 && rect.width > 20 && rect.height > 15) {
                results.push({
                    tag: node.tagName,
                    id: node.id,
                    className: typeof node.className === 'string' ? node.className : '',
                    text: t.slice(0, 50),
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height),
                    html: node.outerHTML.slice(0, 120)
                });
            }
        }
        return results;
    }""")

    print(f"Bottom elements count: {len(nodes)}")
    for n in nodes:
        print(f"[{n['tag']}] text='{n['text']}' class='{n['className'][:40]}' rect=({n['x']},{n['y']},{n['w']},{n['h']}) html={n['html'][:60]}")

    # 同时，尝试直接用坐标点击红色按钮位置！
    # 从截图来看，发布按钮大约在 x=520, y=948? 视口是 1440x900，注意底栏在 900 视口里的位置
    browser.close()
