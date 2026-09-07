# -*- coding: utf-8 -*-
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
QR_PATH_LOCAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "zhihu_qr.png")
PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

def capture_qr():
    os.makedirs(PROFILE_DIR, exist_ok=True)
    p = sync_playwright().start()
    
    # 使用 headless=True 这样可以在后台无障碍运行并截屏
    context = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        viewport={"width": 1280, "height": 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    
    page = context.pages[0] if context.pages else context.new_page()
    print("正在打开知乎登录页...")
    page.goto("https://www.zhihu.com/signin", wait_until="domcontentloaded", timeout=25000)
    time.sleep(3)
    
    # 查找二维码容器
    qr_el = page.query_selector(".Qrcode-img, .SignContainer-inner, .Login-content")
    if qr_el:
        qr_el.screenshot(path=QR_PATH_ARTIFACT)
        qr_el.screenshot(path=QR_PATH_LOCAL)
        print(f"二维码区域截图已保存至: {QR_PATH_ARTIFACT}")
    else:
        page.screenshot(path=QR_PATH_ARTIFACT)
        page.screenshot(path=QR_PATH_LOCAL)
        print(f"全页截图已保存至: {QR_PATH_ARTIFACT}")
        
    context.close()
    p.stop()
    print("截图完成。")

if __name__ == "__main__":
    capture_qr()
