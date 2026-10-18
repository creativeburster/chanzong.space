# -*- coding: utf-8 -*-
"""
小红书 (Xiaohongshu DA 85+) 创作者中心自动化发帖与外链矩阵引擎
"""
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
sys.path.append(CUR_DIR)
from generate_xhs_card import create_zen_card
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

def publish_xhs_note(classic_name: str, quote: str, card_exp: str, title: str, content: str, target_url: str):
    # 1. 生成 3:4 禅意宣纸风高清卡片
    card_filename = f"card_{int(time.time())}.png"
    card_path = os.path.join(CUR_DIR, "xhs_cards", card_filename)
    print(f"🎨 正在生成小红书专属 3:4 禅意宣纸风卡片: {card_path}...")
    create_zen_card(classic_name, quote, card_exp, card_path)
    
    # 2. 读取小红书 cookies
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
    cookies = []
    for k, v in cookie_dict.items():
        cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
        cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})
        
    print("="*60)
    print("🚀 启动小红书创作者中心 (Xiaohongshu DA 85+) 自动化发布...")
    print(f"👉 笔记标题: {title}")
    print(f"👉 关联经典: 《{classic_name}》")
    print(f"👉 目标落地页: {target_url}")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 1. 访问小红书发布页面
        print("[1/5] 打开小红书创作者发布页...")
        page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=35000)
        time.sleep(4)
        
        # 2. 切换到【上传图文】Tab
        print("[2/5] 切换至【上传图文】Tab...")
        page.mouse.click(425, 95)
        time.sleep(3)
        
        # 3. 上传图片
        print(f"[3/5] 上传配图: {card_path}...")
        file_input = page.query_selector("input.upload-input, input[type='file']")
        if not file_input:
            print("⚠️ 未找到图片上传 input！")
            browser.close()
            return False
            
        file_input.set_input_files(card_path)
        print("已注入图片文件，等待小红书服务端上传处理与表单渲染...")
        time.sleep(6)
        
        # 4. 填写标题与正文
        print("[4/5] 填写笔记标题与正文...")
        # 向上滚动以聚焦标题输入框
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)
        
        title_input = page.query_selector('input[placeholder*="填写标题"], input.d-text, input[class*="title"]')
        if title_input:
            title_input.click()
            time.sleep(0.5)
            # 填入标题（小红书标题限 20 字）
            clean_title = title[:20]
            title_input.fill(clean_title)
            time.sleep(1)
            print(f"已填写标题: {clean_title}")
            
        desc_area = page.query_selector('div[contenteditable="true"], .tiptap.ProseMirror, textarea[placeholder*="正文"]')
        if desc_area:
            desc_area.click()
            time.sleep(0.5)
            # 分段打入正文
            paras = content.split("\n")
            for p in paras:
                if not p.strip():
                    page.keyboard.press("Enter")
                    continue
                page.keyboard.insert_text(p.strip())
                page.keyboard.press("Enter")
                time.sleep(0.1)
            print("已成功注入正文与话题！")
            time.sleep(2)
            
        page.screenshot(path="tools/backlinks/xhs_note_ready.png")
        
        # 5. 关闭话题建议浮层并点击【发布】按钮
        print("[5/5] 关闭可能的话题联想浮层并点击【发布】按钮...")
        page.keyboard.press("Escape")
        time.sleep(1)
        
        # 页面滚动到底部
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)
        
        # 精确触发发布按钮的原生点击
        clicked_res = page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const pBtn = btns.find(b => b.innerText.trim() === '发布' || b.className.includes('publishBtn'));
            if (pBtn) {
                pBtn.scrollIntoView();
                pBtn.click();
                return { found: true, text: pBtn.innerText, className: pBtn.className };
            }
            return { found: false };
        }""")
        print("点击发布按钮结果:", json.dumps(clicked_res, ensure_ascii=False))
        
        print("已触发【发布】，等待小红书服务端提交处理...")
        time.sleep(8)
        
        page.screenshot(path="tools/backlinks/xhs_published_final.png")
        current_url = page.url
        print(f"🎉 笔记处理完毕！当前页面: {current_url}")
        
        # 记录外链到日志
        add_backlink(
            platform="小红书 (Xiaohongshu DA 85+)",
            region="国内",
            category="移动端超级生活社区",
            post_title=title,
            target_url=target_url,
            backlink_url=f"https://www.xiaohongshu.com/user/profile/大幻师",
            anchor_text=f"禅宗知识库 · 《{classic_name}》宣纸金句卡片与白话释义",
            link_type="Brand Mention / Co-occurrence",
            status="Live",
            notes=f"小红书官方创作者账号【大幻师】发布，带3:4高清宣纸金句配图（底部水印chanzong.space）与#禅宗#超级话题"
        )
        
        browser.close()
        return True

if __name__ == "__main__":
    classic = "六祖大师法宝坛经"
    q = "菩提本无树，明镜亦非台。\n本来无一物，何处惹尘埃。"
    exp = "自性本自清净，本不生灭，本自具足。向内观照自己的本心，本来无一物，烦恼从何处安立？万般放下，当下便是清凉自在。"
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
    target = "https://chanzong.space/classics/tanjing"
    publish_xhs_note(classic, q, exp, title, body, target)
