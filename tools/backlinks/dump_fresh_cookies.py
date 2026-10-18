# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    bili_cookies = ctx.cookies("https://www.bilibili.com")
    weibo_cookies = ctx.cookies("https://weibo.com")
    
    # 打印 B 站 SESSDATA 和 bili_jct 的具体 expires
    now = time.time()
    for c in bili_cookies:
        if c['name'] in ['SESSDATA', 'bili_jct', 'DedeUserID']:
            exp = c.get('expires', 0)
            days_left = (exp - now) / 86400 if exp > 0 else 'Session'
            print(f"Bili {c['name']}: expires={exp}, days_left={days_left}")
            
    for c in weibo_cookies:
        if c['name'] in ['SUB', 'SUBP', 'WBPSESS']:
            exp = c.get('expires', 0)
            days_left = (exp - now) / 86400 if exp > 0 else 'Session'
            print(f"Weibo {c['name']}: expires={exp}, days_left={days_left}")
            
    # 将真实的 B 站 cookie 写入 bilibili_cookies.json
    with open("tools/backlinks/bilibili_cookies.json", "w", encoding="utf-8") as f:
        json.dump(bili_cookies, f, ensure_ascii=False, indent=2)
    print("Updated bilibili_cookies.json from browser_profile!")
    
    # 将真实的微博 cookie 写入 weibo_cookie.json
    wb_dict = {c['name']: c['value'] for c in weibo_cookies}
    with open("tools/backlinks/.browser_profile/weibo_cookie.json", "w", encoding="utf-8") as f:
        json.dump(wb_dict, f, ensure_ascii=False, indent=2)
    print("Updated weibo_cookie.json from browser_profile!")
    
    ctx.close()
