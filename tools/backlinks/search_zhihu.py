# -*- coding: utf-8 -*-
"""
知乎关键词高价值问题搜索器
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "zhihu_cookie.json")

def search_questions(keyword: str, max_results: int = 5):
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        encoded = urllib.parse.quote(keyword)
        search_url = f"https://www.zhihu.com/search?type=content&q={encoded}"
        print(f"🔍 正在知乎检索关键词: 【{keyword}】...")
        page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        
        raw_items = page.evaluate("""() => {
            const results = [];
            const cards = document.querySelectorAll('.SearchResult-Card, .ContentItem, .List-item');
            for (const card of cards) {
                const titleEl = card.querySelector('h2 a, .ContentItem-title a, a[href*="/question/"]');
                if (titleEl) {
                    results.push({
                        text: titleEl.innerText.trim(),
                        href: titleEl.href
                    });
                }
            }
            return results;
        }""")
        
        candidates = []
        seen = set()
        for it in raw_items:
            href = it.get("href", "")
            text = it.get("text", "")
            if "/question/" not in href or not text:
                continue
            q_id = href.split("/question/")[1].split("/")[0].split("?")[0]
            clean_url = f"https://www.zhihu.com/question/{q_id}"
            if clean_url not in seen and len(text) > 4:
                seen.add(clean_url)
                candidates.append({"title": text, "url": clean_url, "qid": q_id})
                
        print(f"✨ 关键词【{keyword}】筛选出 {len(candidates)} 个候选问题：")
        for idx, c in enumerate(candidates[:max_results]):
            print(f"  [{idx+1}] {c['title']}\n      链接: {c['url']}")
            
        browser.close()
        return candidates[:max_results]

if __name__ == "__main__":
    kw = sys.argv[1] if len(sys.argv) > 1 else "达摩血脉论 见性"
    search_questions(kw)
