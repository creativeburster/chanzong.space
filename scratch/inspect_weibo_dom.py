# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "backlinks"))
from browser_driver import get_browser_context

p, ctx, page = get_browser_context(headless=True)
page.goto('https://weibo.com', wait_until='domcontentloaded')
time.sleep(4)

box = page.locator('text="有什么新鲜事想分享给大家？"').first
print('Found placeholder box:', box.is_visible())
box.click()
time.sleep(2)
page.screenshot(path='scratch/weibo_after_click_box.png')

ta = page.locator('textarea, div[contenteditable="true"]').all()
print('After click, input count:', len(ta))
for i, el in enumerate(ta):
    print(i, el.evaluate('e => ({tag: e.tagName, cls: e.className})'))

# 查找发送按钮
send_btn = page.locator('button:has-text("发送")').first
print('Send btn visible:', send_btn.is_visible())

ctx.close()
p.stop()
