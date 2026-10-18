# -*- coding: utf-8 -*-
"""
将用户提供的豆瓣 Cookie 注入到持久化 Profile，并测试登录态
"""
import os, sys, time
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

RAW_COOKIE = """viewed="27125958"; bid=fwFMj9VLbYE; _vwo_uuid_v2=DDF31F6BC43B7201BB162FEAFF86ABE3E|824ee54fb9fb3a3fd7acea90c5a2ad36; __utmz=30149280.1785745896.1.1.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ll="108288"; _pk_id.100001.8cb4=ffce6ae346d36118.1788855193.; _pk_ses.100001.8cb4=1; __utma=30149280.381283800.1785745896.1785745896.1788855195.2; __utmc=30149280; __utmt=1; ck=0ju9; ap_v=0,6.0; push_noty_num=0; push_doumail_num=0; __utmv=30149280.13200; __utmb=30149280.23.9.1788855412216"""

# 解析成 playwright cookie 格式
cookie_list = []
for part in RAW_COOKIE.strip().strip("'").strip('"').split(";"):
    part = part.strip()
    if not part or "=" not in part:
        continue
    k, v = part.split("=", 1)
    cookie_list.append({
        "name": k.strip(),
        "value": v.strip(),
        "domain": ".douban.com",
        "path": "/"
    })

print(f"解析到 {len(cookie_list)} 个 Cookie 项:")
for c in cookie_list:
    print(f"  {c['name']} = {c['value'][:25]}...")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    # 注入 cookies
    ctx.add_cookies(cookie_list)
    
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    print("访问豆瓣首页验证登录态...")
    page.goto("https://www.douban.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    
    # 检查用户信息
    user_info = page.evaluate("""() => {
        const userLink = document.querySelector('.nav-user-account a, a[href*="/people/"]');
        const loginBtn = document.querySelector('a[href*="login"], .nav-login');
        return {
            hasUserLink: !!userLink,
            userName: userLink ? userLink.innerText.trim() : null,
            userHref: userLink ? userLink.href : null,
            hasLoginBtn: !!loginBtn
        };
    }""")
    print("用户信息检查结果:", user_info)
    
    page.screenshot(path="tools/backlinks/douban_injected_verify.png")
    
    # 保存所有的 cookies 以备后用
    all_cookies = ctx.cookies()
    has_dbcl2 = any(c['name'] == 'dbcl2' for c in all_cookies)
    print("当前所有 Cookie 中是否含有 dbcl2:", has_dbcl2)
    
    ctx.close()
