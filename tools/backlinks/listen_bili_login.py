# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=30000)
    time.sleep(2)
    
    # 刷新并保存最新截图
    page.screenshot(path=os.path.join(CUR_DIR, "bilibili_qr_fresh_now.png"))
    
    print("后台监听启动，等待扫码（180秒）...")
    start_time = time.time()
    logged_in = False
    
    while time.time() - start_time < 180:
        cookies = ctx.cookies()
        sessdata = any(c['name'] == 'SESSDATA' for c in cookies)
        dede_user = any(c['name'] == 'DedeUserID' for c in cookies)
        
        if sessdata and dede_user:
            print("🎉 检测到 SESSDATA，B站登录成功！")
            logged_in = True
            break
        time.sleep(3)
        
    if logged_in:
        cookies = ctx.cookies()
        with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "w", encoding="utf-8") as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)
        print("已保存最新 B 站 cookies 至 tools/backlinks/bilibili_cookies.json")
        page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "bilibili_logged_in_home.png"))
    else:
        print("超时未扫码")
    ctx.close()
