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
    
    # 尝试在页面内发起 fetch（form-urlencoded 格式）
    res = page.evaluate("""async () => {
        const xsrf = (document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '';
        const params = new URLSearchParams();
        params.append('id', '5340727993172310');
        params.append('comment', '三心不可得，正是直破凡夫的时间执念。若能体会到应无所住的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)文献拓扑时也深有同感！');
        params.append('pic_id', '');
        
        try {
            const r = await fetch('/ajax/comments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-xsrf-token': decodeURIComponent(xsrf)
                },
                body: params.toString()
            });
            const text = await r.text();
            return { status: r.status, body: text };
        } catch (e) {
            return { error: e.toString() };
        }
    }""")
    print("Fetch result (form-urlencoded):", json.dumps(res, ensure_ascii=False, indent=2))
    
    # 刷新检查
    time.sleep(2)
    page.reload(wait_until="domcontentloaded")
    time.sleep(3)
    page.evaluate("window.scrollBy(0, 700)")
    time.sleep(1)
    has_text = page.evaluate("() => document.body.innerText.includes('三心不可得')")
    print("Comment on page after urlencoded?", has_text)
    
    browser.close()
