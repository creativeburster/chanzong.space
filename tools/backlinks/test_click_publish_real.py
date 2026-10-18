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

def run():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        # 监听关键发布接口响应
        publish_responses = []
        def on_response(res):
            if any(k in res.url.lower() for k in ["publish", "note", "post", "create"]):
                try:
                    publish_responses.append({
                        "url": res.url[:100],
                        "status": res.status,
                        "text": res.text()[:200]
                    })
                except Exception:
                    pass
        page.on("response", on_response)
        
        print("1. 访问小红书发布页面...")
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
            
        print("7. 定位 xhs-publish-btn 并触发右侧【发布】物理点击...")
        box = page.locator('xhs-publish-btn').bounding_box()
        print("xhs-publish-btn box:", box)
        
        if box:
            # 按钮高度和宽度
            # 左侧是【暂存离开】，右侧是【发布】
            # 点击右侧 75% 处
            click_x = box['x'] + box['width'] * 0.75
            click_y = box['y'] + box['height'] * 0.5
            print(f"点击物理坐标: ({click_x}, {click_y})")
            
            # 滚动到该位置
            page.evaluate(f"window.scrollTo(0, {box['y'] - 300})")
            time.sleep(0.5)
            
            # 重新获取滚动后的 bounding_box
            box_after = page.locator('xhs-publish-btn').bounding_box()
            click_x = box_after['x'] + box_after['width'] * 0.75
            click_y = box_after['y'] + box_after['height'] * 0.5
            print(f"滚动后实际物理坐标: ({click_x}, {click_y})")
            
            page.mouse.click(click_x, click_y)
            print("已触发鼠标物理点击！")
        else:
            print("未获取到 xhs-publish-btn box")
            
        print("等待小红书发布提交响应 (10s)...")
        time.sleep(10)
        
        res_screen = os.path.join(CUR_DIR, "xhs_real_published_result.png")
        page.screenshot(path=res_screen)
        print(f"发布后截图已保存: {res_screen}")
        print(f"发布后页面 URL: {page.url}")
        print(f"发布后页面 Title: {page.title()}")
        
        print("关键网络请求响应:")
        for pr in publish_responses[-5:]:
            print(json.dumps(pr, ensure_ascii=False))
            
        ctx.close()

if __name__ == "__main__":
    run()
