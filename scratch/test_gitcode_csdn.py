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
    page.goto("https://gitcode.com", timeout=30000)
    time.sleep(3)
    
    # Click the CSDN login icon
    # It's an img or svg or icon with csdn
    csdn_btn = page.query_selector("img[src*='csdn'], [title*='CSDN'], svg[class*='csdn'], a[href*='csdn']")
    if not csdn_btn:
        # Check all icons in the popup
        icons = page.query_selector_all("div[class*='other'] span, div[class*='login'] img, .login-type-box img")
        print("Found other login icons:", len(icons))
        for idx, ic in enumerate(icons):
            src = ic.get_attribute("src") or ""
            print(f"Icon {idx}: {src}")
            if "csdn" in src.lower() or idx == 1: # The second one is CSDN (C logo)
                csdn_btn = ic
                break
                
    if csdn_btn:
        print("Clicking CSDN login...")
        csdn_btn.click()
        time.sleep(5)
        print("After click URL:", page.url)
        print("After click Title:", page.title())
        page.screenshot(path="scratch/gitcode_after_csdn.png")
    else:
        print("CSDN icon not found directly")
        
    browser.close()
