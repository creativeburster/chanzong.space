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

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

CONTENT = """【禅宗心悟 · 明心见性】
六祖惠能大师开示：“菩提自性，本来清净；但用此心，直了成佛。”
常人修行总执着于外在身心拂拭与名相分别，却不知自性本自具足、能生万法。凡夫与佛，只在一念迷悟之间。不思善、不思恶，正与么时，即是本来面目。

📚《六祖法宝坛经》曹溪古本白话逐句详注与全景心性脉络图谱：
https://chanzong.space/classics/tanjing"""

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
    
    print("访问 B 站动态主页...", flush=True)
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    if editor:
        editor.click()
        time.sleep(0.5)
        # Ctrl+A 全选并清空
        page.keyboard.press("Control+A")
        time.sleep(0.2)
        page.keyboard.press("Backspace")
        time.sleep(0.5)
        
        # 逐段打字
        for line in CONTENT.split("\n"):
            if line.strip():
                page.keyboard.type(line, delay=10)
            page.keyboard.press("Enter")
            time.sleep(0.2)
            
        time.sleep(1)
        page.keyboard.press("Space")
        time.sleep(1)
        
    page.screenshot(path="tools/backlinks/bilibili_dyn_clean_ready.png")
    
    # 查找并点击发布按钮
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    if pub_btn:
        print("点击发布动态...", flush=True)
        pub_btn.click()
        time.sleep(5)
        
    page.screenshot(path="tools/backlinks/bilibili_dyn_published_check.png")
    
    # 访问个人动态主页提取最新动态 URL
    my_dyn = "https://space.bilibili.com/520219006/dynamic"
    print(f"访问个人动态页提取链接: {my_dyn}", flush=True)
    page.goto(my_dyn, wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    page.screenshot(path="tools/backlinks/bilibili_my_dyn_latest.png")
    
    latest_links = page.evaluate("""() => {
        const results = [];
        const links = Array.from(document.querySelectorAll('a[href*="/opus/"], a[href*="t.bilibili.com/"]'));
        for (const a of links) {
            const href = a.href;
            if (href && (href.includes('/opus/') || href.includes('t.bilibili.com/'))) {
                results.push({
                    text: a.innerText.trim().slice(0, 50),
                    url: href
                });
            }
        }
        return results;
    }""")
    print("提取到的动态独立链接列表:", json.dumps(latest_links, ensure_ascii=False, indent=2), flush=True)
    
    ctx.close()
