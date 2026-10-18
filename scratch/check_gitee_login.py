# -*- coding: utf-8 -*-
import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://gitee.com/login')
    page.wait_for_timeout(2000)
    print('Title:', page.title())
    links = page.locator('a').all()
    for l in links:
        href = l.get_attribute('href') or ''
        if 'oauth' in href.lower() or 'auth' in href.lower() or 'github' in href.lower():
            print('OAuth link:', l.text_content().strip(), href)
    page.screenshot(path='scratch/gitee_login.png')
    browser.close()
