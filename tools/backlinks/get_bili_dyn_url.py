# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

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
    
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 提取第一条动态中的直链
    dyn_info = page.evaluate("""() => {
        const item = document.querySelector('.bili-dyn-item, .bili-dyn-list__item');
        if (!item) return null;
        
        // 寻找时间链接或卡片链接
        const links = Array.from(item.querySelectorAll('a')).map(a => ({
            text: a.innerText.trim(),
            href: a.href
        }));
        
        const timeEl = item.querySelector('.bili-dyn-time, [class*="publish-time"], [class*="time"]');
        
        return {
            links: links,
            timeElText: timeEl ? timeEl.innerText.trim() : null,
            timeElHref: timeEl ? (timeEl.href || (timeEl.closest('a') ? timeEl.closest('a').href : null)) : null
        };
    }""")
    print("动态信息提取:", json.dumps(dyn_info, ensure_ascii=False, indent=2))
    
    # 也访问个人主页 https://space.bilibili.com/520219006/dynamic 看看
    page.goto("https://space.bilibili.com/520219006/dynamic", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    space_dyns = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a[href*="/opus/"], a[href*="t.bilibili.com/"]')).map(a => a.href);
        return links;
    }""")
    print("个人空间动态直链:", space_dyns)
    
    target_dyn_url = None
    if dyn_info and dyn_info.get("timeElHref"):
        target_dyn_url = dyn_info["timeElHref"]
    elif space_dyns:
        target_dyn_url = space_dyns[0]
    elif dyn_info and dyn_info.get("links"):
        for l in dyn_info["links"]:
            if "opus" in l["href"] or "t.bilibili.com" in l["href"]:
                target_dyn_url = l["href"]
                break
                
    print(f"动态最终独立直链: {target_dyn_url}")
    
    if target_dyn_url:
        page.goto(target_dyn_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/bilibili_dynamic_1_detail.png")
        print("独立详情页截图已保存: tools/backlinks/bilibili_dynamic_1_detail.png")
        
    ctx.close()
