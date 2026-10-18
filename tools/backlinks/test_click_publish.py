# -*- coding: utf-8 -*-
"""
小红书 (Xiaohongshu) 终极发布验证：通过精确像素中心 (749, 854) 模拟真实鼠标点击【发布】
"""
import os
import sys
import json
import time
import glob
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)

cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("[1/5] 打开小红书创作者发布页...")
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)

    print("[2/5] 切换至【上传图文】Tab...")
    page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab'));
        for (const t of tabs) {
            if (t.innerText.includes('上传图文')) {
                t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                break;
            }
        }
    }""")
    time.sleep(3)

    cards = glob.glob(os.path.join(CUR_DIR, "xhs_cards", "*.png"))
    card_path = os.path.abspath(cards[0])
    print(f"[3/5] 上传配图: {card_path}...")
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if not file_input:
        print("❌ 未找到图片上传 input！")
        browser.close()
        sys.exit(1)

    file_input.set_input_files(card_path)
    print("已注入图片文件，等待小红书服务端上传处理与表单渲染...")
    time.sleep(6)

    print("[4/5] 填写笔记标题与正文...")
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)

    title_input = page.query_selector('input[placeholder*="填写标题"], input.d-text')
    if title_input:
        title_input.click()
        time.sleep(0.5)
        title = "读懂六祖坛经，瞬间放下内耗"
        title_input.fill(title)
        print(f"已填写标题: {title}")
        time.sleep(1)

    desc_area = page.query_selector('div[contenteditable="true"], .tiptap.ProseMirror')
    if desc_area:
        desc_area.click()
        time.sleep(0.5)
        body = """“菩提本无树，明镜亦非台。
本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是我们的心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于那些随时会消失的虚名浮利。

六祖惠能大师告诉我们：
自性本自清净，本不生灭，本自具足。

遇到心烦意乱的时候，静下来问问自己：
本来无一物，那些烦恼究竟安立在何处？
把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #每日一悟 #消除精神内耗"""
        for line in body.split("\n"):
            if not line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(line.strip())
            page.keyboard.press("Enter")
            time.sleep(0.1)
        print("已成功注入正文与话题！")
        time.sleep(2)

    page.keyboard.press("Escape")
    time.sleep(1)

    print("[5/5] 瞄准红色发布按钮中心 (749, 854)，执行真实物理鼠标点击...")
    # 先移动鼠标过去触发 hover
    page.mouse.move(749, 854)
    time.sleep(0.5)
    # 点击
    page.mouse.click(749, 854)
    print("🚀 鼠标点击完成！等待小红书服务器响应与发布结果 (10s)...")
    time.sleep(10)

    # 截图保存结果
    page.screenshot(path="tools/backlinks/result_after_click.png")
    print("发布后当前 URL:", page.url)

    # 检查当前页面是否跳转，或者是否有成功提示
    current_url = page.url
    page_text = page.evaluate("() => document.body.innerText.slice(0, 500)")
    print("页面顶部文本摘要:", page_text.replace("\n", " ")[:200])

    browser.close()
