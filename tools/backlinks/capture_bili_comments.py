# -*- coding: utf-8 -*-
import os, sys, time, json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

targets = [
    {"bvid": "BV1mH4y1c7kP", "name": "xinjing_195w", "shot": "bili_comment_316793416176.png"},
    {"bvid": "BV14w4m1d7Kv", "name": "jingang_55w", "shot": "bili_comment_316793521696.png"}
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 960},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    )
    ctx.add_cookies(cookies)
    
    for t in targets:
        page = ctx.new_page()
        url = f"https://www.bilibili.com/video/{t['bvid']}"
        print(f"正在加载 {url} ...")
        page.goto(url, wait_until="networkidle", timeout=45000)
        page.evaluate("window.scrollBy(0, 650)")
        time.sleep(3)
        page.evaluate("window.scrollBy(0, 300)")
        time.sleep(2)
        
        shot_path = os.path.join(CUR_DIR, t["shot"])
        page.screenshot(path=shot_path, full_page=False)
        print(f"✅ 截图保存至: {shot_path}")
        page.close()
        
    browser.close()

print("所有截图已捕获！")
