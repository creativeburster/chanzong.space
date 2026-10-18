# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"
URL = "https://www.bilibili.com/video/BV1XK4y1X7FF"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent=REAL_UA)
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollTo(0, 600)")
    time.sleep(3)
    page.screenshot(path="tools/backlinks/bilibili_comment_316793129088_live.png")
    print("视频评论区截图已保存: tools/backlinks/bilibili_comment_316793129088_live.png")
    browser.close()
