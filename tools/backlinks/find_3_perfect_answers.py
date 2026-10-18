# -*- coding: utf-8 -*-
"""
严谨寻找 3 个真正切题的、他人（非 i禅修）的优质高赞禅宗回答：
1. 六祖坛经/本来无一物
2. 金刚经/应无所住
3. 心经/色即是空
"""
import os, sys, time
from urllib.parse import quote
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

SEARCH_QUERIES = [
    {"query": "六祖坛经 讲解", "classic": "tanjing", "tag": "六祖坛经"},
    {"query": "金刚经 核心思想", "classic": "jingangjing", "tag": "金刚经"},
    {"query": "心经 色即是空", "classic": "xinjing", "tag": "心经"}
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    candidates = []
    
    for sq in SEARCH_QUERIES:
        search_url = f"https://www.zhihu.com/search?type=content&q={quote(sq['query'])}"
        print(f"\n正在搜索: {sq['query']} -> {search_url}")
        page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 提取搜索结果中的所有卡片
        results = page.evaluate("""() => {
            const list = [];
            // 找到所有回答卡片
            const cards = document.querySelectorAll('.SearchResult-Card, .ContentItem');
            for (let card of cards) {
                const titleEl = card.querySelector('.ContentItem-title a, h2 a');
                const authorEl = card.querySelector('.AuthorInfo-name, .UserLink-link');
                const snippetEl = card.querySelector('.RichContent-inner, .SearchItem-snippet');
                const linkEl = card.querySelector('a[href*="/answer/"]');
                
                if (titleEl && linkEl) {
                    const title = titleEl.innerText.trim();
                    const author = authorEl ? authorEl.innerText.trim() : '知乎答主';
                    const link = linkEl.href;
                    const snippet = snippetEl ? snippetEl.innerText.trim().slice(0, 100) : '';
                    list.push({ title, author, link, snippet });
                }
            }
            return list;
        }""")
        
        print(f"找到候选结果数量: {len(results)}")
        for r in results:
            # 过滤掉 i禅修 自己的回答，并且标题必须切题
            if "i禅修" not in r["author"] and any(k in r["title"] for k in ["坛经", "六祖", "金刚经", "心经", "佛", "禅"]):
                print(f"  匹配成功! 题目: {r['title']} | 答主: {r['author']} | 链接: {r['link']}")
                candidates.append({
                    "classic": sq["classic"],
                    "tag": sq["tag"],
                    "question_title": r["title"],
                    "author": r["author"],
                    "answer_url": r["link"],
                    "snippet": r["snippet"]
                })
                break
                
    print("\n最终选定的 3 个真实他人回答:")
    print(json.dumps(candidates, ensure_ascii=False, indent=2))
    
    with open("tools/backlinks/target_3_real_answers.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
        
    ctx.close()
