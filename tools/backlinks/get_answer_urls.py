# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

URLS = [
    "https://www.zhihu.com/question/20420786",
    "https://www.zhihu.com/question/20658406",
    "https://www.zhihu.com/question/21659858"
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    for u in URLS:
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 提取第一个回答的链接与作者
        answer_data = page.evaluate("""() => {
            const firstItem = document.querySelector('.ContentItem.AnswerItem');
            if (!firstItem) return null;
            const author = firstItem.querySelector('.AuthorInfo-name')?.innerText || '未知答主';
            const link = firstItem.querySelector('a[href*="/answer/"]')?.href;
            const answerUrl = link || window.location.href;
            return { author, answerUrl };
        }""")
        print(f"问题: {u} -> Answer 信息: {answer_data}")
        
    ctx.close()
