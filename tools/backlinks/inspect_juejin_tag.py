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
    page.goto('https://juejin.cn/editor/drafts/new', wait_until='domcontentloaded')
    time.sleep(3)
    
    # 填标题使得发布按钮激活
    page.locator('input.title-input').fill('测试文章标题')
    time.sleep(1)
    
    # 点击发布按钮
    page.locator('button:has-text("发布")').first.click()
    time.sleep(2)
    
    # 打印包含“标签”的所有元素
    res = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('*'));
        return els.filter(el => (el.innerText || '').includes('请搜索添加标签') && el.children.length === 0).map(el => ({
            tag: el.tagName,
            cls: (el.className || '').toString(),
            html: el.outerHTML.slice(0, 150),
            parentTag: el.parentElement ? el.parentElement.tagName : '',
            parentCls: el.parentElement ? (el.parentElement.className || '').toString() : ''
        }));
    }""")
    print("标签叶子元素:", json.dumps(res, ensure_ascii=False, indent=2))
    
    # 尝试点击这个元素并查看是否有输入框或下拉列表出现
    page.evaluate("""() => {
        const target = Array.from(document.querySelectorAll('*')).find(el => (el.innerText || '').includes('请搜索添加标签'));
        if (target) target.click();
    }""")
    time.sleep(2)
    
    after_click = page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
            tag: i.tagName,
            type: i.type,
            placeholder: i.placeholder,
            cls: i.className
        }));
        const popovers = Array.from(document.querySelectorAll('.byte-select-dropdown, .popover, [class*="dropdown"], [class*="suggest"]')).map(d => ({
            cls: d.className,
            text: d.innerText.slice(0, 100)
        }));
        return { inputs, popovers };
    }""")
    print("点击后弹出的输入框与下拉列表:", json.dumps(after_click, ensure_ascii=False, indent=2))
    
    browser.close()
