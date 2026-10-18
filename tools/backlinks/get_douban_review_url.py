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
    
    # 访问用户的书评列表页面
    user_reviews_url = "https://book.douban.com/people/200609284/reviews"
    print(f"正在访问用户书评列表: {user_reviews_url}")
    page.goto(user_reviews_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    reviews = page.evaluate("""() => {
        const list = [];
        const items = document.querySelectorAll('.tlst, .main-bd, .review-item, [data-cid]');
        for (const item of items) {
            const a = item.querySelector('a[href*="/review/"]');
            if (a) {
                list.push({
                    title: a.innerText.trim(),
                    url: a.href
                });
            }
        }
        if (list.length === 0) {
            // fallback 全局找 review 链接
            const allLinks = Array.from(document.querySelectorAll('a[href*="/review/"]')).map(a => ({
                title: a.innerText.trim(),
                url: a.href
            })).filter(x => x.url.match(/review\/\d+/));
            return allLinks;
        }
        return list;
    }""")
    print("获取到的书评链接列表:", reviews)
    page.screenshot(path="tools/backlinks/douban_my_reviews.png")
    
    if reviews:
        # 打开第一篇书评的独立详情页并截图
        first_review_url = reviews[0]["url"]
        print(f"正在访问书评独立详情页: {first_review_url}")
        page.goto(first_review_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_review_1_detail.png")
        print("书评详情页标题:", page.title())
        print("独立详情页截图已保存")
        
    ctx.close()
