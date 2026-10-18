# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

raw_cookie = """buvid3=C8101220-2DB4-B00C-F744-7C42C3FAB6FC81051infoc; b_nut=1788856981; _uuid=2C12E921-4EDA-2788-8168-1F4B94D1F2DF81907infoc; buvid4=98BEEE75-AD56-E1DD-2BB3-9A9AF2B42CC783934-126090816-5Uzezra3eE6njWDeDMpXrQ%3D%3D; buvid_fp=2b6f585c0877cda65798b417a3bfbbe1; lang=zh-Hans; DedeUserID=520219006; DedeUserID__ckMd5=0c271d43cea6e684; theme-tip-show=SHOWED; theme-avatar-tip-show=SHOWED; CURRENT_FNVAL=4048; CURRENT_QUALITY=0; rpdid=|(u~)Yk~)|Rk0J'u~)))l)))l; home_feed_column=4; hit-dyn-v2=1; bp_t_offset_520219006=1247445037483032576; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; bmg_af_sc={"none":{"on":1,"def":"i1.hdslb.com"},"sgp":{"on":1,"def":"i1-sgp.hdslb.com"}}; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTAzMTk0NzcsImlhdCI6MTc5MDA2MDIxNywicGx0IjotMX0.Mi5n415O-p1bxrCPQCACCSlZIRvB87hFJ78DoxO6Gfo; bili_ticket_expires=1790319417; SESSDATA=95471ec9%2C1805612284%2Cb0fe4%2A91CjC9kBMMWr4w5wSGACYjRl_sDJxogcNmqse1u2Rs87PNAK9RpdbW9iNWVMzNKYgy1jwSVjNBb1BfQlVUdUxVMjkzWG8zb3lSNVNyV1doWktTNXdkMEdhaEhSVF9ic1RuWUVZOW42VmF2ZnU1TEN1RkUwa0pQQVN5Vm1Bc1MzX09MVVRaT1FlWnJRIIEC; bili_jct=1fba5a08ddf91bae24195238e18f2c43; sid=q92tk4kh; browser_resolution=1132-1567; b_lsid=01778EB6_1A0C7ED3418"""

cookie_list = []
for item in raw_cookie.strip().split(';'):
    if '=' in item:
        k, v = item.strip().split('=', 1)
        cookie_list.append({'name': k, 'value': v, 'domain': '.bilibili.com', 'path': '/'})

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
profile_dir = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile")
out_json = os.path.join(PROJECT_ROOT, "tools", "backlinks", "bilibili_cookies.json")

with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(cookie_list, f, ensure_ascii=False, indent=2)

print('Saved bilibili_cookies.json successfully!')

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel='msedge',
        headless=True,
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
        args=['--disable-blink-features=AutomationControlled']
    )
    ctx.add_cookies(cookie_list)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto('https://t.bilibili.com', wait_until='domcontentloaded', timeout=30000)
    time.sleep(5)
    print('Bili Page Title:', page.title())
    print('Bili Page URL:', page.url)
    page.screenshot(path='scratch/bili_injected_verify.png')
    
    is_logged = 'passport' not in page.url and len(page.locator('.bili-rich-textarea__inner, .header-avatar-wrap, .mini-avatar').all()) > 0
    print('Bili Authenticated:', is_logged)
    ctx.close()
