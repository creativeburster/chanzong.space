# -*- coding: utf-8 -*-
import os
import sys
import json
import time
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
QR_PATH = os.path.join(ARTIFACT_DIR, "csdn_wechat_qrcode.png")
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "csdn_cookie.json")

def csdn_wechat_login_flow():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问 CSDN 登录页...")
        page.goto("https://passport.csdn.net/login", timeout=35000, wait_until="domcontentloaded")
        time.sleep(3)
        
        # 确保在微信登录 tab
        page.evaluate("""() => {
            const tabs = Array.from(document.querySelectorAll('*'));
            const wxTab = tabs.find(el => (el.innerText || '').trim() === '微信登录' && el.children.length === 0);
            if (wxTab) wxTab.click();
        }""")
        time.sleep(2)
        
        # 截取登录二维码
        page.screenshot(path=QR_PATH)
        print(f"QR_GENERATED: CSDN 微信扫码已保存至 {QR_PATH}")
        
        print("2. 等待用户微信扫码 (最多 180 秒)...")
        start = time.time()
        logged_in = False
        
        while time.time() - start < 180:
            cur_url = page.url
            title = page.title()
            
            # 检查是否跳转或登录成功
            if "login" not in cur_url or "blog.csdn.net" in cur_url or "mp.csdn.net" in cur_url:
                print(f"CSDN_LOGIN_SUCCESS: 页面跳转至 {cur_url}, Title: {title}")
                logged_in = True
                break
                
            # 检查页面是否已出现登录后的用户信息
            user_nick = page.evaluate("""() => {
                const el = document.querySelector('.user-profile, .user-name, [class*="userNick"], [class*="has-login"]');
                return el ? el.innerText.trim() : null;
            }""")
            if user_nick:
                print(f"CSDN_LOGIN_SUCCESS: 检测到登录昵称 {user_nick}")
                logged_in = True
                break
                
            time.sleep(3)
            
        if not logged_in:
            print("CSDN 扫码等待超时")
            ctx.close()
            return False
            
        time.sleep(3)
        # 获取包含 HttpOnly 在内的全部完整 Cookies
        full_cookies = ctx.cookies()
        with open(COOKIE_PATH, "w", encoding="utf-8") as f:
            json.dump(full_cookies, f, ensure_ascii=False, indent=2)
        print(f"CSDN_COOKIES_SAVED: 已保存 {len(full_cookies)} 个完整原生 Cookie！")
        
        # 访问创作者中心验证
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=35000)
        time.sleep(4)
        editor_screen = os.path.join(ARTIFACT_DIR, "csdn_editor_real_ready.png")
        page.screenshot(path=editor_screen)
        print(f"CSDN 创作者后台截图: {editor_screen}")
        print("最终创作者后台 URL:", page.url)
        
        ctx.close()
        return True

if __name__ == "__main__":
    csdn_wechat_login_flow()
