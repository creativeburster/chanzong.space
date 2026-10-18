# -*- coding: utf-8 -*-
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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"
QR_PATH = os.path.join(ARTIFACT_DIR, "xhs_live_qrcode.png")
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")

def run_flow():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问小红书创作者登录页...")
        page.goto("https://creator.xiaohongshu.com/login", timeout=35000)
        time.sleep(3)
        
        print("2. 切换至二维码扫码登录...")
        page.mouse.click(1255, 335)
        time.sleep(2)
        
        # 截取二维码
        page.screenshot(path=QR_PATH)
        print(f"QR_READY: 二维码截图已生成至 {QR_PATH}")
        
        # 等待用户扫码 (最多 180 秒)
        print("3. 等待用户手机小红书 APP 扫码确认...")
        start_time = time.time()
        logged_in = False
        
        while time.time() - start_time < 180:
            cur_url = page.url
            title = page.title()
            
            # 检查是否跳转或登录成功
            if "login" not in cur_url or "home" in cur_url or ("creator" in cur_url and "login" not in cur_url):
                print(f"LOGIN_SUCCESS: 检测到页面跳转！当前 URL: {cur_url}, Title: {title}")
                logged_in = True
                break
                
            time.sleep(3)
            
        if not logged_in:
            print("TIMEOUT: 等待扫码超时 (180秒)")
            ctx.close()
            return False
            
        time.sleep(3)
        # 保存最新 Cookie
        cookies = ctx.cookies()
        with open(COOKIE_PATH, "w", encoding="utf-8") as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)
        print(f"COOKIES_SAVED: 已保存 {len(cookies)} 个最新 Cookie！")
        
        # 访问创作者主页或发布页验证
        page.goto("https://creator.xiaohongshu.com/creator/home", timeout=30000)
        time.sleep(4)
        home_screen = os.path.join(ARTIFACT_DIR, "xhs_logged_in_home.png")
        page.screenshot(path=home_screen)
        print(f"HOME_SCREEN: 创作者首页截图已生成: {home_screen}")
        
        ctx.close()
        return True

if __name__ == "__main__":
    run_flow()
