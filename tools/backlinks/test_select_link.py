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
    
    page.goto(REVIEW_EDIT_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 选中文本中的 "禅宗知识库"
    selected = page.evaluate("""() => {
        const editor = document.querySelector('.public-DraftEditor-content');
        if (!editor) return false;
        
        // 寻找包含 "禅宗知识库" 的文本节点
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
    
    # 点击链接按钮
    page.click('.DRE-ui-button-link')
    time.sleep(2)
    page.screenshot(path="tools/backlinks/douban_selected_link_clicked.png")
    
    pop_check = page.evaluate("""() => {
        const pops = Array.from(document.querySelectorAll('input, [class*="pop"], [class*="tooltip"], [class*="dialog"], form')).map(el => ({
            tag: el.tagName,
            type: el.type,
            placeholder: el.placeholder,
            className: el.className,
            text: el.innerText ? el.innerText.trim() : ''
        }));
        return pops;
    }""")
    print("弹出的元素/输入框:", json.dumps(pop_check, ensure_ascii=False, indent=2))
    
    ctx.close()
