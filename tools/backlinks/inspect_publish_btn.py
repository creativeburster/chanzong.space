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
        file_input = page.query_selector("input[type='file']")
        file_input.set_input_files(card_path)
        time.sleep(5)
        
        # 填充标题和正文
        page.evaluate("""() => {
            const inp = document.querySelector('input.d-text, input[placeholder*="标题"]');
            if (inp) {
                inp.value = '测试标题六祖坛经';
                inp.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }""")
        time.sleep(1)
        
        # 滚动到底部
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)
        
        # 用 elementFromPoint 扫描屏幕底部
        points = []
        for y in [820, 850, 880]:
            for x in [480, 500, 520, 540, 560]:
                points.append((x, y))
                
        res = page.evaluate("""(pts) => {
            const list = [];
            for (const [x, y] of pts) {
                const el = document.elementFromPoint(x, y);
                if (el) {
                    list.push({
                        x, y,
                        tag: el.tagName,
                        cls: (el.className || '').toString(),
                        text: (el.innerText || '').slice(0, 30),
                        html: el.outerHTML.slice(0, 100)
                    });
                }
            }
            return list;
        }""", points)
        print("坐标扫描结果:")
        print(json.dumps(res, ensure_ascii=False, indent=2))
        
        ctx.close()

if __name__ == "__main__":
    inspect()
