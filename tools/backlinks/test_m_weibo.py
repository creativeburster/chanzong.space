# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
# 针对 m.weibo.cn 注入 cookie
cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.cn", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={"width": 414, "height": 896},
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    # 打开加州荷风的博文 (mid: 5340727993172310, bid: Rh5wjdjgi)
    url = "https://m.weibo.cn/detail/5340727993172310"
    print("Navigating to m.weibo.cn:", url)
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("Page Title:", page.title())
    page.screenshot(path="tools/backlinks/m_weibo_view.png")
    
    # 查找评论按钮与输入框
    comment_bar = page.locator('.m-btn-box, .m-box-col:has-text("评论"), a:has-text("评论")').first
    print("Comment bar visible:", comment_bar.is_visible())
    
    browser.close()
