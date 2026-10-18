# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

USER_DATA_DIR = os.path.abspath("tools/backlinks/.browser_profile")

with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir=USER_DATA_DIR,
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = browser.new_page()
    print("Navigating to GitCode...")
    page.goto("https://gitcode.com", timeout=30000)
    time.sleep(4)
    print("GitCode page title:", page.title())
    print("GitCode page URL:", page.url)
    page.screenshot(path="scratch/gitcode_probe.png")
    
    # Check if logged in or has login button
    login_btn = page.query_selector("text='登录'")
    user_avatar = page.query_selector(".avatar, [class*='avatar'], [class*='user']")
    print("Login button found:", bool(login_btn))
    print("User avatar found:", bool(user_avatar))
    browser.close()
