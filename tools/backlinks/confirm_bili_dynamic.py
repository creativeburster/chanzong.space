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
    
    print("正在打开 B 站动态主页...")
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    editor = page.query_selector('.bili-rich-textarea__inner')
    if editor:
        editor.click()
        time.sleep(0.5)
        page.keyboard.press("Control+A")
        time.sleep(0.2)
        page.keyboard.press("Backspace")
        time.sleep(0.5)
        
        for line in CONTENT.split("\n"):
            if line.strip():
                page.keyboard.type(line, delay=10)
            page.keyboard.press("Enter")
            time.sleep(0.2)
            
        time.sleep(1)
        page.keyboard.press("Space")
        time.sleep(1)
        
    # 点击发布
    pub_btn = page.query_selector('.bili-dyn-publishing__action')
    if pub_btn:
        print("点击发布动态...")
        pub_btn.click()
        time.sleep(2)
        
    # 检查弹出的规范确认框并点击“确认并发送”
    confirm_btn = page.query_selector('button:has-text("确认并发送"), div:has-text("确认并发送")')
    if confirm_btn:
        print("检测到规范协议弹窗，点击【确认并发送】...")
        confirm_btn.click()
        time.sleep(5)
    else:
        # fallback 查找所有包含确认并发送的元素
        page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '确认并发送');
            if (btn) btn.click();
        }""")
        time.sleep(5)
        
    page.screenshot(path="tools/backlinks/bilibili_dyn_sent.png")
    print("发布后截图已保存至: tools/backlinks/bilibili_dyn_sent.png")
    
    # 访问个人主页的动态标签
    my_dyn = "https://space.bilibili.com/520219006/dynamic"
    print(f"访问个人动态主页: {my_dyn}")
    page.goto(my_dyn, wait_until="domcontentloaded", timeout=30000)
    time.sleep(5)
    page.screenshot(path="tools/backlinks/bilibili_my_dyn_feed.png")
    
    # 抓取第一条动态的独立链接
    dyn_links = page.evaluate("""() => {
        const results = [];
        const items = document.querySelectorAll('.bili-dyn-item, .bili-dyn-list__item');
        for (const it of items) {
            const timeA = it.querySelector('.bili-dyn-item__publish-time, a[href*="/opus/"], a[href*="t.bilibili.com/"]');
            const content = it.querySelector('.bili-rich-text, .bili-dyn-content');
            if (timeA) {
                results.push({
                    text: content ? content.innerText.trim().slice(0, 80) : '',
                    url: timeA.href || (timeA.closest('a') ? timeA.closest('a').href : null)
                });
            }
        }
        if (results.length === 0) {
            // fallback
            const allLinks = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.match(/opus\/\d+/) || h.match(/t\.bilibili\.com\/\d+/));
            return allLinks;
        }
        return results;
    }""")
    print("最新动态抓取结果:", json.dumps(dyn_links, ensure_ascii=False, indent=2))
    
    ctx.close()
