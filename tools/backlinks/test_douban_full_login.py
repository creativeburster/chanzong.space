# -*- coding: utf-8 -*-
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

RAW_COOKIE = """viewed="27125958"; bid=fwFMj9VLbYE; _vwo_uuid_v2=DDF31F6BC43B7201BB162FEAFF86ABE3E|824ee54fb9fb3a3fd7acea90c5a2ad36; __utmz=30149280.1785745896.1.1.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ll="108288"; _pk_id.100001.8cb4=ffce6ae346d36118.1788855193.; _pk_ses.100001.8cb4=1; __utma=30149280.381283800.1785745896.1785745896.1788855195.2; __utmc=30149280; __utmt=1; ck=0ju9; ap_v=0,6.0; push_noty_num=0; push_doumail_num=0; __utmv=30149280.13200; __utmb=30149280.23.9.1788855412216; dbcl2="132002368:wRr9F8J/0EE\""""

cookie_list = []
for part in RAW_COOKIE.strip().split(";"):
    part = part.strip()
    if not part or "=" not in part:
        continue
    k, v = part.split("=", 1)
    k = k.strip()
    v = v.strip()
    cookie_list.append({
        "name": k,
        "value": v,
        "domain": ".douban.com",
        "path": "/"
    })

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookie_list)
    
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://www.douban.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    
    page.screenshot(path="tools/backlinks/douban_login_full_success.png")
    print("截图已保存至: tools/backlinks/douban_login_full_success.png")
    
    # 检查用户名和链接
    info = page.evaluate("""() => {
        const topUser = document.querySelector('.nav-user-account .bn-more span, .top-nav-info a');
        const userLink = document.querySelector('a[href*="/people/"]');
        return {
            title: document.title,
            userText: topUser ? topUser.innerText.trim() : null,
            userHref: userLink ? userLink.href : null
        };
    }""")
    print("豆瓣账号信息:", info)
    
    ctx.close()
