# -*- coding: utf-8 -*-
import os, sys, time
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
    
    print("正在访问豆瓣首页...")
    page.goto("https://www.douban.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    
    # 检查是否已登录：
    # 豆瓣已登录状态顶部会有当前用户名，例如 class="nav-user-account" 或 a[href*="/people/"]
    # 未登录状态会显示登录/注册，或者登录框
    page.screenshot(path="tools/backlinks/douban_home_probe.png")
    
    content = page.content()
    is_logged_in = "nav-user-account" in content or "我的豆瓣" in content or "退出" in content
    print(f"豆瓣是否已登录: {is_logged_in}")
    
    ctx.close()
