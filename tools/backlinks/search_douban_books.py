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

targets = ["金刚经", "心经"]
results = {}

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
    
    for kw in targets:
        url = f"https://book.douban.com/subject_search?search_text={kw}&cat=1001"
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2.5)
        
        books = page.evaluate("""() => {
            const list = [];
            const links = document.querySelectorAll('.item-root a.title-text, a[href*="/subject/"]');
            for (const a of links) {
                const text = a.innerText.trim();
                const href = a.href;
                if (href && href.includes('/subject/') && text && text.length >= 2) {
                    // 获取评分和评价人数
                    const parent = a.closest('.item-root') || a.parentElement;
                    const ratingEl = parent ? parent.querySelector('.rating_nums, .rating-star-ic') : null;
                    const metaEl = parent ? parent.querySelector('.meta, .abstract') : null;
                    list.push({
                        title: text,
                        url: href,
                        meta: metaEl ? metaEl.innerText.trim() : ''
                    });
                }
            }
            return list.slice(0, 5);
        }""")
        results[kw] = books
        print(f"搜索【{kw}】结果:", books[:3])
        
    ctx.close()
    
with open(os.path.join(CUR_DIR, "douban_search_results.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
