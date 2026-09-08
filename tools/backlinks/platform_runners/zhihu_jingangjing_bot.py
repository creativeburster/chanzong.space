# -*- coding: utf-8 -*-
"""
知乎《金刚经》专题高价值问答搜索与自动化发布机器人
自动搜索高关注度《金刚经》问题，按顺序生成禅宗宗门见地的高水准解答并发布，留存 chanzong.space 权威外链。
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
BACKLINKS_DIR = os.path.dirname(CUR_DIR)
sys.path.append(BACKLINKS_DIR)
from tracker import add_backlink

COOKIE_PATH = os.path.join(BACKLINKS_DIR, ".browser_profile", "zhihu_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

def search_jingangjing_questions(limit=5):
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        context.add_cookies(cookies)
        page = context.new_page()
        
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        # 搜索“金刚经 核心”或“金刚经 应无所住”
        search_query = "金刚经"
        encoded = urllib.parse.quote(search_query)
        search_url = f"https://www.zhihu.com/search?type=content&q={encoded}"
        print(f"正在搜索知乎问题: {search_query}...")
        page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
        time.sleep(4)
        
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
                
        print(f"共筛选出 {len(candidates)} 个候选问题：")
        for idx, c in enumerate(candidates[:limit]):
            print(f"  [{idx+1}] {c['title']} ({c['url']})")
            
        browser.close()
        return candidates[:limit]

if __name__ == "__main__":
    search_jingangjing_questions()
