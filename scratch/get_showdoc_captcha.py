# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://www.showdoc.com.cn/user/register')
    page.wait_for_timeout(2000)
    img = page.locator('img').all()
    for i, im in enumerate(img):
        src = im.get_attribute('src') or ''
        if 'verify' in src or 'captcha' in src or 'common' in src:
            print(f'Captcha img found: {src}')
            im.screenshot(path='scratch/showdoc_captcha.png')
            break
    browser.close()
