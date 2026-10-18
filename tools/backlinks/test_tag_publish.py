# -*- coding: utf-8 -*-
import json
import time
from playwright.sync_api import sync_playwright

with open('tools/backlinks/.browser_profile/juejin_cookie.json', 'r', encoding='utf-8') as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto('https://juejin.cn/editor/drafts/7683154982741590068', wait_until='domcontentloaded')
    time.sleep(3)
    
    # 1. 点击右上角发布按钮
    page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '发布');
        if (btn) btn.click();
    }""")
    time.sleep(2)
    
    # 2. 选分类【前端】
    page.evaluate("""() => {
        const items = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="item"]'));
        const fe = items.find(el => (el.innerText || '').trim() === '前端');
        if (fe) fe.click();
    }""")
    time.sleep(1)
    
    # 3. 物理点击标签占位框 (x=730, y=318)
    print("正在点击标签框...")
    page.mouse.click(730, 318)
    time.sleep(1.5)
    
    # 4. 在弹出的下拉列表点击【前端】标签
    print("正在点击下拉列表中的【前端】标签...")
    clicked_tag = page.evaluate("""() => {
        const options = Array.from(document.querySelectorAll('.byte-select-option, [class*="option"], [class*="dropdown"] li, [class*="dropdown"] span'));
        const tag = options.find(el => (el.innerText || '').trim() === '前端');
        if (tag) {
            tag.click();
            return { clicked: true, text: tag.innerText };
        }
        return { clicked: false, total: options.length };
    }""")
    print("点击标签结果:", clicked_tag)
    time.sleep(1)
    
    page.screenshot(path='tools/backlinks/juejin_tag_selected_test.png')
    
    # 5. 点击【确定并发布】
    print("点击【确定并发布】...")
    page.evaluate("""() => {
        const pub = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '确定并发布');
        if (pub) pub.click();
    }""")
    time.sleep(8)
    print("发布后 URL:", page.url)
    page.screenshot(path='tools/backlinks/juejin_after_submit_test.png')
    
    browser.close()
