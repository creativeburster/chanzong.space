# -*- coding: utf-8 -*-
"""
哔哩哔哩 (Bilibili DA 94+) 垂直高质量禅宗动态发布
主题：【至道无难 · 绝学无为】永嘉玄觉大师《证道歌》心髓考据
"""
import os
import sys
import time
import json
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

POST_TITLE = "【至道无难 · 绝学无为】永嘉玄觉大师《证道歌》心髓解析与见性顿悟考"
TARGET_URL = "https://chanzong.space/classics/zhengdaoge"

CONTENT = """【至道无难 · 绝学无为】
唐代永嘉玄觉大师初见六祖惠能，策杖左右绕祖三匝，振锡而立。六祖赞其“得无生之意”，大师对曰：“无生岂有分别耶？”六祖叹曰：“如是，如是！于此留一宿，因谓‘一宿觉’。”

随后大师所作《证道歌》名震古今，开篇即是无上顿教宗风：
“君不见：绝学无为闲道人，不除妄想不求真。无明实性即佛性，幻化空身即法身。”

常人修行，往往向外求法、执着于“除妄想”，却不知妄想本空，执着除妄反增一重妄念；若能于当下直下承当，体认这一念不生不灭的自性，则一切处皆是解脱场，绝学无为，动静皆禅。

📖 永嘉玄觉大师《证道歌》全文对勘、白话今译与心性图谱：
https://chanzong.space/classics/zhengdaoge"""

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
                
            page.screenshot(path="scratch/bili_zhengdaoge_after_pub.png")
        else:
            print("未找到发布按钮")
            browser.close()
            return None
            
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
            dyn_url = page.evaluate("""() => {
                const item = document.querySelector('.bili-dyn-item, .bili-dyn-list__item');
                if (item) {
                    const a = item.querySelector('a[href*="t.bilibili.com"]');
                    if (a) return a.href;
                }
                return null;
            }""")
            
        print("抓取到的动态 URL:", dyn_url)
        browser.close()
        
        if dyn_url:
            print(f"🎉🎉 [Bilibili] 永嘉大师证道歌动态发布成功！")
            rec_id = add_backlink(
                platform="哔哩哔哩 (Bilibili DA 94+)",
                region="华语/中国大陆",
                category="文化/宗教哲学/国学经典",
                post_title=POST_TITLE,
                target_url=TARGET_URL,
                backlink_url=dyn_url,
                anchor_text="永嘉玄觉大师证道歌",
                link_type="naked",
                status="Active",
                notes="B站官方账号【禅宗空间】发布永嘉大师《证道歌》绝学无为考据长文，挂载证道歌典籍专页"
            )
            print(f"✅ 台账记录成功: {rec_id} -> {dyn_url}")
            return dyn_url
        else:
            print("❌ 未能获取动态链接")
            return None

if __name__ == "__main__":
    url = publish_bili()
    print("发布最终结果 URL:", url)
