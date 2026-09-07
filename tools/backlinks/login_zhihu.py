# -*- coding: utf-8 -*-
"""
知乎扫码登录辅助工具：
在后台启动浏览器，提取登录二维码并实时保存为图片，等待用户使用手机知乎或微信扫码。
登录成功后自动将 Cookies 持久化保存至 .browser_profile 目录，后续运行无需再扫码。
"""
import os
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"
QR_PATH_ARTIFACT = os.path.join(ARTIFACT_DIR, "zhihu_qr.png")
PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

def wait_for_zhihu_scan(timeout_secs: int = 180):
    os.makedirs(PROFILE_DIR, exist_ok=True)
    p = sync_playwright().start()
    
    print("[Zhihu] 正在启动后台持久化浏览器会话...")
    context = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        viewport={"width": 1280, "height": 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    
    page = context.pages[0] if context.pages else context.new_page()
    page.goto("https://www.zhihu.com/signin", wait_until="domcontentloaded", timeout=25000)
    time.sleep(3)
    
    # 截取最新二维码
    qr_el = page.query_selector(".Qrcode-img, img[alt*='qr'], .SignContainer-inner")
    if qr_el:
        qr_el.screenshot(path=QR_PATH_ARTIFACT)
        print(f"[Zhihu] 最新二维码已就绪，已保存至: {QR_PATH_ARTIFACT}")
    else:
        page.screenshot(path=QR_PATH_ARTIFACT)
        print(f"[Zhihu] 页面截图已保存至: {QR_PATH_ARTIFACT}")
        
    print("[Zhihu] 正在等待手机扫码确认（超时时间 3 分钟）...")
    start_time = time.time()
    logged_in = False
    
    while time.time() - start_time < timeout_secs:
        # 1. 检查是否成功跳转或出现已登录特征
        current_url = page.url
        if "signin" not in current_url:
            logged_in = True
            print(f"✅ 登录成功！页面已重定向至: {current_url}")
            break
            
        avatar = page.query_selector(".AppHeader-profile, .AppHeader-userInfo, img.Avatar")
        if avatar:
            logged_in = True
            print("✅ 登录成功！已检测到用户头像与个人中心。")
            break
            
        # 2. 检查二维码是否过期
        refresh_btn = page.query_selector("button:has-text('刷新'), .Qrcode-mask")
        if refresh_btn and refresh_btn.is_visible():
            print("[Zhihu] 二维码已过期，正在自动刷新...")
            try:
                refresh_btn.click()
                time.sleep(2)
                qr_el = page.query_selector(".Qrcode-img, .SignContainer-inner")
                if qr_el:
                    qr_el.screenshot(path=QR_PATH_ARTIFACT)
                    print("[Zhihu] 已更新二维码截图。")
            except Exception:
                pass
                
        time.sleep(2)
        
    if logged_in:
        time.sleep(3) # 等待 cookies 写入
        context.close()
        p.stop()
        print("🎉 知乎登录态与 Cookies 已成功永久持久化！")
        return True
    else:
        context.close()
        p.stop()
        print("⚠️ 扫码等待超时，请重新执行。")
        return False

if __name__ == "__main__":
    wait_for_zhihu_scan()
