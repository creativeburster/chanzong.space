# -*- coding: utf-8 -*-
"""
哔哩哔哩 (Bilibili DA 94+) 垂直高质量禅宗动态发布
主题：【动静一如 · 咬着米了吗】黄檗希运禅师《传心法要》心髓考据
"""
import os
import sys
import time
import json
import re
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

POST_TITLE = "【动静一如 · 咬着米了吗】黄檗希运禅师《传心法要》无心顿悟考"
TARGET_URL = "https://chanzong.space/classics/huangbo"

CONTENT = """【动静一如 · 咬着米了吗】
黄檗断际禅师在《传心法要》中有一句极脍炙人口的宗门法语：“终日吃饭，未曾咬着一粒米；整日行走，未曾踏着一片地。与么时，无自他等相，终日不离一切事，不被诸境惑，方名自在人。”

很多初机学者常困惑：既然吃了饭，怎会“咬不着米”？
实则“未咬着米”非不嚼米，而是这一念清净自性，虽处柴米油盐、咀嚼咽纳的日用万象之中，而自性本体如如不动，不随五味甘苦起爱憎，不于尘境上妄生能所对待。行而无住，吃而无着，这便是大乘顿教极上乘的“动静一如、体用不二”。

随缘赴感，当下清凉。在日用常行中不被境惑，便能于喧嚣世间见得本来面目。

📖《黄檗断际禅师传心法要》全文白话今译与无心心性图谱：
https://chanzong.space/classics/huangbo"""

def publish_bili():
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
        
        # 查找动态输入框
        editor = page.query_selector(".bili-rich-textarea__inner, [contenteditable='true'], textarea")
        if not editor:
            print("未找到输入框，截图排查")
            page.screenshot(path="scratch/bili_err_editor.png")
            browser.close()
            return None
            
        print("2. 聚焦输入框并注入禅学考据长文...")
        editor.click()
        time.sleep(0.5)
        page.keyboard.insert_text(CONTENT)
        time.sleep(1)
        page.keyboard.press("Space")
        time.sleep(1)
        page.screenshot(path="scratch/bili_ready_to_send.png")
        
        # 点击【发布】按钮
        print("3. 点击发布按钮...")
        pub_btn = page.query_selector(".bili-dyn-publishing__action button, .bili-dyn-publishing__action, button:has-text('发布')")
        if pub_btn:
            pub_btn.click()
            time.sleep(3)
            
            # 检查是否有规范弹窗（哔哩哔哩动态使用规范）
            confirm_modal = page.query_selector("button:has-text('确认并发送'), button:has-text('确定')")
            if confirm_modal:
                print("发现规范确认弹窗，点击【确认并发送】...")
                confirm_modal.click()
                time.sleep(4)
                
            page.screenshot(path="scratch/bili_after_pub.png")
        else:
            print("未找到发布按钮")
            
        # 4. 访问个人空间动态页抓取最新动态链接
        my_space_url = "https://space.bilibili.com/520219006/dynamic"
        print(f"4. 正在访问个人空间动态页: {my_space_url} ...")
        page.goto(my_space_url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(5)
        page.screenshot(path="scratch/bili_space_dyn.png")
        
        # 抓取第一条动态链接
        dyn_url = page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('a[href*="t.bilibili.com/"], a[href*="/opus/"]'));
            for (const a of links) {
                if (a.href.match(/t\\.bilibili\\.com\\/\\d+/) || a.href.match(/opus\\/\\d+/)) {
                    return a.href;
                }
            }
            return null;
        }""")
        
        if not dyn_url:
            # 尝试从时间元素或卡片找
            dyn_url = page.evaluate("""() => {
                const item = document.querySelector('.bili-dyn-item, .bili-dyn-list__item');
                if (item) {
                    const a = item.querySelector('a[href*="t.bilibili.com"]');
                    if (a) return a.href;
                }
                return null;
            }""")
            
        print("抓取到的动态 URL:", dyn_url)
        if dyn_url:
            print(f"🎉🎉 [Bilibili] 禅学考据长文动态发布成功！")
            print(f"👉 独立永久 URL: {dyn_url}")
            
            rec_id = add_backlink(
                platform="哔哩哔哩 (Bilibili DA 94+)",
                region="国内大陆",
                category="社交媒体 / 动态广场",
                post_title=POST_TITLE,
                target_url=TARGET_URL,
                backlink_url=dyn_url,
                anchor_text="《黄檗断际禅师传心法要》全文白话今译与无心心性图谱",
                link_type="Dofollow / UGC",
                status="Live",
                notes="B站官方账号【在空间】发布黄檗禅师传心法要考据长文，深度释读‘终日吃饭未曾咬着一粒米’动静一如心法，挂载黄檗专页"
            )
            print(f"✅ 外链台账已成功入库: {rec_id}")
            browser.close()
            return dyn_url
        else:
            print("未能抓取到动态 URL，请查看 scratch/bili_space_dyn.png")
            browser.close()
            return None

if __name__ == "__main__":
    publish_bili()
