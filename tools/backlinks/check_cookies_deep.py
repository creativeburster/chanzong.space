# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    # 访问 B 站
    print(">>> 正在用持久化 Profile 访问 B站...")
    page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/real_bili_check.png")
    
    bili_cookies = ctx.cookies("https://www.bilibili.com")
    weibo_cookies = ctx.cookies("https://weibo.com")
    
    print("Bilibili cookies count in profile:", len(bili_cookies))
    print("Bili cookie names:", [c["name"] for c in bili_cookies])
    print("Weibo cookies count in profile:", len(weibo_cookies))
    print("Weibo cookie names:", [c["name"] for c in weibo_cookies])
    
    # 检查是否包含核心鉴权字段
    has_bili_sess = any(c["name"] == "SESSDATA" for c in bili_cookies)
    has_bili_jct = any(c["name"] == "bili_jct" for c in bili_cookies)
    has_wb_sub = any(c["name"] == "SUB" for c in weibo_cookies)
    
    print(f"B站鉴权字段: SESSDATA={has_bili_sess}, bili_jct={has_bili_jct}")
    print(f"微博鉴权字段: SUB={has_wb_sub}")
    
    ctx.close()
