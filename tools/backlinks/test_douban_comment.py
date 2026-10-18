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

TARGET_REVIEW_URL = "https://book.douban.com/review/15226779/"

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
    
    print(f"正在访问书评页面: {TARGET_REVIEW_URL}")
    page.goto(TARGET_REVIEW_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 滚动到底部评论区
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    
    # 查找评论表单
    comment_area = page.evaluate("""() => {
        const textarea = document.querySelector('textarea[name="comment-app-textarea"], textarea#last, form.j-comment-form textarea, #comments textarea');
        const form = textarea ? textarea.closest('form') : null;
        const submit = form ? form.querySelector('input[type="submit"], button') : document.querySelector('input[value="加上去"]');
        return {
            hasTextarea: !!textarea,
            formAction: form ? form.action : null,
            submitText: submit ? (submit.value || submit.innerText) : null
        };
    }""")
    print("评论区表单情况:", comment_area)
    page.screenshot(path="tools/backlinks/douban_comment_form.png")
    
    ctx.close()
