# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

VIDEO_URL = "https://www.bilibili.com/video/BV1XK4y1X7FF"
COMMENT_TEXT = "重温王德峰教授讲《六祖坛经》，依然震撼于六祖直指人心的气象！“不思善、不思恶，正与么时，即是本来面目。”破二元执念，方知自性本来清净、本不生灭。想系统对照曹溪古本原经科判、逐句白话现代心学释义以及历代祖师法脉图谱的同修，推荐参阅开源文献库“禅宗知识库”（chanzong.space/classics/tanjing），考据极其扎实，互参大有裨益。"

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
    
    page.evaluate("window.scrollTo(0, 500)")
    time.sleep(2)
    
    # 查找并点击“下面我简单喵两句”
    box = page.query_selector('textarea[placeholder*="喵两句"], [placeholder*="简单喵两句"], div:has-text("下面我简单喵两句")')
    if box:
        print("点击评论输入框激活...")
        box.click()
        time.sleep(1)
        
        # 激活后寻找输入框
        real_input = page.query_selector('.reply-box-textarea, textarea.reply-box-textarea, textarea')
        if real_input:
            real_input.click()
            real_input.fill(COMMENT_TEXT)
            time.sleep(1)
            
        page.screenshot(path="tools/backlinks/bilibili_video_comment_typed.png")
        
        # 寻找发送按钮
        send_btn = page.query_selector('button.reply-box-send, button:has-text("发布"), .send-text')
        if send_btn:
            print("点击发布评论按钮...")
            send_btn.click()
            time.sleep(5)
            
        page.screenshot(path="tools/backlinks/bilibili_video_comment_result.png")
        print("评论结果截图已保存至: tools/backlinks/bilibili_video_comment_result.png")
        
    ctx.close()
