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
    
    # 获取所有的 .creator-tab
    tabs = page.locator(".creator-tab")
    tab_count = tabs.count()
    print(f"找到 {tab_count} 个 .creator-tab")
    
    # 找到可见的那个“上传图文”
    for i in range(tab_count):
        tab = tabs.nth(i)
        txt = tab.inner_text().strip()
        print(f"Tab [{i}]: {txt}")
        if "上传图文" in txt and tab.is_visible():
            print(f"点击可见的 Tab [{i}]: {txt}...")
            tab.click()
            break
            
    time.sleep(3)
    page.screenshot(path="tools/backlinks/xhs_nth_tab_clicked.png")
    
    # 检查当前页面的 file input
    file_input = page.locator("input[type='file']").first
    print("File input visible:", file_input.is_visible() if file_input.count() > 0 else "None")
    
    if file_input.count() > 0:
        file_input.set_input_files(CARD_PATH)
        print("图片已注入，等待表单加载...")
        time.sleep(6)
        
    page.screenshot(path="tools/backlinks/xhs_form_after_upload.png")
    
    # 检查标题输入框
    title_box = page.locator("input.d-text, input[placeholder*='标题']").first
    print("Title box count:", title_box.count())
    if title_box.count() > 0:
        title_box.fill("读懂六祖坛经，瞬间放下内耗")
        print("标题填写成功！")
        
    # 检查正文输入框
    desc_box = page.locator("div.tiptap.ProseMirror, div[contenteditable='true']").first
    print("Desc box count:", desc_box.count())
    if desc_box.count() > 0:
        desc_box.click()
        desc_box.fill("""“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为事情本身，而是心在向外攀缘。
六祖惠能大师开示：自性本自清净，本不生灭，本自具足。
遇事向内反观，本来无一物，烦恼从何处安立？万般放下，当下自在。

📖 典籍全文导读与法脉知识图谱：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #消除精神内耗""")
        print("正文填写成功！")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(1)
        
    # 查找并点击底部的红色【发布】按钮
    # 在刚才的截图中，按钮类名含有 bg-red 或 text 是 发布
    submit_btn = page.locator("button:has-text('发布'), .publishBtn, button.bg-red").last
    print("Submit btn count:", submit_btn.count(), "text:", submit_btn.inner_text() if submit_btn.count() > 0 else "")
    if submit_btn.count() > 0:
        submit_btn.scroll_into_view_if_needed()
        time.sleep(1)
        submit_btn.click()
        print("已点击【发布】按钮！等待 8 秒...")
        time.sleep(8)
        
    page.screenshot(path="tools/backlinks/xhs_final_success.png")
    print("最终当前 URL:", page.url)
    browser.close()
