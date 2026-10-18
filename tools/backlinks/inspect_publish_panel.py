# -*- coding: utf-8 -*-
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

COOKIE_PATH = "tools/backlinks/.browser_profile/zhihu_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

url = "https://zhuanlan.zhihu.com/p/2080660444801511629/edit"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    # 监听网络请求
    failed_reqs = []
    def on_response(response):
        if response.status >= 400:
            failed_reqs.append(f"{response.status} {response.url}")
            try:
                text = response.text()[:200]
                failed_reqs.append(f"  Body: {text}")
            except Exception:
                pass
    page.on("response", on_response)
    
    page.goto(url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 检查发布设置
    # 知乎发布设置里是否必须选择某个单选框？比如“创作声明”或者“内容来源”？
    # 让我们看看页面上的所有 input / select / 单选框
    form_elements = page.evaluate("""() => {
        const selects = Array.from(document.querySelectorAll('.PublishPanel div, .PublishPanel select, .PublishPanel span'));
        return selects.map(s => s.innerText.trim()).filter(t => t.length > 0 && t.length < 50);
    }""")
    print("Publish Panel Texts:", form_elements[:15])
    
    browser.close()
