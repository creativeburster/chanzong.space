# -*- coding: utf-8 -*-
import os, sys, json, time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

cookie_path = os.path.join(os.path.dirname(__file__), ".browser_profile", "weibo_cookie.json")
with open(cookie_path, "r", encoding="utf-8") as f:
    c_dict = json.load(f)

cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in c_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    textarea = page.query_selector("textarea")
    print(f"微博加载 URL: {page.url} | 发帖框找到: {textarea is not None}")
    page.screenshot(path="tools/backlinks/weibo_session_check.png")
    browser.close()
