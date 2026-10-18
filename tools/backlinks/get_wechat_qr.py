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
    page.goto("https://accounts.douban.com/passport/login", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 查找绿色微信图标
    wechat_btn = page.locator('a[href*="wechat"], a[title*="微信"], .btn-wechat, .oauth-wechat, [class*="wechat"]').first
    if not wechat_btn.is_visible():
        # 尝试通过图片/SVG定位绿色微信图标
        wechat_btn = page.locator('img[src*="wechat"], span[class*="wechat"]').first
        
    print("准备点击微信登录...")
    # 微信可能在当前页面跳转，也可能弹新窗口
    try:
        with ctx.expect_page(timeout=5000) as new_page_info:
            wechat_btn.click()
        wx_page = new_page_info.value
    except Exception:
        wx_page = page
        
    time.sleep(3)
    print("微信页面 URL:", wx_page.url)
    wx_page.screenshot(path="tools/backlinks/douban_wechat_qrcode.png")
    print("微信二维码截图已保存至 tools/backlinks/douban_wechat_qrcode.png")
    
    ctx.close()
