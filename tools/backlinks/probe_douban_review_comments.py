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

# 探测热门书评，例如六祖坛经的热门书评列表
URL = "https://book.douban.com/subject/3007708/reviews"

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
    
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    top_reviews = page.evaluate("""() => {
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
        return list.slice(0, 5);
    }""")
    print("热门书评列表:", json.dumps(top_reviews, ensure_ascii=False, indent=2))
    
    # 打开其中一个热门书评，看评论回复框
    if top_reviews:
        first = top_reviews[0]["url"]
        print(f"打开热门书评: {first}")
        page.goto(first, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 探测评论输入框
        comment_box = page.evaluate("""() => {
            const textarea = document.querySelector('textarea[name="rv_comment"], textarea#last, #comments form textarea');
            const submitBtn = document.querySelector('#comments input[type="submit"], #comments button, input[value="加上去"]');
            return {
                hasTextarea: !!textarea,
                textareaName: textarea ? textarea.name : null,
                textareaId: textarea ? textarea.id : null,
                hasSubmit: !!submitBtn,
                submitVal: submitBtn ? (submitBtn.value || submitBtn.innerText) : null
            };
        }""")
        print("热门书评评论区探测:", comment_box)
        page.screenshot(path="tools/backlinks/douban_popular_review.png")
        
    ctx.close()
