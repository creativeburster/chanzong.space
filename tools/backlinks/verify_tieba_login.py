# -*- coding: utf-8 -*-
"""
验证百度贴吧登录态与账号信息
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)

cookies = []
for k, v in cd.items():
    cookies.append({"name": k, "value": v, "domain": ".baidu.com", "path": "/"})
    cookies.append({"name": k, "value": v, "domain": ".tieba.baidu.com", "path": "/"})
    cookies.append({"name": k, "value": v, "domain": "tieba.baidu.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("正在访问百度贴吧首页验证登录态...")
    page.goto("https://tieba.baidu.com/index.html", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)

    page.screenshot(path="tools/backlinks/tieba_home.png")
    
    # 提取用户信息
    user_info = page.evaluate("""() => {
        const nameEl = document.querySelector('.u_username_title, .user_name, a[href*="/home/main"], .u_login_name');
        const loginBtn = document.querySelector('a:has-text("登录"), .u_login');
        return {
            userName: nameEl ? nameEl.innerText.trim() : null,
            isLoggedIn: !loginBtn || !!nameEl,
            url: window.location.href,
            title: document.title
        };
    }""")
    
    print("贴吧首页探测结果:")
    print(json.dumps(user_info, ensure_ascii=False, indent=2))
    
    # 顺便访问一下六祖坛经吧
    print("\n正在访问【六祖坛经吧】...")
    page.goto("https://tieba.baidu.com/f?kw=%E5%85%AD%E7%A5%96%E5%9D%9B%E7%BB%8F", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/tieba_tanjing.png")
    
    tb_info = page.evaluate("""() => {
        const canPost = !!document.querySelector('.editor_textfield, #ueditor_replace, .tb-editor-editarea');
        const tbTitle = document.querySelector('.card_title_fname');
        return {
            barName: tbTitle ? tbTitle.innerText.trim() : '未知',
            canPost: canPost,
            url: window.location.href
        };
    }""")
    print("【六祖坛经吧】探测结果:")
    print(json.dumps(tb_info, ensure_ascii=False, indent=2))

    browser.close()
