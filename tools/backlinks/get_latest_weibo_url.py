# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    # 查找第一条微博的时间链接
    time_link = page.evaluate("""() => {
        const timeEl = document.querySelector('a.head-info_time_6s0Kn, a[class*="time"], a[href*="/detail/"], header a[title*="202"]');
        if (timeEl) return { href: timeEl.href, text: timeEl.innerText };
        // 尝试找包含 detail 或 status 的 a 标签
        const allA = Array.from(document.querySelectorAll('a[href*="/detail/"], a[href*="/status/"]'));
        if (allA.length > 0) return { href: allA[0].href, text: allA[0].innerText };
        return null;
    }""")
    print("Time Link Found:", time_link)
    browser.close()
