# -*- coding: utf-8 -*-
import json
import time
import os
import sys
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
CARD_PATH = os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 1. 完美切换【上传图文】
    print("[1/4] 切换【上传图文】Tab...")
    page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab'));
        for (const t of tabs) {
            if (t.innerText.includes('上传图文')) {
                t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                break;
            }
        }
    }""")
    time.sleep(2)
    
    # 2. 上传图片文件
    print(f"[2/4] 上传卡片配图: {CARD_PATH}...")
    file_input = page.query_selector("input[type='file']")
    if file_input:
        file_input.set_input_files(CARD_PATH)
        print("图片已注入，等待表单加载...")
        time.sleep(6)
        
    # 3. 填写标题与正文
    print("[3/4] 填写标题与正文...")
    page.evaluate("""() => {
        const titleInp = document.querySelector('input.d-text, input[placeholder*="标题"]');
        if (titleInp) {
            titleInp.value = '读懂六祖坛经，瞬间放下内耗';
            titleInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }""")
    time.sleep(1)
    
    # 正文通过 ProseMirror 注入
    desc_area = page.query_selector("div.tiptap.ProseMirror, div[contenteditable='true']")
    if desc_area:
        desc_area.click()
        content = """“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是我们的心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于那些随时会消失的虚名浮利。

六祖惠能大师告诉我们：
自性本自清净，本不生灭，本自具足。

遇到心烦意乱的时候，静下来问问自己：本来无一物，那些烦恼究竟安立在何处？
把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #消除精神内耗"""
        for line in content.split("\n"):
            if not line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(line.strip())
            page.keyboard.press("Enter")
            time.sleep(0.05)
        time.sleep(1)
        # 按 Escape 关闭任何话题浮层
        page.keyboard.press("Escape")
        time.sleep(1)
        
    page.screenshot(path="tools/backlinks/xhs_flow_ready.png")
    
    # 4. 探查并点击红色【发布】按钮
    print("[4/4] 寻找并点击红色【发布】按钮...")
    click_res = page.evaluate("""() => {
        // 在所有元素中查找纯文本为“发布”的节点
        const all = Array.from(document.querySelectorAll('*'));
        const matches = all.filter(el => {
            const txt = el.innerText ? el.innerText.trim() : '';
            return txt === '发布' && el.children.length === 0;
        });
        
        if (matches.length > 0) {
            const btn = matches[matches.length - 1]; // 取最内层
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return {
                clicked: true,
                tag: btn.tagName,
                class: btn.className,
                parentTag: btn.parentElement ? btn.parentElement.tagName : null,
                parentClass: btn.parentElement ? btn.parentElement.className : null
            };
        }
        return { clicked: false, totalMatches: matches.length };
    }""")
    print("发布点击结果:", json.dumps(click_res, ensure_ascii=False, indent=2))
    
    print("等待发布提交处理 (8s)...")
    time.sleep(8)
    page.screenshot(path="tools/backlinks/xhs_flow_submitted.png")
    print("发布后页面 URL:", page.url)
    
    browser.close()
