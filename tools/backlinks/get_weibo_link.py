# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context()
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=25000)
    time.sleep(4)
    
    # 提取时间链接与个人主页
    res = page.evaluate("""() => {
        // 第一篇 Feed 的时间链接
        const timeLink = document.querySelector('header a[class*="time"], .head-info_time_6VTlo a, a[href*="/status/"], a[href*="/detail/"]');
        const userLink = document.querySelector('header a[class*="name"], .head-info_name_36r12 a, a[href*="/u/"]');
        return {
            timeLink: timeLink ? timeLink.href : null,
            userLink: userLink ? userLink.href : null
        };
    }""")
    print("EXTRACTED:", json.dumps(res, ensure_ascii=False))
    
    # 如果找到了 userLink，进入个人主页抓取第一条微博的固定 URL
    if res.get("userLink"):
        page.goto(res["userLink"], wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/weibo_profile.png")
        first_status = page.evaluate("""() => {
            const link = document.querySelector('a[href*="/status/"], a[href*="/detail/"], header a[class*="time"]');
            return link ? link.href : window.location.href;
        }""")
        print("PERMANENT_STATUS_URL:", first_status)
    browser.close()
