# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com/2156211775/Rh5wjdjgi", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 600)")
    time.sleep(1)
    
    # 点击底部的【评论】按钮展开评论输入框
    # 在微博博文卡片底部通常有：转发、评论、赞
    # 点击那个评论图标或按钮，会激活/聚焦评论框
    card_comment_btn = page.query_selector('.toolbar_item_1Kcgh:has-text("评论"), .woo-box-flex:has-text("评论")')
    if card_comment_btn:
        print("Clicking card comment icon...")
        page.evaluate("el => el.click()", card_comment_btn)
        time.sleep(1)
        
    textarea = page.query_selector('textarea')
    if textarea:
        print("Focusing textarea...")
        textarea.focus()
        time.sleep(0.5)
        # 用 evaluate 注入值并派发 input 事件
        page.evaluate("""() => {
            const ta = document.querySelector('textarea');
            ta.value = "三心不可得，正是直破凡夫的时间执念。若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)的文献拓扑时，也深有同感！";
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
        }""")
        time.sleep(1)
        
    page.screenshot(path="tools/backlinks/textarea_dispatched.png")
    
    # 检查按钮状态
    btn_status = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const pub = btns.find(b => b.innerText.includes("评论") || b.innerText.includes("发送"));
        return {
            text: pub ? pub.innerText : null,
            disabled: pub ? pub.disabled : null,
            className: pub ? pub.className : null
        };
    }""")
    print("Btn status after dispatch:", btn_status)
    
    if btn_status.get("disabled") is False:
        print("Button is ENABLED! Clicking...")
        pub = page.locator('button:has-text("评论")').last
        pub.click()
        time.sleep(4)
        page.screenshot(path="tools/backlinks/after_real_comment_click.png")
        has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
        print("Success on page?", has_text)
        
    browser.close()
