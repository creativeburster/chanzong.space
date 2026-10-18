# -*- coding: utf-8 -*-
"""
哔哩哔哩 (Bilibili DA 94+) 垂直高质量禅宗动态发布
主题：【平常是道 · 祖师家风】赵州和尚八十犹行脚与狗子佛性考
"""
import os
import sys
import time
import json
import requests
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COOKIE_FILE = os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json")
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

POST_TITLE = "【平常是道 · 祖师家风】赵州从谂禅师“狗子佛性”与八十犹行脚考"
TARGET_URL = "https://chanzong.space/classics/zhaozhoulu"

CONTENT = """【平常是道 · 祖师家风】
宗门常言：“赵州眼光，烁破四天下。”
唐代赵州从谂禅师六十一岁受具足戒，誓曰：“七岁童儿胜我者，我即学他；百岁老翁不及我者，我即教他。”直至八十岁方住持赵州观音院，行脚二十年，草鞋踏破无数。

有僧问赵州：“狗子还有佛性也无？”
师曰：“无。”
僧曰：“上至诸佛，下至蝼蚁，皆有佛性，狗子为什么却无？”
师曰：“为伊有业识在。”

这声“无”字，非有无对待之“无”，而是截断一切意根分别、剿绝一切知见妄想的金刚宝剑。无门慧开禅师赞曰：“参禅须透祖师关，妙悟要穷心路绝。将三百六十骨节、八万四千毫窍，通身起个疑团，参个‘无’字。”

八十犹行脚，平常是道场。在吃茶、洗钵的日用平常中，当下顿断狂心，便是祖师西来意。

📖 赵州从谂禅师《赵州录》白话今译、公案考释与法脉图谱：
https://chanzong.space/classics/zhaozhoulu"""

def publish_zhaozhou():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookie_list = json.load(f)
        
    REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(user_agent=REAL_UA)
        ctx.add_cookies(cookie_list)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问 B 站动态主页...")
        page.goto("https://t.bilibili.com", timeout=30000, wait_until="domcontentloaded")
        time.sleep(4)
        
        editor = page.query_selector(".bili-rich-textarea__inner, [contenteditable='true'], textarea")
        if not editor:
            print("未找到输入框")
            browser.close()
            return None
            
        print("2. 聚焦输入框并注入赵州录考据长文...")
        editor.click()
        time.sleep(0.5)
        page.keyboard.insert_text(CONTENT)
        time.sleep(1)
        
        print("3. 点击发布按钮...")
        pub_btn = page.query_selector(".bili-dyn-publishing__action button, .bili-dyn-publishing__action, button:has-text('发布')")
        if pub_btn:
            pub_btn.click()
            time.sleep(3)
            
            confirm_modal = page.query_selector("button:has-text('确认并发送'), button:has-text('确定')")
            if confirm_modal:
                print("发现规范确认弹窗，点击【确认并发送】...")
                confirm_modal.click()
                time.sleep(4)
                
        browser.close()
        
    print("4. 查询最新动态 ID...")
    time.sleep(3)
    cookie_dict = {c['name']: c['value'] for c in cookie_list}
    headers = {
        'User-Agent': REAL_UA,
        'Referer': 'https://space.bilibili.com/520219006/dynamic'
    }
    s = requests.Session()
    s.headers.update(headers)
    s.cookies.update(cookie_dict)
    r = s.get('https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=520219006', timeout=10)
    items = r.json().get('data', {}).get('items', [])
    if items:
        latest = items[0]
        dyn_id = latest.get('id_str')
        live_url = f"https://t.bilibili.com/{dyn_id}"
        print(f"🎉🎉 [Bilibili] 赵州录动态发布成功: {live_url}")
        
        rec_id = add_backlink(
            platform="哔哩哔哩 (Bilibili DA 94+)",
            region="华语/中国大陆",
            category="文化/宗教哲学/国学经典",
            post_title=POST_TITLE,
            target_url=TARGET_URL,
            backlink_url=live_url,
            anchor_text="赵州从谂禅师赵州录",
            link_type="naked",
            status="Active",
            notes="B站官方账号【禅宗空间】发布赵州录‘狗子佛性’与八十行脚考据长文，挂载赵州录典籍专页"
        )
        print(f"✅ 台账记录成功: {rec_id} -> {live_url}")
        return live_url
    return None

if __name__ == "__main__":
    url = publish_zhaozhou()
    print("发布最终结果 URL:", url)
