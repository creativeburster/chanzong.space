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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
CARD_PATH = os.path.join(CUR_DIR, "xhs_cards", "card_tanjing.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"} for k, v in cd.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded")
    time.sleep(3)
    
    # 动态定位【上传图文】
    tab_box = page.evaluate("""() => {
        const spans = Array.from(document.querySelectorAll('span, div'));
        for (const s of spans) {
            if (s.children.length === 0 && s.innerText.trim() === '上传图文') {
                const r = s.getBoundingClientRect();
                if (r.width > 0 && r.left > 0) {
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                }
            }
        }
        return null;
    }""")
    print("上传图文坐标:", tab_box)
    if tab_box:
        page.mouse.click(tab_box["x"], tab_box["y"])
        time.sleep(2)
        
    # 上传图片
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if file_input:
        file_input.set_input_files(CARD_PATH)
        print("图片已注入，等待表单完全加载...")
        # 等待标题输入框出现
        page.wait_for_selector('input.d-text, input[placeholder*="标题"]', timeout=15000)
        print("✅ 标题输入框已加载！")
        time.sleep(2)
        
    # 填写标题
    title_el = page.query_selector('input.d-text, input[placeholder*="标题"]')
    if title_el:
        title_el.fill("读懂六祖坛经，瞬间放下内耗")
        time.sleep(1)
        
    # 填写正文
    desc_el = page.query_selector('div.tiptap.ProseMirror, div[contenteditable="true"]')
    if desc_el:
        desc_el.click()
        content = """“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是我们的心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于那些随时会消失的虚名浮利。

六祖惠能大师告诉我们：自性本自清净，本不生灭，本自具足。
遇到心烦意乱的时候，静下来问问自己：本来无一物，那些烦恼究竟安立在何处？把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #消除精神内耗"""
        for line in content.split("\n"):
            if not line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(line.strip())
            page.keyboard.press("Enter")
            time.sleep(0.1)
        time.sleep(1)
        page.keyboard.press("Escape")
        time.sleep(1)
        
    # 查找【发布】按钮的准确信息并直接触发点击
    publish_res = page.evaluate("""() => {
        const all = Array.from(document.querySelectorAll('*'));
        // 寻找包含“发布”文字的最深层元素
        const pEls = all.filter(el => el.innerText && el.innerText.trim() === '发布');
        if (pEls.length > 0) {
            const target = pEls[pEls.length - 1]; // 最深层匹配
            const r = target.getBoundingClientRect();
            target.click();
            return {
                clicked: true,
                tag: target.tagName,
                className: target.className,
                rect: { x: r.x, y: r.y, w: r.width, h: r.height }
            };
        }
        return { clicked: false };
    }""")
    print("点击【发布】结果:", json.dumps(publish_res, ensure_ascii=False, indent=2))
    
    # 等待并截图
    time.sleep(8)
    page.screenshot(path="tools/backlinks/xhs_publish_result.png")
    print("当前 URL:", page.url)
    browser.close()
