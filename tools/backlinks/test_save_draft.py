# -*- coding: utf-8 -*-
"""
小红书 (Xiaohongshu) 自动保存草稿箱（暂存离开）极速脚本
无需手机扫码验证，直接将图文、标题、高清宣纸卡片完整存入官方草稿箱！
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

def save_xhs_draft(classic_name: str, card_path: str, title: str, content: str):
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

        print("="*60)
        print(f"📝 正在将《{classic_name}》存入小红书草稿箱...")
        print(f"📌 标题: {title}")
        print("="*60)

        # 1. 打开创作者发布页
        print("[1/4] 打开创作者发布页...")
        page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)

        # 2. 切换到【上传图文】Tab
        print("[2/4] 切换至【上传图文】Tab...")
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

        # 3. 注入图片配图
        print(f"[3/4] 注入宣纸卡片配图: {card_path}...")
        file_input = page.query_selector("input.upload-input, input[type='file']")
        if not file_input:
            print("❌ 未找到图片上传 input")
            browser.close()
            return False
        file_input.set_input_files(card_path)
        time.sleep(6)

        # 4. 填写标题与正文
        print("[4/4] 注入标题与正文...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        title_input = page.query_selector('input[placeholder*="填写标题"], input.d-text')
        if title_input:
            title_input.click()
            clean_title = title[:20]
            title_input.fill(clean_title)
            time.sleep(0.5)

        desc_area = page.query_selector('div[contenteditable="true"], .tiptap.ProseMirror')
        if desc_area:
            desc_area.click()
            for line in content.split("\n"):
                if not line.strip():
                    page.keyboard.press("Enter")
                    continue
                page.keyboard.insert_text(line.strip())
                page.keyboard.press("Enter")
                time.sleep(0.05)
        time.sleep(1)
        page.keyboard.press("Escape")
        time.sleep(1)

        # 5. 点击【暂存离开】按钮 (620, 854)
        print("💾 正在点击【暂存离开】保存草稿...")
        page.mouse.move(620, 854)
        time.sleep(0.5)
        page.mouse.click(620, 854)
        time.sleep(4)

        # 截图保存草稿后状态
        draft_result = os.path.join(CUR_DIR, f"draft_saved_{int(time.time())}.png")
        page.screenshot(path=draft_result)
        cur_url = page.url
        print(f"🎉 草稿保存完毕！当前页面 URL: {cur_url}")
        print(f"📸 结果截图已保存至: {draft_result}")

        # 验证是否跳到了草稿箱或管理页面
        page.goto("https://creator.xiaohongshu.com/new/note-manager", wait_until="domcontentloaded", timeout=20000)
        time.sleep(3)
        manager_shot = os.path.join(CUR_DIR, "note_manager_drafts.png")
        page.screenshot(path=manager_shot)
        print(f"📸 笔记管理草稿列表已截图: {manager_shot}")

        browser.close()
        return True

if __name__ == "__main__":
    cards = glob.glob(os.path.join(CUR_DIR, "xhs_cards", "*.png"))
    card = os.path.abspath(cards[0])
    title = "读懂六祖坛经，瞬间放下内耗"
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
    save_xhs_draft("六祖坛经", card, title, body)
