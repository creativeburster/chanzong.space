# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"
URL = "https://www.bilibili.com/opus/1245624353612103700"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent=REAL_UA)
    
    print(f"正在以游客身份访问 B 站动态独立页面: {URL}")
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    page.screenshot(path="tools/backlinks/bilibili_opus_1245624353612103700_live.png")
    print("截图已保存至: tools/backlinks/bilibili_opus_1245624353612103700_live.png")
    
    # 检查内容中的链接是否为超链接
    link_info = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('.opus-module-content a, .bili-rich-text a, a[href*="chanzong"]')).map(a => ({
            text: a.innerText,
            href: a.href,
            outerHTML: a.outerHTML
        }));
        return links;
    }""")
    print("页面中的链接解析情况:", link_info)
    browser.close()
