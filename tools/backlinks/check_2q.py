# -*- coding: utf-8 -*-
import sys, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page()
    for qid in ['31872120', '27156107']:
        page.goto(f'https://www.zhihu.com/question/{qid}', wait_until='domcontentloaded')
        time.sleep(2)
        link = page.evaluate('() => document.querySelector(".AnswerItem a[href*=\\"/answer/\\"]")?.href')
        print(qid, '->', link, 'title:', page.title()[:30])
    browser.close()
