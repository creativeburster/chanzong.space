# -*- coding: utf-8 -*-
"""
方案 B：拉起可视化 Edge 浏览器并同步捕获二维码，引导用户完成微博与 B 站扫码续期
"""
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

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILE_DIR = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile")
ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

def main():
    print("==================================================================")
    print("🚀 正在启动 Edge 桌面浏览器窗口，准备微博与哔哩哔哩扫码...")
    print(f"Profile 路径: {PROFILE_DIR}")
    print("==================================================================")
    
    with sync_playwright() as p:
        # 启动可视化有头浏览器（窗口置于前台）
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=False,
            user_agent=REAL_UA,
            viewport={"width": 1280, "height": 850},
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ]
        )
        
        # 隐藏 webdriver 标识
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        # Tab 1: 微博
        page_weibo = ctx.pages[0] if ctx.pages else ctx.new_page()
        print("\n[微博] 正在加载微博登录页面...")
        try:
            page_weibo.goto("https://weibo.com/newlogin?tabtype=weibo&gid=102803&openLoginLayer=1&url=https://weibo.com/", wait_until="domcontentloaded", timeout=20000)
            time.sleep(2)
            weibo_qr_path = os.path.join(ARTIFACT_DIR, "weibo_login_qr.png")
            page_weibo.screenshot(path=weibo_qr_path)
            print(f"[微博] 登录页已截图保存至 Artifacts: {weibo_qr_path}")
        except Exception as e:
            print(f"[微博] 加载提示: {e}")

        # Tab 2: 哔哩哔哩
        print("\n[哔哩哔哩] 正在新建标签页并打开 B 站登录页面...")
        page_bili = ctx.new_page()
        try:
            page_bili.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=20000)
            time.sleep(2)
            bili_qr_path = os.path.join(ARTIFACT_DIR, "bilibili_login_qr.png")
            page_bili.screenshot(path=bili_qr_path)
            print(f"[哔哩哔哩] 登录页已截图保存至 Artifacts: {bili_qr_path}")
        except Exception as e:
            print(f"[哔哩哔哩] 加载提示: {e}")

        print("\n" + "="*60)
        print("💡 桌面已弹出 Edge 浏览器窗口，包含微博与 B 站两个标签页！")
        print("👉 请在桌面浏览器窗口中，使用手机 App 分别扫码登录：")
        print("   1. 微博（左侧标签页）：打开微博 App 扫一扫")
        print("   2. 哔哩哔哩（右侧标签页）：打开 B 站 App 扫一扫")
        print("（后台正在实时检测登录成功状态，登录成功后将自动继续...）")
        print("="*60 + "\n")

        weibo_ok = False
        bili_ok = False
        
        start_time = time.time()
        timeout = 180 # 3 分钟超时
        
        while time.time() - start_time < timeout:
            cookies = ctx.cookies()
            
            # 检查微博登录态
            if not weibo_ok:
                has_sub = any(c['name'] in ['SUB', 'SUBP'] and len(c['value']) > 10 for c in cookies)
                if has_sub or ("login" not in page_weibo.url and "weibo.com" in page_weibo.url):
                    weibo_ok = True
                    print("🎉 [微博] 检测到登录成功！会话已就绪。")
                    
            # 检查 B 站登录态
            if not bili_ok:
                has_sess = any(c['name'] == 'SESSDATA' and len(c['value']) > 10 for c in cookies)
                has_dede = any(c['name'] == 'DedeUserID' for c in cookies)
                if has_sess and has_dede:
                    bili_ok = True
                    print("🎉 [哔哩哔哩] 检测到 SESSDATA，B 站登录成功！会话已就绪。")
                    
            if weibo_ok and bili_ok:
                print("\n✨ 太棒了！微博与哔哩哔哩均已成功完成登录续期！")
                time.sleep(2)
                break
                
            time.sleep(2)
            
        print("\n正在保存最新 Cookies 并关闭浏览器...")
        # 导出一份 cookies json 备份
        bili_cookies = [c for c in ctx.cookies() if "bilibili" in c.get("domain", "")]
        if bili_cookies:
            with open(os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json"), "w", encoding="utf-8") as f:
                json.dump(bili_cookies, f, ensure_ascii=False, indent=2)
                
        ctx.close()
        print("浏览器已安全关闭，会话凭证已全量存入 .browser_profile！")
        
        # 汇总结果
        print("\n最终状态汇总:")
        print(f"  - 微博 (Weibo): {'✅ 已登录' if weibo_ok else '⚠️ 未检测到登录'}")
        print(f"  - 哔哩哔哩 (Bilibili): {'✅ 已登录' if bili_ok else '⚠️ 未检测到登录'}")

if __name__ == "__main__":
    main()
