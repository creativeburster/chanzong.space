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
    
    # 找到个人主页链接
    my_profile_url = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a'));
        const myNameLink = links.find(a => a.innerText.includes("禅宗空间") || a.innerText.includes("chanzong"));
        const uLinks = links.map(a => a.href).filter(h => h.includes("weibo.com/u/"));
        return {
            nameLink: myNameLink ? myNameLink.href : null,
            uLinks: uLinks
        };
    }""")
    print("My Profile Info:", my_profile_url)
    
    target = None
    if my_profile_url.get("nameLink"):
        target = my_profile_url["nameLink"]
    elif my_profile_url.get("uLinks"):
        target = my_profile_url["uLinks"][0]
        
    if target:
        print(f"进入个人主页: {target}")
        page.goto(target, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/weibo_my_profile.png")
        latest_post = page.evaluate("""() => {
            const timeLinks = Array.from(document.querySelectorAll('header a, .head-info_time_6s0Kn, a[href*="/detail/"], a[href*="/status/"]'));
            for (const l of timeLinks) {
                if (l.href.includes("/detail/") || l.href.includes("/status/") || /\/\d{8,}\/[a-zA-Z0-9]+/.test(l.href)) {
                    return l.href;
                }
            }
            return window.location.href;
        }""")
        print("最新博文直达链接:", latest_post)
        
    browser.close()
