# -*- coding: utf-8 -*-
import json
import time
import os
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
CARD_PATH = os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(4)
    
    # 点击【上传图文】
    page.mouse.click(425, 95)
    time.sleep(3)
    
    # 注入图片文件
    print(f"正在上传图片: {CARD_PATH}...")
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if file_input:
        file_input.set_input_files(CARD_PATH)
        print("已调用 set_input_files，等待图片处理与表单渲染...")
        time.sleep(6)
        
    page.screenshot(path="tools/backlinks/xhs_form_rendered.png")
    
    # 探测表单输入框
    form_info = page.evaluate("""() => {
        const titleInput = document.querySelector('input[placeholder*="标题"], input.d-text, input[class*="title"]');
        const descArea = document.querySelector('div[contenteditable="true"], textarea[placeholder*="正文"], textarea[placeholder*="描述"], #post-textarea');
        const publishBtn = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('发布')).map(b => ({
            text: b.innerText,
            className: b.className
        }));
        
        return {
            hasTitleInput: !!titleInput,
            titlePlaceholder: titleInput ? titleInput.placeholder : null,
            titleClass: titleInput ? titleInput.className : null,
            hasDescArea: !!descArea,
            descClass: descArea ? descArea.className : null,
            publishBtn
        };
    }""")
    print("FORM INFO:", json.dumps(form_info, ensure_ascii=False, indent=2))
    browser.close()
