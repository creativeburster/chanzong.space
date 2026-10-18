# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

VIDEO_URL = "https://www.bilibili.com/video/BV1XK4y1X7FF"

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
    
    print(f"正在访问视频页面: {VIDEO_URL}")
    page.goto(VIDEO_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 滚动到评论区
    page.evaluate("window.scrollTo(0, 600)")
    time.sleep(2)
    
    comment_area = page.evaluate("""() => {
        const box = document.querySelector('.reply-box-textarea, textarea.reply-box-textarea, .reply-box [contenteditable="true"]');
        const sendBtn = document.querySelector('.reply-box-send, button.reply-box-send');
        return {
            hasBox: !!box,
            tag: box ? box.tagName : null,
            className: box ? box.className : null,
            placeholder: box ? box.placeholder : null,
            hasSendBtn: !!sendBtn,
            sendBtnText: sendBtn ? sendBtn.innerText.trim() : null
        };
    }""")
    print("评论区表单探测:", json.dumps(comment_area, ensure_ascii=False, indent=2))
    page.screenshot(path="tools/backlinks/bilibili_video_comment_area.png")
    
    ctx.close()
