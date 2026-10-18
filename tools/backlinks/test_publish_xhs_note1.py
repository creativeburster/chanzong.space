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

def publish():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问小红书发布页面...")
        page.goto("https://creator.xiaohongshu.com/publish/publish", timeout=35000)
        time.sleep(3)
        
        print("2. 切换至【上传图文】Tab...")
        page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('*'));
            const tab = els.find(el => (el.innerText || '').trim() === '上传图文' && el.children.length === 0);
            if (tab) tab.click();
        }""")
        time.sleep(2)
        
        print("3. 上传宣纸卡片配图...")
        file_input = page.query_selector("input[type='file']")
        file_input.set_input_files(card_path)
        print("等待图片上传并渲染表单 (5s)...")
        time.sleep(5)
        
        print("4. 关闭【我知道了】引导浮层...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('*'));
            for (const b of btns) {
                const txt = (b.innerText || '').trim();
                if (txt === '我知道了' && b.children.length === 0) {
                    b.click();
                    break;
                }
            }
        }""")
        time.sleep(1)
        
        title = "读懂六祖坛经，瞬间放下内耗"
        print(f"5. 填写标题: {title}...")
        page.evaluate("""(t) => {
            const inp = document.querySelector('input.d-text, input[placeholder*="标题"]');
            if (inp) {
                inp.value = t;
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""", title)
        time.sleep(0.5)
        
        print("6. 填写正文与话题...")
        content_text = """“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于随时会消失的虚名浮利。

六祖惠能大师告诉我们：自性本自清净，本不生灭，本自具足。
遇到心烦意乱的时候，静下来问问自己：本来无一物，那些烦恼究竟安立在何处？把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #每日一悟 #消除精神内耗"""

        editor = page.query_selector('.tiptap.ProseMirror, div[contenteditable="true"]')
        if editor:
            editor.click()
            for line in content_text.split("\n"):
                if not line.strip():
                    page.keyboard.press("Enter")
                    continue
                page.keyboard.insert_text(line.strip())
                page.keyboard.press("Enter")
                time.sleep(0.04)
            time.sleep(1)
            page.keyboard.press("Escape")
            time.sleep(1)
            
        print("7. 🎯 精准点击红色【发布】按钮 (749, 854)...")
        page.mouse.click(749, 854)
        print("已触发鼠标物理点击 (749, 854)！")
        
        print("等待小红书服务端提交响应 (10s)...")
        time.sleep(10)
        
        out_screen = os.path.join(CUR_DIR, "xhs_post1_final_result.png")
        page.screenshot(path=out_screen)
        print(f"发布后截图已保存: {out_screen}")
        print(f"发布后页面 URL: {page.url}")
        print(f"发布后页面 Title: {page.title()}")
        
        ctx.close()

if __name__ == "__main__":
    publish()
