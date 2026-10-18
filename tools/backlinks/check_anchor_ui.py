# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent=REAL_UA)
    page.goto("https://book.douban.com/review/17808304/", wait_until="domcontentloaded", timeout=30000)
    time.sleep(2)
    # 滚动到末尾
    page.evaluate("window.scrollTo(0, 1000)")
    time.sleep(1)
    page.screenshot(path="tools/backlinks/douban_anchor_visible.png")
    
    # 获取那个 a 标签的文本和外部呈现
    info = page.evaluate("""() => {
        const a = document.querySelector('.review-content a.link, a[href*="chanzong"]');
        return a ? {
            text: a.innerText,
            href: a.href,
            color: window.getComputedStyle(a).color,
            textDecoration: window.getComputedStyle(a).textDecoration
        } : null;
    }""")
    print("锚文本渲染样式:", info)
    browser.close()
