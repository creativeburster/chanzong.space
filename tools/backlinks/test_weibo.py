# -*- coding: utf-8 -*-
"""
测试微博 Cookie 登录状态与用户信息提取
"""
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

def test_login():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = []
    for k, v in cookie_dict.items():
        cookies.append({
            "name": k,
            "value": v.strip('"'),
            "domain": ".weibo.com",
            "path": "/"
        })
        
    print("🚀 启动浏览器验证微博 Cookie 凭据...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        print("正在打开 weibo.com 首页...")
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        page.screenshot(path="tools/backlinks/weibo_test_home.png")
        print("当前页面标题:", page.title())
        print("当前页面 URL:", page.url)
        
        # 判断登录状态
        # 未登录一般会出现登录弹窗或登录按钮，或者 URL 被重定向到 login.php / newlogin
        # 已登录会在左侧或顶部有用户昵称、个人中心
        user_info = page.evaluate("""() => {
            const avatar = document.querySelector('img[class*="woo-avatar-img"]');
            return {
                title: document.title,
                url: window.location.href,
                hasPostBox: !!document.querySelector('textarea, div[contenteditable="true"]'),
                avatarSrc: avatar ? avatar.src : null
            };
        }""")
        
        print("登录探测结果:", json.dumps(user_info, ensure_ascii=False, indent=2))
        
        # 也可以顺便保存更新后的全量 cookies
        full_cookies = ctx.cookies()
        updated_dict = {c["name"]: c["value"] for c in full_cookies if "weibo.com" in c.get("domain", "")}
        with open(COOKIE_PATH, "w", encoding="utf-8") as f:
            json.dump(updated_dict, f, ensure_ascii=False, indent=2)
        print(f"✅ 已持久化存储完整微博会话 Cookies (共 {len(updated_dict)} 项)")
        
        browser.close()

if __name__ == "__main__":
    test_login()
