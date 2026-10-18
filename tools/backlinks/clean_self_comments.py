# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")

def check_bottom_and_delete():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        ctx = browser.new_context(locale="zh-CN")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())
        
        page.goto("https://book.douban.com/review/17808301/", timeout=30000)
        time.sleep(3)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        
        page.screenshot(path=os.path.join(CUR_DIR, "douban_review_comments_real_state.png"))
        print("已保存底部评论区截图: douban_review_comments_real_state.png")
        
        # 寻找评论内容和删除按钮
        comments_info = page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('.comment-item, .reply-doc, .reply-item'));
            return items.map(el => {
                const delA = el.querySelector('a[href*="remove"], a[onclick*="remove"], a:not([href])');
                return {
                    text: el.innerText.slice(0, 50),
                    delBtnText: delA ? delA.innerText : null
                };
            });
        }""")
        print("评论列表:", json.dumps(comments_info, ensure_ascii=False, indent=2))
        
        # 如果有删除按钮，点击删除
        del_btns = page.locator('.reply-doc a:has-text("删除"), .comment-item a:has-text("删除"), a[data-action="delete"]').all()
        print(f"匹配到评论删除按钮数: {len(del_btns)}")
        for b in del_btns:
            print("点击删除...")
            b.click()
            time.sleep(2)
            
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        page.screenshot(path=os.path.join(CUR_DIR, "douban_review_comments_after_delete.png"))
        
        browser.close()

if __name__ == "__main__":
    check_bottom_and_delete()
