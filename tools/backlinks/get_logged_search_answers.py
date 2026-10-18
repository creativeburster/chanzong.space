# -*- coding: utf-8 -*-
import os, sys, time
from urllib.parse import quote
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    # 搜索“六祖坛经”
    page.goto(f"https://www.zhihu.com/search?type=content&q={quote('六祖坛经')}", wait_until="domcontentloaded")
    time.sleep(3)
    
    ans_links = page.evaluate("""() => {
        const list = [];
        const links = document.querySelectorAll('a[href*="/answer/"]');
        for (let a of links) {
            list.push({ text: a.innerText.trim() || '无标题', href: a.href });
        }
        return list;
    }""")
    print("坛经回答链接:", ans_links[:5])
    
    # 搜索“金刚经”
    page.goto(f"https://www.zhihu.com/search?type=content&q={quote('金刚经')}", wait_until="domcontentloaded")
    time.sleep(3)
    
    jg_links = page.evaluate("""() => {
        const list = [];
        const links = document.querySelectorAll('a[href*="/answer/"]');
        for (let a of links) {
            list.push({ text: a.innerText.trim() || '无标题', href: a.href });
        }
        return list;
    }""")
    print("金刚经回答链接:", jg_links[:5])
    
    ctx.close()
