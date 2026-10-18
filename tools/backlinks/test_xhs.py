# -*- coding: utf-8 -*-
"""
测试小红书创作者平台登录状态
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")

def test_login():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = []
    for k, v in cookie_dict.items():
        # 小红书 cookie 作用域在 .xiaohongshu.com
        cookies.append({
            "name": k,
            "value": v.strip('"'),
            "domain": ".xiaohongshu.com",
            "path": "/"
        })
        cookies.append({
            "name": k,
            "value": v.strip('"'),
            "domain": "creator.xiaohongshu.com",
            "path": "/"
        })
        
    print("🚀 启动浏览器验证小红书创作者中心登录状态...")
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
        
        # 1. 访问小红书创作者发布页
        publish_url = "https://creator.xiaohongshu.com/publish/publish"
        print(f"正在打开小红书创作者平台: {publish_url}...")
        page.goto(publish_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        print("当前页面标题:", page.title())
        print("当前页面 URL:", page.url)
        page.screenshot(path="tools/backlinks/xhs_test_publish.png")
        
        # 抓取页面上的关键元素
        res = page.evaluate("""() => {
            const hasUpload = !!document.querySelector('input[type="file"], .upload-wrapper, .upload-container, div:has-text("上传图文"), .publish-tab');
            const userAvatar = document.querySelector('img.avatar, .user-avatar, div[class*="avatar"] img');
            const userName = document.querySelector('.user-name, div[class*="name"]');
            return {
                title: document.title,
                url: window.location.href,
                hasUpload,
                user: userName ? userName.innerText : null
            };
        }""")
        print("登录与发布状态探测:", json.dumps(res, ensure_ascii=False, indent=2))
        
        # 保存更新后的 cookies
        full_cookies = ctx.cookies()
        updated_dict = {c["name"]: c["value"] for c in full_cookies if "xiaohongshu.com" in c.get("domain", "")}
        with open(COOKIE_PATH, "w", encoding="utf-8") as f:
            json.dump(updated_dict, f, ensure_ascii=False, indent=2)
        print(f"✅ 已持久化存储完整小红书 Cookies (共 {len(updated_dict)} 项)")
        
        browser.close()

if __name__ == "__main__":
    test_login()
