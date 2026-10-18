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
    
    # 监听网络请求
    reqs = []
    page.on("request", lambda r: reqs.append(f"{r.method} {r.url}") if "comment" in r.url or "create" in r.url or "add" in r.url or "aj" in r.url else None)
    page.on("console", lambda msg: print("CONSOLE:", msg.text))
    
    page.goto("https://weibo.com/2156211775/Rh5wjdjgi", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 600)")
    time.sleep(1)
    
    # 触发原生输入
    page.evaluate("""() => {
        const ta = document.querySelector('textarea');
        ta.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(ta, '三心不可得，正是直破凡夫的时间执念。若能体会到应无所住的灵动，当下便不再受境风牵引。我们在做禅宗知识库(chanzong.space)的文献拓扑时，也深有同感！');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
    }""")
    time.sleep(1)
    
    # 查找所有包含评论文字的按钮
    pub_btns = page.locator('button:has-text("评论")').all()
    print("Found comment buttons count:", len(pub_btns))
    for i, b in enumerate(pub_btns):
        print(f"Button {i}: text='{b.inner_text()}', class='{b.get_attribute('class')}', is_visible={b.is_visible()}")
        # 尝试点击它
        try:
            b.scroll_into_view_if_needed()
            b.click(force=True)
            print(f"Clicked button {i}!")
            time.sleep(2)
        except Exception as e:
            print(f"Error clicking button {i}: {e}")
            
    print("Captured requests:", reqs)
    page.screenshot(path="tools/backlinks/inspect_comment_click.png")
    browser.close()
