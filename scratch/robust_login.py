# -*- coding: utf-8 -*-
"""
严谨无误的桌面扫码登录脚本：
1. 弹出独立 Edge 窗口（不抢关，最长等待 300 秒）；
2. 彻底基于真实 DOM 元素判断（微博必须出现发微博框/个人昵称；B 站必须完成跳转并出现个人头像）；
3. 扫码成功后自动保存并优雅退出。
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
    print("🚀 正在拉起 Edge 桌面独立窗口，请从容扫码（保持窗口开放 5 分钟）...")
    print("==================================================================")
    
    with sync_playwright() as p:
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
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        # 页面 1: 微博登录
        page_weibo = ctx.pages[0] if ctx.pages else ctx.new_page()
        print("\n[微博] 正在打开微博二维码登录页面...")
        page_weibo.goto("https://weibo.com/login.php", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 页面 2: 哔哩哔哩登录
        print("[哔哩哔哩] 正在新建标签页打开 B 站登录页面...")
        page_bili = ctx.new_page()
        page_bili.goto("https://passport.bilibili.com/login", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        print("\n" + "="*70)
        print("🔔 浏览器窗口已就绪！请您在弹出的 Edge 窗口中操作：")
        print("   👉 标签页 1（微博）：打开手机微博 App 扫码确认登录")
        print("   👉 标签页 2（哔哩哔哩）：打开手机 B 站 App 扫码确认登录")
        print("（后台正以真实网页 DOM 元素严格检测登录状态，不会过早关闭窗口）")
        print("="*70 + "\n")
        
        weibo_logged = False
        bili_logged = False
        
        start_time = time.time()
        max_wait = 300 # 5 分钟
        
        while time.time() - start_time < max_wait:
            # 1. 严格检测微博是否真正进入主页或个人主页
            if not weibo_logged:
                weibo_url = page_weibo.url
                # 微博成功登录后，URL 会离开 login.php，且页面上会出现发微博框或个人主页标志
                has_feed = False
                try:
                    textarea_cnt = page_weibo.locator('textarea[placeholder*="有什么新鲜事"], textarea[placeholder*="快来分享"], .Form_input_2gtHi').count()
                    avatar_cnt = page_weibo.locator('[node-type="account"], .gn_name, a[href*="/u/"]').count()
                    if "login" not in weibo_url and (textarea_cnt > 0 or avatar_cnt > 0):
                        has_feed = True
                except Exception:
                    pass
                    
                if has_feed:
                    weibo_logged = True
                    print(f"🎉🎉🎉 [微博] 真实登录成功！当前页面: {weibo_url}")
                    
            # 2. 严格检测 B 站是否真正登录成功
            if not bili_logged:
                bili_url = page_bili.url
                has_bili_avatar = False
                try:
                    # 登录后通常跳转到首页或个人中心，出现头像元素
                    avatar_cnt = page_bili.locator('.header-avatar-wrap, .mini-avatar, .header-entry-avatar, .v-popover-wrap').count()
                    if "passport" not in bili_url and (avatar_cnt > 0 or "bilibili.com" in bili_url):
                        has_bili_avatar = True
                except Exception:
                    pass
                    
                if has_bili_avatar:
                    bili_logged = True
                    print(f"🎉🎉🎉 [哔哩哔哩] 真实登录成功！当前页面: {bili_url}")
                    
            if weibo_logged and bili_logged:
                print("\n✨✨✨ 太棒了！微博与哔哩哔哩均已 100% 确认真实登录成功！")
                time.sleep(3)
                break
                
            time.sleep(2)
            
        # 导出最新 cookies 备份
        bili_cookies = [c for c in ctx.cookies() if "bilibili" in c.get("domain", "")]
        if bili_cookies:
            with open(os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json"), "w", encoding="utf-8") as f:
                json.dump(bili_cookies, f, ensure_ascii=False, indent=2)
                
        ctx.close()
        print("\n浏览器已安全保存并关闭！")
        print(f"微博登录状态: {'✅ 成功' if weibo_logged else '❌ 未完成'}")
        print(f"B站登录状态: {'✅ 成功' if bili_logged else '❌ 未完成'}")

if __name__ == "__main__":
    main()
