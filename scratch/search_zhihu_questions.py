# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/zhihu_cookie.json", "r", encoding="utf-8") as f:
        raw = json.load(f)
    cookie_list = [{"name": k, "value": v, "domain": ".zhihu.com", "path": "/"} for k, v in raw.items()]
    ctx.add_cookies(cookie_list)
    page = ctx.new_page()
    
    # 搜索黄檗传心法要相关问题
    print("Searching Zhihu for '传心法要'...")
    page.goto("https://www.zhihu.com/search?type=content&q=%E4%BC%A0%E5%BF%83%E6%B3%95%E8%A6%81", timeout=25000)
    time.sleep(3)
    
    questions = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/question/"]')).map(a => ({
            title: a.innerText.trim(),
            href: a.href
        })).filter(q => q.title.length > 5);
    }""")
    print("Found questions for 传心法要:", json.dumps(questions[:5], ensure_ascii=False, indent=2))
    
    # 搜索六祖坛经相关问题
    print("Searching Zhihu for '六祖坛经 无念为宗'...")
    page.goto("https://www.zhihu.com/search?type=content&q=%E5%85%AD%E7%A5%96%E5%9D%9B%E7%BB%8F+%E6%97%A0%E5%BF%B5%E4%B8%BA%E5%AE%97", timeout=25000)
    time.sleep(3)
    
    questions2 = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/question/"]')).map(a => ({
            title: a.innerText.trim(),
            href: a.href
        })).filter(q => q.title.length > 5);
    }""")
    print("Found questions for 六祖坛经:", json.dumps(questions2[:5], ensure_ascii=False, indent=2))
    
    ctx.close()
