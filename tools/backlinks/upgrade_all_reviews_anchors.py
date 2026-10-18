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

UPGRADE_TASKS = [
    {
        "edit_url": "https://book.douban.com/review/17808301/edit",
        "live_url": "https://book.douban.com/review/17808301/",
        "target_link": "https://chanzong.space/classics/tanjing",
        "name": "六祖坛经"
    },
    {
        "edit_url": "https://book.douban.com/review/17808303/edit",
        "live_url": "https://book.douban.com/review/17808303/",
        "target_link": "https://chanzong.space/classics/jingangjing",
        "name": "金刚经"
    }
]

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
    
    for task in UPGRADE_TASKS:
        print(f"\n正在处理 [{task['name']}] 锚文本超链接绑定: {task['edit_url']}")
        page.goto(task['edit_url'], wait_until="domcontentloaded", timeout=30000)
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
        print("选中文本:", selected)
        time.sleep(1)
        
        if selected:
            page.click('.DRE-ui-button-link')
            time.sleep(1.5)
            
            link_input = page.query_selector('.DRE-popup-form-link input[placeholder="链接"], input[placeholder="链接"]')
            if link_input:
                link_input.click()
                link_input.fill(task['target_link'])
                time.sleep(1)
                
                confirm_btn = page.query_selector('.DRE-popup-form-submit button, button.DRE-popup-form-button-main, button:has-text("确定")')
                if confirm_btn:
                    confirm_btn.click()
                    time.sleep(1.5)
                    
            btn_next = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
            if btn_next:
                btn_next.click()
                time.sleep(2.5)
                
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
                print("点击发表:", publish_res)
                time.sleep(5)
                
        print(f"[{task['name']}] 更新完成，安全等待 15 秒...")
        time.sleep(15)
        
    ctx.close()
print("全部升级完成！")
