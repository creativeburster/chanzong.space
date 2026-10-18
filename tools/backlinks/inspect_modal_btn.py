# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookie_list)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    editor.click()
    page.keyboard.type("测试发布禅修", delay=20)
    time.sleep(1)
    
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    pub_btn.click()
    time.sleep(2)
    
    # 查找弹窗内所有按钮
    btns = page.evaluate("""() => {
        const list = Array.from(document.querySelectorAll('*')).filter(el => {
            const t = el.innerText ? el.innerText.trim() : '';
            return t === '确认并发送' || t === '确认并提交' || t === '同意并发送';
        }).map(el => ({
            tag: el.tagName,
            className: el.className,
            outerHTML: el.outerHTML
        }));
        return list;
    }""")
    print("确认并发送按钮信息:", json.dumps(btns, ensure_ascii=False, indent=2))
    
    # 尝试直接物理点击
    page.click('text="确认并发送"')
    time.sleep(5)
    page.screenshot(path="tools/backlinks/bilibili_after_rule_click.png")
    
    # 检查弹窗是否消失
    has_modal = page.evaluate("() => !!document.querySelector('.bili-modal, .bili-dialog-box')")
    print("弹窗是否还存在:", has_modal)
    
    ctx.close()
