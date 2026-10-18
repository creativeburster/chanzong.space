# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context
from tracker import add_backlink

ARTICLE_TITLE = "大规模古典哲学知识网络的前端渲染性能优化与 D3 防抖自平衡实践"

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        ctx.add_cookies(json.load(f))
    page = ctx.new_page()
    page.goto("https://juejin.cn/creator/content/article/essays?status=all", timeout=25000)
    time.sleep(3)
    
    res = page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('.item, .article-item, tr, div[class*="item"]'));
        for (const r of rows) {
            if (r.innerText && r.innerText.includes('大规模古典哲学')) {
                const links = Array.from(r.querySelectorAll('a')).map(a => a.href);
                return {
                    text: r.innerText.trim(),
                    links: links,
                    html: r.innerHTML
                };
            }
        }
        return null;
    }""")
    print("Found row:", json.dumps(res, ensure_ascii=False, indent=2))
    
    # 点击那个条目打开新页面
    first_item = page.query_selector("div:has-text('大规模古典哲学')")
    if first_item:
        with page.expect_popup() as popup_info:
            first_item.click()
        new_page = popup_info.value
        time.sleep(3)
        print("Popup URL:", new_page.url)
        live_url = new_page.url
        rec_id = add_backlink(
            platform="稀土掘金 (Juejin DA 86+)",
            region="国内大陆",
            category="技术专栏与开源展台",
            post_title=ARTICLE_TITLE,
            target_url="https://chanzong.space/graph",
            backlink_url=live_url,
            anchor_text="禅宗知识库 (chanzong.space) · 前端大规模图谱渲染优化",
            link_type="Dofollow",
            status="Live",
            notes="稀土掘金千字前端可视化专栏，深入探讨 D3.js 物理力导向算法、防抖自平衡调优与 Next.js 14 简繁双轨架构"
        )
        print(f"🎉 掘金已成功计入外链总账: {rec_id}！URL: {live_url}")
        new_page.close()
        
    ctx.close()
