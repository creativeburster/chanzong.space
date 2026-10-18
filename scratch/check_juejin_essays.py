# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context
from tracker import add_backlink

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        ctx.add_cookies(json.load(f))
    page = ctx.new_page()
    page.goto("https://juejin.cn/creator/content/article/essays?status=all", timeout=25000)
    time.sleep(3)
    page.screenshot(path="scratch/juejin_essays_all.png")
    
    rows = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/post/"]')).map(a => ({
            title: a.innerText.trim(),
            href: a.href
        }));
    }""")
    print("Found essay links:", json.dumps(rows[:5], ensure_ascii=False, indent=2))
    
    # 查找审核中的草稿/文章
    audit_tab = page.query_selector("div:has-text('审核中'), span:has-text('审核中')")
    if audit_tab:
        audit_tab.click()
        time.sleep(2)
        page.screenshot(path="scratch/juejin_essays_audit.png")
        audit_links = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href*="/post/"], .title, tr, div[class*="item"]')).map(a => ({
                text: a.innerText.trim(),
                href: a.getAttribute('href') || (a.querySelector('a') ? a.querySelector('a').href : null)
            })).filter(x => x.text && x.text.includes('大规模古典哲学'));
        }""")
        print("Audit articles:", json.dumps(audit_links, ensure_ascii=False, indent=2))
    ctx.close()
