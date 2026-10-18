# -*- coding: utf-8 -*-
import os, sys, time, json
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
    
    print("正在打开 B 站登录页面获取最新二维码...")
    page.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 截取登录页（含清晰二维码）
    qr_img_path = os.path.join(CUR_DIR, "bilibili_qr_fresh.png")
    page.screenshot(path=qr_img_path)
    print(f"最新二维码截图已保存至: {qr_img_path}")
    
    # 也可以单独把二维码区域裁剪截图
    try:
        qr_box = page.query_selector('.qrcode-login, .qrcode-con, .login-scan-box')
        if not qr_box:
            # 找到包含二维码图片的容器
            qr_box = page.query_selector('div:has(canvas), div:has(img[alt*="二维码"])')
        if qr_box:
            qr_box.screenshot(path=os.path.join(CUR_DIR, "bilibili_qr_box.png"))
            print("二维码局部截图已保存至: bilibili_qr_box.png")
    except Exception as e:
        print("裁剪二维码异常:", e)
        
    print("开始等待用户扫码登录（最长等待 120 秒）...")
    logged_in = False
    start_time = time.time()
    
    while time.time() - start_time < 120:
        cookies = ctx.cookies()
        sessdata = any(c['name'] == 'SESSDATA' for c in cookies)
        dede_user = any(c['name'] == 'DedeUserID' for c in cookies)
        
        if sessdata and dede_user:
            print("🎉 检测到 SESSDATA 与 DedeUserID，B站扫码登录成功！")
            logged_in = True
            break
            
        time.sleep(3)
        
    if logged_in:
        # 保存全量 cookie
        cookies = ctx.cookies()
        with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "w", encoding="utf-8") as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)
        print("Cookies 已成功保存到 tools/backlinks/bilibili_cookies.json")
        
        # 访问个人主页验证
        page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "bilibili_logged_in_home.png"))
        print("登录后主页截图已保存: tools/backlinks/bilibili_logged_in_home.png")
    else:
        print("⏰ 等待超时，未检测到扫码。")
        
    ctx.close()
