# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

profile_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.browser_profile')

queries = ["达摩祖师 二入四行", "禅宗 开悟 本来面目", "大乘起信论 真如"]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel='msedge',
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    all_res = []
    seen = set()
    
    for q in queries:
        search_url = f"https://www.zhihu.com/search?type=content&q={q}"
        print(f"正在搜索知乎: {q}")
        page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        
        links = page.evaluate('''() => {
            const items = Array.from(document.querySelectorAll('.SearchResult-Card, .ContentItem'));
            const list = [];
            for (const item of items) {
                const a = item.querySelector('a[href*="/question/"][href*="/answer/"]');
                const titleEl = item.querySelector('h2 a, .ContentItem-title a');
                if (a && titleEl) {
                    list.push({
                        title: titleEl.innerText.trim(),
                        url: a.href.split('?')[0]
                    });
                }
            }
            return list;
        }''')
        for item in links:
            if item['url'] not in seen and '/answer/' in item['url']:
                seen.add(item['url'])
                all_res.append(item)
                print(f"  + {item['title']} -> {item['url']}")
        time.sleep(2)
        
    with open('tools/backlinks/zhihu_qa_found.json', 'w', encoding='utf-8') as f:
        json.dump(all_res, f, ensure_ascii=False, indent=2)
    print(f"✅ 全部检索完成，共保存 {len(all_res)} 个切题回答！")
    ctx.close()
