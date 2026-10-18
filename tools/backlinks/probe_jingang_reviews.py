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

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

# 探测金刚经书评
URLS = [
    "https://book.douban.com/subject/26785340/reviews", # 金刚经说什么
    "https://book.douban.com/subject/4843456/reviews"   # 金刚经·心经 (中华书局)
]

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
    
    for u in URLS:
        page.goto(u, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2.5)
        reviews = page.evaluate("""() => {
            const list = [];
            const items = document.querySelectorAll('.review-item, [data-cid]');
            for (const it of items) {
                const a = it.querySelector('h2 a, a[href*="/review/"]');
                const author = it.querySelector('.name, a[href*="/people/"]');
                if (a && a.href.includes('/review/')) {
                    list.push({
                        title: a.innerText.trim(),
                        url: a.href,
                        author: author ? author.innerText.trim() : ''
                    });
                }
            }
            return list.slice(0, 3);
        }""")
        print(f"URL: {u} 的前几篇书评:", reviews)
        
    ctx.close()
