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

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
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
    
    target_url = "https://book.douban.com/subject/3007708/new_review"
    page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 1. 探测打分星级
    stars = page.query_selector_all('span[id*="star"], .rating-star, span.star')
    print("找到星级元素数量:", len(stars))
    if not stars:
        # 尝试通过 querySelector 获取评价星级
        stars_info = page.evaluate("""() => {
            const el = document.querySelector('.rating, [class*="rate"], [class*="star"]');
            return el ? el.outerHTML : null;
        }""")
        print("评价星级容器 HTML:", stars_info)
    
    # 2. 点击第5颗星（力荐）
    # 在豆瓣中，星级通常是一个 rating 容器下的 span 或直接点击星星
    page.evaluate("""() => {
        const stars = document.querySelectorAll('span[id^="star"], [class*="star-"], .stars span');
        if (stars.length >= 5) {
            stars[4].click();
        } else {
            // 尝试直接找星星元素
            const allSpans = Array.from(document.querySelectorAll('span')).filter(s => s.innerText === '☆' || s.className.includes('star'));
            if (allSpans.length >= 5) allSpans[4].click();
        }
    }""")
    time.sleep(1)
    
    # 3. 输入标题
    title_box = page.query_selector('textarea[placeholder="添加标题"], input[placeholder="添加标题"]')
    if title_box:
        title_box.fill("直指人心见性成佛：读《六祖坛经》的现代心性观照")
        print("已填写标题")
    
    # 4. 输入正文
    editor = page.query_selector('div.public-DraftEditor-content')
    if editor:
        editor.click()
        time.sleep(0.5)
        # 用 insertText 或键盘打字
        page.keyboard.type("《六祖坛经》是禅宗的不朽圣典，直指本自清净自性。", delay=20)
        print("已在 DraftEditor 输入测试正文")
    
    time.sleep(2)
    page.screenshot(path="tools/backlinks/douban_draft_filled.png")
    
    # 5. 查找“下一步”按钮
    next_btn = page.query_selector('button:has-text("下一步"), a:has-text("下一步"), .btn-next')
    if next_btn:
        print("找到下一步按钮:", next_btn.inner_text())
        next_btn.click()
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_after_next.png")
        
        # 探测下一步弹窗或页面
        modal_info = page.evaluate("""() => {
            const modals = Array.from(document.querySelectorAll('.modal, .dialog, .popup, [role="dialog"], .review-modal, form')).map(m => ({
                text: m.innerText.trim().slice(0, 200),
                buttons: Array.from(m.querySelectorAll('button, a.btn, input[type="submit"]')).map(b => b.innerText.trim() || b.value)
            }));
            return {
                url: window.location.href,
                modals: modals
            };
        }""")
        print("下一步后页面状态:", json.dumps(modal_info, ensure_ascii=False, indent=2))
        
    ctx.close()
