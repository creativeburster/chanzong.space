# -*- coding: utf-8 -*-
"""
守护监听豆瓣微信扫码登录：
1. 启动持久化 Edge 浏览器，打开豆瓣微信授权登录
2. 捕获新鲜二维码保存为 tools/backlinks/douban_live_wechat_qr.png
3. 保持会话开启，持续监听回调直到登录成功（最长 180 秒）
4. 登录成功后保存状态并截图确认
"""
import os, sys, time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

QR_PATH = os.path.join(CUR_DIR, "douban_live_wechat_qr.png")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    print("访问豆瓣登录页...")
    page.goto("https://accounts.douban.com/passport/login", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 查找并点击微信登录
    wechat_btn = page.locator('a[href*="wechat"], a[title*="微信"], .btn-wechat, .oauth-wechat, [class*="wechat"]').first
    if not wechat_btn.is_visible():
        wechat_btn = page.locator('img[src*="wechat"], span[class*="wechat"]').first
        
    print("点击微信登录图标...")
    try:
        with ctx.expect_page(timeout=5000) as new_page_info:
            wechat_btn.click()
        target_page = new_page_info.value
    except Exception:
        target_page = page
        
    time.sleep(3)
    print("微信登录页面已就绪:", target_page.url)
    
    # 截取二维码高清图
    target_page.screenshot(path=QR_PATH)
    print(f"最新微信二维码已保存至: {QR_PATH}")
    
    # 轮询监听扫码登录状态（最多等待 180 秒）
    start_time = time.time()
    logged_in = False
    print("正在等待用户扫码确认...")
    
    while time.time() - start_time < 180:
        # 检查所有打开的页面，看是否有跳转回豆瓣并且已登录的
        for pg in ctx.pages:
            url = pg.url
            if "douban.com" in url and "passport/login" not in url and "open.weixin" not in url:
                # 检查页面是否包含登录态
                c = pg.content()
                if "nav-user-account" in c or "我的豆瓣" in c or "退出" in c or "people" in c:
                    print(f"🎉 检测到豆瓣已成功登录！URL: {url}")
                    time.sleep(2)
                    pg.screenshot(path=os.path.join(CUR_DIR, "douban_login_success.png"))
                    logged_in = True
                    break
        if logged_in:
            break
        time.sleep(3)
        
    if not logged_in:
        print("⏳ 等待超时或尚未完成扫码。")
    else:
        print("🎉 豆瓣登录态已持久化保存入 Profile！")
        
    ctx.close()
