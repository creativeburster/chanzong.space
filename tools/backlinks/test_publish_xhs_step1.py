# -*- coding: utf-8 -*-
import os
import sys
import time
import json
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

def run():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 打开小红书发布页面...")
        page.goto("https://creator.xiaohongshu.com/publish/publish", timeout=35000)
        time.sleep(3)
        
        print("2. 查找并点击【上传图文】Tab...")
        clicked_tab = page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('*'));
            const tab = els.find(el => (el.innerText || '').trim() === '上传图文' && el.children.length === 0);
            if (tab) {
                tab.click();
                return { clicked: true, tag: tab.tagName, cls: tab.className };
            }
            return { clicked: false };
        }""")
        print("Tab 点击结果:", clicked_tab)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "xhs_tab_clicked.png"))
        
        print("3. 查找 file input 并上传图片...")
        file_input = page.query_selector("input[type='file']")
        if file_input:
            print("找到 file input，正在上传图片:", card_path)
            file_input.set_input_files(card_path)
            time.sleep(6)
            page.screenshot(path=os.path.join(CUR_DIR, "xhs_image_uploaded.png"))
            print("图片已上传，已截图 xhs_image_uploaded.png")
            
            # 探测表单内的元素
            form_info = page.evaluate("""() => {
                const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(el => ({
                    tag: el.tagName,
                    type: el.type || '',
                    placeholder: el.placeholder || '',
                    cls: el.className || '',
                    contentEditable: el.contentEditable || ''
                }));
                const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
                    text: b.innerText.trim(),
                    cls: b.className || ''
                }));
                return { inputs, buttons };
            }""")
            print("表单探测信息:", json.dumps(form_info, ensure_ascii=False, indent=2))
        else:
            print("未找到 input[type='file']")
            
        ctx.close()

if __name__ == "__main__":
    run()
