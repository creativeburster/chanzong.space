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

RAW_COOKIES = """buvid3=C8101220-2DB4-B00C-F744-7C42C3FAB6FC81051infoc; b_nut=1788856981; _uuid=2C12E921-4EDA-2788-8168-1F4B94D1F2DF81907infoc; buvid4=98BEEE75-AD56-E1DD-2BB3-9A9AF2B42CC783934-126090816-5Uzezra3eE6njWDeDMpXrQ%3D%3D; buvid_fp=2b6f585c0877cda65798b417a3bfbbe1; home_feed_column=4; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; bmg_af_sc={"none":{"on":1,"def":"i1.hdslb.com"},"sgp":{"on":1,"def":"i1-sgp.hdslb.com"}}; lang=zh-Hans; bili_jct=828d9ce4b8171727cd6e41fe223307c0; DedeUserID=520219006; DedeUserID__ckMd5=0c271d43cea6e684; theme-tip-show=SHOWED; CURRENT_FNVAL=2000; theme-avatar-tip-show=SHOWED; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODkxMTYyMzcsImlhdCI6MTc4ODg1Njk3NywicGx0IjotMX0.MCbkwWGSPbgSMcUJhLGPv3wC4XcHITVmw2EVnb29eP0; bili_ticket_expires=1789116177; sid=go7sjikg; b_lsid=987C2B4C_1A08031B73E; browser_resolution=1137-1819"""

SESSDATA = "dae03916%2C1804409012%2Ce0118%2A91CjB5TQG4qMcWG1C00LYFvBoO6_FOiCv98EsA0dfaBe1CQadfI1j4Rdh9JtciNng6lAkSVjZ6QlJiUWtscXUtWm5KZUYyY2h3bFlLQ1hTemZiUmhpNWg3YS15YnE5N0JUQzU4TWhjblg2ZXdxNzhMRlJFRUs0VU4wbGNOOUFQejFqRHZmN0UxZlVBIIEC"

cookie_list = []
for part in RAW_COOKIES.strip().split(";"):
    part = part.strip()
    if not part or "=" not in part:
        continue
    k, v = part.split("=", 1)
    cookie_list.append({
        "name": k.strip(),
        "value": v.strip(),
        "domain": ".bilibili.com",
        "path": "/",
        "expires": int(time.time()) + 365 * 86400
    })

# 显式加入 SESSDATA
cookie_list.append({
    "name": "SESSDATA",
    "value": SESSDATA,
    "domain": ".bilibili.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "expires": int(time.time()) + 365 * 86400
})

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "w", encoding="utf-8") as f:
    json.dump(cookie_list, f, ensure_ascii=False, indent=2)

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
    
    print("正在访问 Bilibili 主页验证登录态...")
    page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    
    # 探测头像、昵称或未登录按钮
    user_info = page.evaluate("""() => {
        const avatar = document.querySelector('.header-avatar-wrap, .v-popover-wrap .mini-avatar--small, .header-entry-avatar, img.header-avatar__img, .bili-avatar');
        const loginBtn = Array.from(document.querySelectorAll('a, button, span')).find(el => el.innerText && el.innerText.trim() === '登录');
        const navItems = Array.from(document.querySelectorAll('.right-entry-item, .v-popover-wrap')).map(el => el.innerText.trim());
        return {
            title: document.title,
            hasAvatar: !!avatar,
            avatarSrc: avatar ? avatar.src : null,
            hasLoginBtn: !!loginBtn,
            navItems: navItems.slice(0, 8)
        };
    }""")
    print("B站登录态验证结果:", json.dumps(user_info, ensure_ascii=False, indent=2))
    
    page.screenshot(path=os.path.join(CUR_DIR, "bilibili_login_full_success.png"))
    print("截图已保存至: tools/backlinks/bilibili_login_full_success.png")
    
    # 也访问一下个人空间
    my_space_url = f"https://space.bilibili.com/{520219006}"
    print(f"访问个人空间: {my_space_url}")
    page.goto(my_space_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    space_info = page.evaluate("""() => {
        const name = document.querySelector('#h-name, .nickname, .user-name');
        return {
            userName: name ? name.innerText.trim() : null,
            title: document.title
        };
    }""")
    print("个人空间信息:", space_info)
    page.screenshot(path=os.path.join(CUR_DIR, "bilibili_my_space.png"))
    
    ctx.close()
