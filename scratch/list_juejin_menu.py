# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        ctx.add_cookies(json.load(f))
    page = ctx.new_page()
    page.goto("https://juejin.cn/creator/content/column", timeout=25000)
    time.sleep(3)
    links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a, div[class*="menu"], li')).map(el => ({
            text: el.innerText.trim(),
            href: el.getAttribute('href'),
            class: el.className
        })).filter(x => x.text && x.text.includes('文章管理'));
    }""")
    print("Links with 文章管理:", json.dumps(links, ensure_ascii=False, indent=2))
    
    # 直接在 DOM 中执行 click 事件
    clicked = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('*'));
        const target = els.find(el => el.innerText && el.innerText.trim() === '文章管理' && el.children.length === 0);
        if (target) {
            target.click();
            return true;
        }
        return false;
    }""")
    print("DOM clicked target:", clicked)
    time.sleep(3)
    print("URL after DOM click:", page.url)
    page.screenshot(path="scratch/juejin_after_dom_click.png")
    
    # 查找文章列表中的项
    items = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/post/"]')).map(a => ({
            title: a.innerText.trim(),
            href: a.href
        }));
    }""")
    print("Article items found:", json.dumps(items, ensure_ascii=False, indent=2))
    ctx.close()
