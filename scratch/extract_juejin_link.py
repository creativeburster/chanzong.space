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
    page.goto("https://juejin.cn/creator/content/column?type=article", timeout=25000)
    time.sleep(3)
    page.screenshot(path="scratch/juejin_manage_live.png")
    
    # 查找文章链接
    links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/post/"]')).map(a => ({
            title: a.innerText.trim(),
            href: a.href
        }));
    }""")
    print("Found juejin post links:", json.dumps(links, ensure_ascii=False, indent=2))
    
    if links:
        live_url = links[0]["href"]
        print("🎉🎉 [稀土掘金] 成功获取最新文章落地页:", live_url)
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
        print("✅ 掘金台账入库成功:", rec_id)
    ctx.close()
