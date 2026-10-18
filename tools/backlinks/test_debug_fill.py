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
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

web_session = "0400698c3c69a108722d159d0d384befa89e22"
a1 = "19eca63805fhheoju31sd200qbutsq3q159qcs91u50000381143"

cookies = [
    {"name": "web_session", "value": web_session, "domain": ".xiaohongshu.com", "path": "/"},
    {"name": "a1", "value": a1, "domain": ".xiaohongshu.com", "path": "/"},
    {"name": "web_session", "value": web_session, "domain": "creator.xiaohongshu.com", "path": "/"},
    {"name": "a1", "value": a1, "domain": "creator.xiaohongshu.com", "path": "/"}
]

card_path = os.path.abspath(os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png"))

def debug_fill():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 访问发布页...")
        page.goto("https://creator.xiaohongshu.com/publish/publish", timeout=35000)
        time.sleep(3)
        
        print("2. 切换图文 Tab...")
        page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('*'));
            const tab = els.find(el => (el.innerText || '').trim() === '上传图文' && el.children.length === 0);
            if (tab) tab.click();
        }""")
        time.sleep(2)
        
        print("3. 上传图片...")
        page.query_selector("input[type='file']").set_input_files(card_path)
        time.sleep(5)
        
        print("4. 物理点击关闭引导弹窗 (413, 565)...")
        page.mouse.click(413, 565)
        time.sleep(1)
        # 再点一次叉叉备用
        page.mouse.click(437, 277)
        time.sleep(1)
        
        print("5. 聚焦并填入标题...")
        # 寻找 placeholder 包含标题的 input
        title_input = page.wait_for_selector('input[placeholder*="标题"]', timeout=5000)
        title_input.click()
        time.sleep(0.3)
        title_input.fill("读懂六祖坛经，瞬间放下内耗")
        time.sleep(0.5)
        
        print("6. 聚焦并填入正文...")
        editor = page.wait_for_selector('div.tiptap.ProseMirror, div[contenteditable="true"]', timeout=5000)
        editor.click()
        time.sleep(0.3)
        
        content = """“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于随时会消失的虚名浮利。

六祖惠能大师告诉我们：自性本自清净，本不生灭，本自具足。
遇到心烦意乱的时候，静下来问问自己：本来无一物，那些烦恼究竟安立在何处？把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #每日一悟 #消除精神内耗"""

        for line in content.split("\n"):
            if not line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(line.strip())
            page.keyboard.press("Enter")
            time.sleep(0.03)
        time.sleep(1)
        page.keyboard.press("Escape")
        time.sleep(1)
        
        # 截图检查填充状态
        debug_screen = os.path.join(CUR_DIR, "xhs_debug_fill_success.png")
        page.screenshot(path=debug_screen)
        print(f"表单填充验证截图: {debug_screen}")
        
        print("7. 触发底部红色【发布】按钮点击 (749, 854)...")
        page.mouse.click(749, 854)
        print("已点击发布按钮！")
        
        time.sleep(8)
        final_screen = os.path.join(CUR_DIR, "xhs_debug_published.png")
        page.screenshot(path=final_screen)
        print(f"发布后页面截图: {final_screen}")
        print("当前页面 URL:", page.url)
        print("当前页面 Title:", page.title())
        
        ctx.close()

if __name__ == "__main__":
    debug_fill()
