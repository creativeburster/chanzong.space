# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

CUR_DIR = 'tools/backlinks'
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    page = ctx.new_page()
    page.goto('https://creator.xiaohongshu.com/login', timeout=30000)
    time.sleep(3)
    
    # 查找并点击右上角二维码图标
    # 在 1440x900 下，刚才截图里右上角红黑相间的小二维码图标在 login 卡片右上角
    # 我们点击 (1240, 365)
    page.mouse.click(1240, 365)
    time.sleep(2)
    page.screenshot(path='tools/backlinks/xhs_qr_screen.png')
    print('SCREENSHOT SAVED')
    ctx.close()
