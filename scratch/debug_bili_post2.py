# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COOKIE_FILE = os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json")
with open(COOKIE_FILE, 'r', encoding='utf-8') as f:
    cookies = json.load(f)

content = """【曹溪正传 · 顿悟法雷】荷泽神会显宗记心髓考据
唐代天宝年间，荷泽神会禅师于滑台设无遮大会，定南北是非，立曹溪顿门。
其所撰《显宗记》云：“湛然常寂，应用无方。用而常空，空而常用。用而不有，即是真空；空而不无，便成妙有。”
神会禅师力倡“无念为宗，无作为体”，直示学者：心体本空，灵知不昧。在日用繁琐中了知能应一切而不染一切，即是真如自性。

📚 深度研析《显宗记》原文逐句科判与曹溪法脉图谱：https://chanzong.space/classics/shenhui"""

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded")
    time.sleep(4)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    editor.click()
    time.sleep(0.5)
    page.keyboard.press("Control+A")
    time.sleep(0.2)
    page.keyboard.press("Backspace")
    time.sleep(0.5)
    
    for line in content.split("\n"):
        if line.strip():
            page.keyboard.type(line, delay=8)
        page.keyboard.press("Enter")
        time.sleep(0.2)
        
    page.screenshot(path="scratch/bili_step1_typed.png")
    
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    print("Found pub btn:", pub_btn is not None)
    if pub_btn:
        print("Btn disabled:", pub_btn.get_attribute("disabled"))
        pub_btn.click()
        time.sleep(3)
        
    page.screenshot(path="scratch/bili_step2_clicked.png")
    
    # 检查是否有提示/弹窗
    popups = page.evaluate('''() => {
        const els = Array.from(document.querySelectorAll('.bili-modal, .bili-dialog, .bili-dyn-specification-popup, .bui-toast, [class*="toast"], [class*="modal"]'));
        return els.map(e => e.innerText.trim()).filter(Boolean);
    }''')
    print("Popups found:", popups)
    
    browser.close()
