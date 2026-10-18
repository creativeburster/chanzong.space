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

def probe():
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
        print(f"正在访问知乎目标回答: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        # 寻找回答下方的评论按钮
        comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
        if not comment_btn.is_visible(timeout=3000):
            print("向下滚动查找评论按钮...")
            page.mouse.wheel(0, 600)
            time.sleep(2)
            comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
            
        if comment_btn.is_visible():
            txt = comment_btn.inner_text().strip()
            print(f"找到评论按钮: {txt}，正在点击展开...")
            comment_btn.click()
            time.sleep(3)
            
            page.screenshot(path=os.path.join(CUR_DIR, "zhihu_drawer_probe.png"))
            print("已保存抽屉截图: zhihu_drawer_probe.png")
            
            # 统计评论项
            comment_items = page.locator('.CommentItemV2, .CommentItem, div[tabindex="-1"]').all()
            print(f"匹配到评论容器数: {len(comment_items)}")
            
            # 检查是否有“回复”按钮
            reply_btns = page.locator('button:has-text("回复")').all()
            print(f"找到【回复】按钮数: {len(reply_btns)}")
            for i, rb in enumerate(reply_btns[:5]):
                print(f"  回复按钮 {i+1}: visible={rb.is_visible()}, text={rb.inner_text().strip()}")
                
            # 检查主输入框
            main_inputs = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').all()
            print(f"找到可编辑输入框数: {len(main_inputs)}")
        else:
            print("❌ 未能找到评论按钮！")
            page.screenshot(path=os.path.join(CUR_DIR, "zhihu_drawer_not_found.png"))
            
        ctx.close()

if __name__ == "__main__":
    probe()
