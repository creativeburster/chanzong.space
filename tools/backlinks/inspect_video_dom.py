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
    page.goto("https://www.bilibili.com/video/BV1XK4y1X7FF", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollTo(0, 500)")
    time.sleep(2)
    
    # 查找所有包含“喵两句”或者评论相关的元素
    elements = page.evaluate("""() => {
        const list = Array.from(document.querySelectorAll('*')).filter(el => {
            const t = el.innerText ? el.innerText.trim() : '';
            const p = el.placeholder || '';
            return t.includes('简单喵两句') || p.includes('简单喵两句') || t.includes('输入评论');
        }).map(el => ({
            tag: el.tagName,
            className: el.className,
            placeholder: el.placeholder || null,
            outerHTML: el.outerHTML.slice(0, 200)
        }));
        
        // 查找 bili-comments 自定义组件
        const biliComments = document.querySelector('bili-comments');
        return {
            hasBiliComments: !!biliComments,
            biliCommentsShadow: biliComments ? !!biliComments.shadowRoot : false,
            matchedElements: list
        };
    }""")
    print("评论区元素结构:", json.dumps(elements, ensure_ascii=False, indent=2))
    ctx.close()
