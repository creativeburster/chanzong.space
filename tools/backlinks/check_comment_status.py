# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir="tools/backlinks/.browser_profile",
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://weibo.com/2156211775/Rh5wjdjgi", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 800)")
    time.sleep(2)
    has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
    has_user = page.evaluate("() => document.body.innerText.includes('禅宗空间')")
    print("Found '三心不可得':", has_text)
    print("Found '禅宗空间':", has_user)
    ctx.close()
