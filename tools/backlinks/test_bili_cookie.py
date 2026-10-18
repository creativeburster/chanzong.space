# -*- coding: utf-8 -*-
import os, sys, time, json
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

RAW = """buvid3=C8101220-2DB4-B00C-F744-7C42C3FAB6FC81051infoc; b_nut=1788856981; _uuid=2C12E921-4EDA-2788-8168-1F4B94D1F2DF81907infoc; buvid4=98BEEE75-AD56-E1DD-2BB3-9A9AF2B42CC783934-126090816-5Uzezra3eE6njWDeDMpXrQ%3D%3D; buvid_fp=2b6f585c0877cda65798b417a3bfbbe1; home_feed_column=4; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; bmg_af_sc={"none":{"on":1,"def":"i1.hdslb.com"},"sgp":{"on":1,"def":"i1-sgp.hdslb.com"}}; lang=zh-Hans; bili_jct=828d9ce4b8171727cd6e41fe223307c0; DedeUserID=520219006; DedeUserID__ckMd5=0c271d43cea6e684; theme-tip-show=SHOWED; CURRENT_FNVAL=2000; theme-avatar-tip-show=SHOWED; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODkxMTYyMzcsImlhdCI6MTc4ODg1Njk3NywicGx0IjotMX0.MCbkwWGSPbgSMcUJhLGPv3wC4XcHITVmw2EVnb29eP0; bili_ticket_expires=1789116177; sid=go7sjikg; b_lsid=987C2B4C_1A08031B73E; browser_resolution=1137-1819"""

cookie_list = []
for part in RAW.strip().split(";"):
    part = part.strip()
    if not part or "=" not in part:
        continue
    k, v = part.split("=", 1)
    cookie_list.append({
        "name": k.strip(),
        "value": v.strip(),
        "domain": ".bilibili.com",
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
    
    page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    status = page.evaluate("""() => {
        const avatar = document.querySelector('.header-avatar-wrap, .v-popover-wrap .mini-avatar--small, .header-entry-avatar, .header-avatar');
        const username = document.querySelector('.header-avatar-wrap, .nickname');
        const loginBtn = Array.from(document.querySelectorAll('a, button, span')).find(el => el.innerText && el.innerText.trim() === '登录');
        return {
            hasAvatar: !!avatar,
            hasLoginBtn: !!loginBtn,
            title: document.title
        };
    }""")
    print("注入后检测结果:", status)
    page.screenshot(path="tools/backlinks/bilibili_injected_status.png")
    ctx.close()
