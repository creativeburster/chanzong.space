# -*- coding: utf-8 -*-
"""
1. 将 B 站第 1 篇已验证成功的动态入库 (BL-0293)
2. 发布 B 站第 2 篇长篇公案解密动态并抓取直链入库 (BL-0294)
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

# 先入库第 1 篇
rec1 = add_backlink(
    platform="哔哩哔哩 (Bilibili DA 94+)",
    region="国内",
    category="社交媒体 / 动态广场",
    post_title="【古佛家风 · 平常是道】赵州和尚“吃茶去”与不二门境",
    target_url="https://chanzong.space/classics/zhaozhoulu",
    backlink_url="https://t.bilibili.com/1250791882195206144",
    anchor_text="《赵州和尚语录》全卷机锋公案与白话导读（https://chanzong.space/classics/zhaozhoulu）",
    link_type="Dofollow / UGC",
    status="Live",
    notes="B站官方账号【禅宗空间】发布中篇修持随笔Opus动态，面向赵州语录专页"
)
print(f"🎉 第一篇 B 站动态已成功入库: {rec1}")

# 第 2 篇任务数据
task2 = {
    "title": "【曹溪正传 · 顿悟法雷】荷泽神会《显宗记》心髓考据与南宗立足",
    "target_url": "https://chanzong.space/classics/shenhui",
    "anchor_text": "《荷泽神会显宗记》原文科判与曹溪法脉图谱（https://chanzong.space/classics/shenhui）",
    "content": """【曹溪正传 · 顿悟法雷】
唐代天宝年间，荷泽神会禅师于滑台大云寺设无遮大会，定南北是非，立曹溪顿宗，使六祖惠能一脉名扬天下。
其所撰《显宗记》，开卷即阐发南宗至极法眼：
“湛然常寂，应用无方。用而常空，空而常用。用而不有，即是真空；空而不无，便成妙有。”

千百年来，学者多病于“执空”与“著有”两端：
执有着相，则汲汲于积聚功德，将修行打作为生灭有漏之业；
执空沉寂，则枯木死灰，视世间万行如寇仇，堕入二乘偏枯顽空。
神会禅师力倡“无念为宗，无作为体”，直示学人：心体本空，何须造作拂拭？灵知不昧，当下任运随缘。
见闻觉知处处现成，而于一切法上不起爱憎执取，即是定慧不二、真如自性。

现代人在日常职场与生活奔波中，若能深契《显宗记》妙旨，在烦琐作务中了知“能应一切而不染一切”，便是最坚实稳当的安身立命之本。

📚 深度研析《显宗记》原文逐句科判与曹溪法脉D3关系图谱：
https://chanzong.space/classics/shenhui"""
}

with open(COOKIE_FILE, 'r', encoding='utf-8') as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    print("\n正在打开 B 站动态发布页面...")
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=35000)
    time.sleep(5)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    if not editor:
        page.reload(wait_until="domcontentloaded")
        time.sleep(4)
        editor = page.query_selector('.bili-rich-textarea__inner')
        
    editor.click()
    time.sleep(0.5)
    page.keyboard.press("Control+A")
    time.sleep(0.2)
    page.keyboard.press("Backspace")
    time.sleep(0.5)
    
    for line in task2["content"].split("\n"):
        if line.strip():
            page.keyboard.type(line, delay=8)
        page.keyboard.press("Enter")
        time.sleep(0.2)
        
    time.sleep(1)
    page.keyboard.press("Space")
    time.sleep(1)
    
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    if pub_btn:
        print("点击发布动态按钮...")
        pub_btn.click()
        time.sleep(3)
        
    confirm_btn = page.query_selector('.bili-dyn-specification-popup__btn')
    if confirm_btn and confirm_btn.is_visible():
        print("点击规范确认...")
        confirm_btn.click()
        time.sleep(3)
        
    time.sleep(5)
    
    # 前往个人空间动态页提取直链
    page.goto("https://space.bilibili.com/520219006/dynamic", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    item = page.locator('.bili-dyn-item').first
    time_el = item.locator('[class*="time"]').first
    print("最新动态时间:", time_el.inner_text())
    
    with ctx.expect_page() as pinfo:
        time_el.click()
    newp = pinfo.value
    newp.wait_for_load_state("domcontentloaded")
    live_url = newp.url.split('?')[0]
    print(f"🎉🎉 第二篇 B 站动态发布成功！纯净直链: {live_url}")
    newp.close()
    
    rec2 = add_backlink(
        platform="哔哩哔哩 (Bilibili DA 94+)",
        region="国内",
        category="社交媒体 / 动态广场",
        post_title=task2["title"],
        target_url=task2["target_url"],
        backlink_url=live_url,
        anchor_text=task2["anchor_text"],
        link_type="Dofollow / UGC",
        status="Live",
        notes="B站官方账号【禅宗空间】发布长篇公案深度解密Opus动态，面向显宗记专页"
    )
    print(f"✅ 第二篇 B 站动态已入库: {rec2}")
    
    browser.close()
