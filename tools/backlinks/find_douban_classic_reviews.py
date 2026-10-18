# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

cur_dir = os.path.dirname(os.path.abspath(__file__))
cookie_file = os.path.join(cur_dir, "douban_cookies.json")

with open(cookie_file, "r", encoding="utf-8") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    # 访问金刚经读书页面查找长篇书评
    # 经典书籍金刚经: 1077586, 六祖坛经: 1014909, 大乘起信论: 5214628
    books = [
        {"id": "1077586", "name": "金刚经"},
        {"id": "1014909", "name": "六祖坛经"},
        {"id": "5214628", "name": "大乘起信论"}
    ]
    
    found_reviews = []
    for b in books:
        url = f"https://book.douban.com/subject/{b['id']}/reviews"
        print(f"正在抓取【{b['name']}】热门书评: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(2)
        
        revs = page.evaluate("""() => {
            const list = Array.from(document.querySelectorAll('.review-item'));
            return list.slice(0, 3).map(item => {
                const titleA = item.querySelector('h2 a');
                const authorA = item.querySelector('.name');
                return {
                    title: titleA ? titleA.innerText.trim() : '',
                    url: titleA ? titleA.href : '',
                    author: authorA ? authorA.innerText.trim() : ''
                };
            });
        }""")
        for r in revs:
            if r['url'] and '1780830' not in r['url']: # 排除自己发布的
                found_reviews.append({"book": b['name'], **r})
                print(f"  + [{b['name']}] 《{r['title']}》 by {r['author']} -> {r['url']}")
        time.sleep(1)
        
    with open("tools/backlinks/douban_real_classic_reviews.json", "w", encoding="utf-8") as f:
        json.dump(found_reviews, f, ensure_ascii=False, indent=2)
    print(f"✅ 成功找到 {len(found_reviews)} 篇外部优质经典书评！")
    browser.close()
