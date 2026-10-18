# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

targets = [
    {"kw": "大乘起信论", "classic": "dachengqixinlun"},
    {"kw": "黄檗禅师传心法要", "classic": "chuanxinfayao"},
    {"kw": "信心铭", "classic": "xinxinming"}
]

results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    for t in targets:
        kw = t["kw"]
        url = f"https://book.douban.com/subject_search?search_text={kw}&cat=1001"
        print(f"正在搜索书籍: {kw} ...")
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        book_info = page.evaluate("""() => {
            const first = document.querySelector('.item-root a.title-text');
            if (first) {
                return {
                    title: first.innerText.trim(),
                    url: first.href
                };
            }
            return null;
        }""")
        
        if book_info:
            print(f"  找到书籍: {book_info['title']} -> {book_info['url']}")
            # 提取 subject_id
            sid = [x for x in book_info["url"].split("/") if x.isdigit()][0]
            book_info["subject_id"] = sid
            
            # 访问书评列表页面提取前两篇热门书评
            rev_url = f"https://book.douban.com/subject/{sid}/reviews"
            page.goto(rev_url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)
            
            reviews = page.evaluate("""() => {
                const list = [];
                const items = document.querySelectorAll('.review-item');
                for (const item of items) {
                    const h2a = item.querySelector('h2 a');
                    const name = item.querySelector('.name');
                    if (h2a) {
                        const href = h2a.href;
                        const rid = href.split('/').filter(Boolean).pop();
                        list.push({
                            review_id: rid,
                            title: h2a.innerText.trim(),
                            author: name ? name.innerText.trim() : '',
                            url: href
                        });
                    }
                }
                return list.slice(0, 3);
            }""")
            book_info["reviews"] = reviews
            print(f"  抓取到热门书评: {len(reviews)} 篇")
            for rv in reviews:
                print(f"    - [{rv['review_id']}] {rv['author']}: {rv['title']}")
                
            results[t["classic"]] = book_info
            
    browser.close()

with open(os.path.join(CUR_DIR, "douban_books_exact.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n结果保存至 douban_books_exact.json！")
