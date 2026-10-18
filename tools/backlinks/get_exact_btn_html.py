# -*- coding: utf-8 -*-
import json
import time
import os
import sys
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
CARD_PATH = os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f: cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 切换【上传图文】
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
    file_input = page.query_selector("input[type='file']")
    if file_input:
        file_input.set_input_files(CARD_PATH)
        time.sleep(5)
        
    # 获取页面底部的操作栏
    btn_info = page.evaluate("""() => {
        // 查找所有包含“暂存”或“发布”的元素
        const els = Array.from(document.querySelectorAll('*'));
        const matches = els.filter(el => {
            const t = el.innerText ? el.innerText.trim() : '';
            return t === '发布' || t === '暂存离开' || t.includes('发布') || t.includes('暂存');
        });
        return matches.map(el => ({
            tag: el.tagName,
            className: el.className,
            text: el.innerText.trim(),
            outerHTML: el.outerHTML.substring(0, 200),
            rect: el.getBoundingClientRect()
        }));
    }""")
    
    # 写入文件查看
    with open("tools/backlinks/btns.json", "w", encoding="utf-8") as f:
        json.dump(btn_info, f, ensure_ascii=False, indent=2)
    print("已写入 btns.json，匹配到数量:", len(btn_info))
    
    # 查找最符合红色发布按钮的
    for b in btn_info:
        if b["text"] == "发布" and b["rect"]["width"] > 40 and b["rect"]["height"] > 20:
            print("FOUND RED PUBLISH BUTTON! Coordinates:", b["rect"])
            r = b["rect"]
            page.mouse.click(r["x"] + r["width"]/2, r["y"] + r["height"]/2)
            print("已用 mouse.click 点击发布！等待 8 秒...")
            time.sleep(8)
            break
            
    page.screenshot(path="tools/backlinks/xhs_click_verify.png")
    print("点击后当前 URL:", page.url)
    browser.close()
