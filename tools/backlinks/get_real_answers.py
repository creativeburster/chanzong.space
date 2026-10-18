# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

URLS = [
    "https://www.zhihu.com/question/35431631",  # 楞严经
    "https://www.zhihu.com/question/60596323",  # 达摩血脉论
    "https://www.zhihu.com/question/38814717"   # 信心铭
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
        print("="*50)
        print("页面标题:", page.title())
        print("当前URL:", page.url)
        
        # 查找第一个回答的链接
        ans_info = page.evaluate("""() => {
            const card = document.querySelector('.AnswerItem, .ContentItem.AnswerItem');
            if (!card) return null;
            const author = card.querySelector('.AuthorInfo-name, .UserLink-link')?.innerText || '匿名答主';
            // 查找 answer 链接
            const link = card.querySelector('a[href*="/answer/"]')?.href || null;
            return { author, link };
        }""")
        print("回答信息:", ans_info)
        
    ctx.close()
