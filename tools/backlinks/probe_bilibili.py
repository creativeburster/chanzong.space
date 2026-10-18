# -*- coding: utf-8 -*-
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

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    # 访问 B 站主站看看当前 profile 是否已有登录态
    print("正在访问 Bilibili 主站...")
    page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    
    # 检查是否已登录
    user_status = page.evaluate("""() => {
        const avatar = document.querySelector('.header-avatar-wrap, .v-popover-wrap .mini-avatar--small, .header-entry-avatar');
        const loginBtn = Array.from(document.querySelectorAll('a, button, span')).find(el => el.innerText && el.innerText.trim() === '登录');
        return {
            hasAvatar: !!avatar,
            hasLoginBtn: !!loginBtn
        };
    }""")
    print("B站登录状态探测:", user_status)
    page.screenshot(path="tools/backlinks/bilibili_home_probe.png")
    
    if not user_status["hasAvatar"]:
        print("未登录，前往登录页面获取二维码...")
        page.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/bilibili_login_page.png")
        print("已保存登录页截图至: tools/backlinks/bilibili_login_page.png")
        
        # 寻找二维码图片或容器
        qr_info = page.evaluate("""() => {
            const qrImg = document.querySelector('.qrcode-img img, .bili-mini-qrcode img, img[alt*="二维码"], .qrcode-login canvas');
            const qrBox = document.querySelector('.qrcode-img, .qrcode-con, .login-scan-box');
            return {
                hasQrImg: !!qrImg,
                qrSrc: qrImg ? qrImg.src.slice(0, 100) : null,
                hasQrBox: !!qrBox
            };
        }""")
        print("二维码检测:", qr_info)
        
    ctx.close()
