# -*- coding: utf-8 -*-
"""
探测微博禅宗/佛学相关热门博文，用于高质量互动评论
"""
import os
import sys
import json
import time
import urllib.parse
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

def find_target_weibo_posts():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
    keywords = ["金刚经", "六祖坛经", "心经 色即是空", "禅宗 见性", "修行 狂心若歇"]
    found_posts = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        for kw in keywords:
            encoded_kw = urllib.parse.quote(kw)
            search_url = f"https://s.weibo.com/weibo?q={encoded_kw}"
            print(f"搜索微博: {kw} -> {search_url}")
            page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(3)
            
            cards = page.evaluate("""() => {
                const results = [];
                const items = document.querySelectorAll('.card-wrap');
                for (const card of items) {
                    const contentEl = card.querySelector('.txt[node-type="feed_list_content"], p.txt');
                    const timeEl = card.querySelector('.from a[href*="weibo.com"], .from a[href*="/detail/"], .from a[href*="/status/"]');
                    const authorEl = card.querySelector('.name');
                    if (contentEl && timeEl && authorEl) {
                        const href = timeEl.href;
                        // 过滤掉自己的博文
                        if (!href.includes("6196660530")) {
                            results.push({
                                author: authorEl.innerText.trim(),
                                content: contentEl.innerText.trim().slice(0, 150),
                                href: href
                            });
                        }
                    }
                }
                return results;
            }""")
            
            if cards:
                # 选取第一条符合条件的
                chosen = cards[0]
                clean_url = chosen["href"].split("?")[0]
                if not any(p["url"] == clean_url for p in found_posts):
                    found_posts.append({
                        "keyword": kw,
                        "author": chosen["author"],
                        "content": chosen["content"],
                        "url": clean_url
                    })
                    print(f"  ✅ 锁定博文: 博主【{chosen['author']}】 - {clean_url}")
                    print(f"     正文摘要: {chosen['content'][:60]}...")
            time.sleep(2)
            if len(found_posts) >= 5:
                break
                
        browser.close()
        
    print(f"\n共找到 {len(found_posts)} 篇目标互动博文。")
    with open(os.path.join(CUR_DIR, "target_weibo_posts.json"), "w", encoding="utf-8") as f:
        json.dump(found_posts, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    find_target_weibo_posts()
