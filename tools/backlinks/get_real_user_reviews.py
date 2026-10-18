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
    
    # 访问真正账号的书评页
    user_reviews_url = "https://book.douban.com/people/132002368/reviews"
    print(f"正在访问真实账号书评列表: {user_reviews_url}")
    page.goto(user_reviews_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    page.screenshot(path="tools/backlinks/douban_real_user_reviews.png")
    print("页面标题:", page.title())
    
    reviews = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a[href*="/review/"]')).map(a => ({
            title: a.innerText.trim(),
            url: a.href
        })).filter(x => x.url.match(/review\/\d+/));
        return links;
    }""")
    print("真实账号的书评列表:", reviews)
    
    # 同时也访问书目评论列表看看
    book_reviews_url = "https://book.douban.com/subject/3007708/reviews"
    page.goto(book_reviews_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    found_in_book = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a[href*="/review/"]')).map(a => ({
            title: a.innerText.trim(),
            url: a.href
        })).filter(x => x.title.includes("本来无一物"));
        return links;
    }""")
    print("在《六祖坛经》书评列表中找到:", found_in_book)
    
    ctx.close()
