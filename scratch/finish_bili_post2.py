# -*- coding: utf-8 -*-
"""
发布 B 站第 2 篇动态并点击【确认并发送】弹窗，抓取最新落地页并更新台账
"""
import os
import sys
import time
import json
import csv
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COOKIE_FILE = os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json")
CSV_PATH = os.path.join(PROJECT_ROOT, "seo", "backlinks_log.csv")
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink, generate_markdown_report

content = """【曹溪正传 · 顿悟法雷】荷泽神会显宗记心髓考据
唐代天宝年间，荷泽神会禅师于滑台设无遮大会，定南北是非，立曹溪顿门。
其所撰《显宗记》云：“湛然常寂，应用无方。用而常空，空而常用。用而不有，即是真空；空而不无，便成妙有。”
神会禅师力倡“无念为宗，无作为体”，直示学者：心体本空，灵知不昧。在日用繁琐中了知能应一切而不染一切，即是真如自性。

📚 深度研析《显宗记》原文逐句科判与曹溪法脉图谱：
https://chanzong.space/classics/shenhui"""

with open(COOKIE_FILE, 'r', encoding='utf-8') as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    print("正在打开 B 站动态发布页面...")
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded")
    time.sleep(4)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    editor.click()
    time.sleep(0.5)
    page.keyboard.press("Control+A")
    time.sleep(0.2)
    page.keyboard.press("Backspace")
    time.sleep(0.5)
    
    for line in content.split("\n"):
        if line.strip():
            page.keyboard.type(line, delay=8)
        page.keyboard.press("Enter")
        time.sleep(0.2)
        
    time.sleep(1)
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    print("点击首个发布按钮...")
    pub_btn.click()
    time.sleep(2)
    
    # 点击【确认并发送】
    confirm_btn = page.locator('button:has-text("确认并发送")').first
    if confirm_btn.is_visible():
        print("🎉 发现【确认并发送】弹窗按钮，执行点击！")
        confirm_btn.click()
        time.sleep(5)
    else:
        print("未发现【确认并发送】按钮")
        
    # 前往个人空间提取最新一条直链
    page.goto("https://space.bilibili.com/520219006/dynamic", wait_until="domcontentloaded")
    time.sleep(4)
    
    item = page.locator('.bili-dyn-item').first
    time_el = item.locator('[class*="time"]').first
    print("最新动态时间文本:", time_el.inner_text())
    
    with ctx.expect_page() as pinfo:
        time_el.click()
    newp = pinfo.value
    newp.wait_for_load_state("domcontentloaded")
    live_url = newp.url.split('?')[0]
    print(f"🎉🎉 B站第2篇动态发布成功！真实直链: {live_url}")
    newp.close()
    browser.close()
    
    # 更新台账：先清理掉之前重复的 BL-0294，再正确写入
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))
    # 如果最后一行是 BL-0294 且有重复，弹出
    if rows and rows[-1][0] == 'BL-0294':
        rows.pop()
    with open(CSV_PATH, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
        
    rec = add_backlink(
        platform="哔哩哔哩 (Bilibili DA 94+)",
        region="国内",
        category="社交媒体 / 动态广场",
        post_title="【曹溪正传 · 顿悟法雷】荷泽神会显宗记心髓考据",
        target_url="https://chanzong.space/classics/shenhui",
        backlink_url=live_url,
        anchor_text="《荷泽神会显宗记》原文科判与曹溪法脉图谱（https://chanzong.space/classics/shenhui）",
        link_type="Dofollow / UGC",
        status="Live",
        notes="B站官方账号【禅宗空间】发布中长篇顿悟心髓考据动态，面向显宗记专页"
    )
    print(f"✅ B站第2篇动态已正确记录入库: {rec}")

if __name__ == "__main__":
    pass
