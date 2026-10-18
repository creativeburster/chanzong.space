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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
CARD_PATH = os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f: cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(3)
    
    page.mouse.click(425, 95)
    time.sleep(2)
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if file_input:
        file_input.set_input_files(CARD_PATH)
        print("等待上传并渲染...")
        time.sleep(7)
        
    # 获取页面上所有的 button 和具有按钮外观的类
    btns = page.evaluate("""() => {
        const list = [];
        const all = document.querySelectorAll('button, .btn, [role="button"], div[class*="submit"], div[class*="publish"]');
        for (const el of all) {
            list.push({
                tag: el.tagName,
                text: el.innerText.trim(),
                className: el.className
            });
        }
        return list;
    }""")
    print("ALL BUTTONS:", json.dumps(btns, ensure_ascii=False, indent=2))
    
    # 查找包含“发布”或者“暂存离开”的父级容器
    parents = page.evaluate("""() => {
        const spans = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.includes('暂存离开'));
        return spans.map(s => ({
            tag: s.tagName,
            className: s.className,
            innerHTML: s.innerHTML.substring(0, 300)
        }));
    }""")
    print("PARENTS OF 暂存离开:", json.dumps(parents, ensure_ascii=False, indent=2))
    browser.close()
