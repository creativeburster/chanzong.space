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

REVIEW_EDIT_URL = "https://book.douban.com/review/17808304/edit"
TARGET_LINK = "https://chanzong.space/classics/xinjing"

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
    
    print(f"打开修改页面: {REVIEW_EDIT_URL}")
    page.goto(REVIEW_EDIT_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 选中 "禅宗知识库"
    selected = page.evaluate("""() => {
        const editor = document.querySelector('.public-DraftEditor-content');
        if (!editor) return false;
        
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            const idx = node.textContent.indexOf('禅宗知识库');
            if (idx !== -1) {
                const range = document.createRange();
                range.setStart(node, idx);
                range.setEnd(node, idx + 5);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                return true;
            }
        }
        return false;
    }""")
    print("选中文本结果:", selected)
    time.sleep(1)
    
    # 点击工具栏的链接按钮
    page.click('.DRE-ui-button-link')
    time.sleep(1.5)
    
    # 在链接输入框中输入目标网址
    link_input = page.query_selector('.DRE-popup-form-link input[placeholder="链接"], input[placeholder="链接"]')
    if link_input:
        print("找到链接输入框，填入:", TARGET_LINK)
        link_input.click()
        link_input.fill(TARGET_LINK)
        time.sleep(1)
        
        # 点击确定按钮
        confirm_btn = page.query_selector('.DRE-popup-form-submit button, button.DRE-popup-form-button-main, button:has-text("确定")')
        if confirm_btn:
            print("点击确定按钮...")
            confirm_btn.click()
            time.sleep(1.5)
            
    page.screenshot(path="tools/backlinks/douban_link_applied.png")
    
    # 点击下一步
    btn_next = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
    if btn_next:
        print("点击下一步...")
        btn_next.click()
        time.sleep(2.5)
        
        # 在弹窗中点击发表
        publish_res = page.evaluate("""() => {
            const modal = document.querySelector('.DRE-dialog-container');
            if (!modal) return false;
            const btn = Array.from(modal.querySelectorAll('button, a')).find(el => el.innerText && el.innerText.trim() === '发表');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }""")
        print("点击发表更新:", publish_res)
        time.sleep(5)
        
    print("更新后当前 URL:", page.url)
    
    # 验证公开页面上是否出现 a 标签
    page.goto("https://book.douban.com/review/17808304/", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    a_tag_info = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('.review-content a, #link-report a, a[href*="chanzong"]')).map(a => ({
            text: a.innerText.trim(),
            href: a.href,
            target: a.target,
            outerHTML: a.outerHTML
        }));
        return links;
    }""")
    print("公开页面中的超链接检查:", json.dumps(a_tag_info, ensure_ascii=False, indent=2))
    page.screenshot(path="tools/backlinks/douban_review_anchor_live.png")
    
    ctx.close()
