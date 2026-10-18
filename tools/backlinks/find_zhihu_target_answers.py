# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "zhihu_cookie.json")
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    c_dict = json.load(f)

cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in c_dict.items()]

keywords = ["大乘起信论 一心二门", "即心即佛 传心法要", "至道无难唯嫌拣择 信心铭"]
results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    for kw in keywords:
        url = f"https://www.zhihu.com/search?type=content&q={kw}"
        print(f"正在搜索知乎问答: {kw} ...")
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        cards = page.evaluate("""() => {
            const list = [];
            const items = document.querySelectorAll('.SearchResult-Card, .ContentItem');
            for (const it of items) {
                const titleEl = it.querySelector('h2 a, .ContentItem-title a');
                const authorEl = it.querySelector('.AuthorInfo-name, .UserLink-link');
                const linkEl = it.querySelector('meta[itemprop="url"], a[href*="/question/"]');
                let href = '';
                if (titleEl && titleEl.href) href = titleEl.href;
                else if (linkEl && linkEl.href) href = linkEl.href;
                
                if (href && href.includes('/answer/')) {
                    list.push({
                        title: titleEl ? titleEl.innerText.trim() : '',
                        author: authorEl ? authorEl.innerText.trim() : '知乎答主',
                        url: href
                    });
                }
            }
            return list.slice(0, 3);
        }""")
        results[kw] = cards
        print(f"  抓取到回答: {len(cards)} 个")
        for c in cards:
            print(f"    - {c['author']}: {c['title']} ({c['url']})")
            
    browser.close()

with open(os.path.join(CUR_DIR, "zhihu_comment_targets.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n知乎目标回答已保存至 zhihu_comment_targets.json！")
