# -*- coding: utf-8 -*-
import os
import sys
import time
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

def probe_reply():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            user_agent=REAL_UA,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        url = "https://www.zhihu.com/question/2045925637215589197/answer/2062862747696735206"
        page.goto(url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        comment_btn = page.locator('.ContentItem-actions button:has-text("条评论")').first
        comment_btn.click()
        time.sleep(2.5)
        
        # 寻找第一个回复按钮
        reply_btn = page.locator('button:has-text("回复")').first
        print(f"准备点击第一个【回复】按钮...")
        reply_btn.click()
        time.sleep(2)
        
        page.screenshot(path=os.path.join(CUR_DIR, "zhihu_reply_clicked.png"))
        print("已保存点击回复后的截图: zhihu_reply_clicked.png")
        
        # 看看当前的 inputs
        inputs = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').all()
        print(f"点击回复后，找到可编辑输入框数: {len(inputs)}")
        for idx, inp in enumerate(inputs):
            print(f"输入框 {idx}: placeholder/text={inp.inner_text().strip()}")
            
        # 看看发布按钮
        pub_btns = page.locator('button:has-text("发布")').all()
        print(f"找到发布按钮数: {len(pub_btns)}")
        
        ctx.close()

if __name__ == "__main__":
    probe_reply()
