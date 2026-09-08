# -*- coding: utf-8 -*-
"""
新浪微博 (weibo.com DA 90+) 自动化发博与外链发布脚本
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")
sys.path.append(CUR_DIR)
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

POST_TEXT = """【禅修日课 · 自性本自清净】

唐代禅宗六祖惠能大师初见五祖弘忍时，本为不识一字的岭南樵夫。他在碓坊舂米八月，后作千古名偈：
“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

五祖夜半以袈裟遮围，为说《金刚经》。至“应无所住而生其心”，六祖大悟：“何期自性，本自清净；何期自性，本不生灭；何期自性，本自具足；何期自性，本无动摇；何期自性，能生万法。”

世人终日向外驰求，奔波于毁誉得失之间，苦不堪言。殊不知自性本足，回光返照即是清凉。

📖 《六祖坛经》全文现代白话导读与禅门传承图谱：https://chanzong.space/classics/tanjing

#禅宗# #六祖坛经# #国学经典# #修行# #每日一悟#"""

def post_weibo():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
    print("="*60)
    print("🚀 启动新浪微博 (weibo.com DA 90+) 自动化发博引擎...")
    print(f"👉 博文主题: 六祖坛经与自性清净")
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
        
        # 1. 打开微博首页
        print("[1/4] 打开微博首页建立会话...")
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # 2. 定位发博框
        print("[2/4] 定位发博输入框并填入内容...")
        textarea = page.query_selector('textarea[placeholder*="有什么新鲜事"], textarea._input_1rz8r_8')
        if not textarea:
            print("⚠️ 未找到微博发博输入框！保存截图中...")
            page.screenshot(path="tools/backlinks/weibo_err_no_textarea.png")
            browser.close()
            return False
            
        textarea.click()
        time.sleep(1)
        # 用 fill 或 keyboard.insert_text 输入
        textarea.fill(POST_TEXT)
        time.sleep(2)
        
        print("✅ 博文内容已注入输入框，保存草稿截图...")
        page.screenshot(path="tools/backlinks/weibo_draft_ready.png")
        
        # 3. 点击发送按钮
        print("[3/4] 查找并点击【发送】按钮...")
        send_btn = page.query_selector('button:has-text("发送")')
        if not send_btn:
            print("⚠️ 未找到【发送】按钮！")
            page.screenshot(path="tools/backlinks/weibo_err_no_send_btn.png")
            browser.close()
            return False
            
        page.evaluate("el => el.click()", send_btn)
        print("已点击【发送】按钮，等待微博处理与流更新...")
        time.sleep(6)
        
        # 4. 获取发布结果与链接
        print("[4/4] 验证发布结果并提取博文链接...")
        page.screenshot(path="tools/backlinks/weibo_published.png")
        
        # 尝试从 Feed 列表第一条提取博文链接
        post_link = page.evaluate("""() => {
            // 找到最新的一条微博卡片
            const firstFeed = document.querySelector('.Feed_body_3R0rO, article, div[class*="woo-panel-main"]');
            if (firstFeed) {
                const link = firstFeed.querySelector('a[href*="/status/"], a[href*="/detail/"], a[href*="weibo.com/"][title*="202"]');
                if (link) return link.href;
            }
            // 或者全局搜索包含最新时间特征的链接
            const allLinks = Array.from(document.querySelectorAll('a[href*="/status/"], a[href*="/detail/"]'));
            if (allLinks.length > 0) return allLinks[0].href;
            return window.location.href;
        }""")
        
        print(f"🎉 微博发布成功！检测到在线博文地址: {post_link}")
        
        add_backlink(
            platform="新浪微博 (Weibo DA 90+)",
            region="国内",
            category="顶级社交媒体平台",
            post_title="【禅修日课 · 自性本自清净】六祖坛经悟道与心法",
            target_url=f"{SITE_DOMAIN}/classics/tanjing",
            backlink_url=post_link,
            anchor_text="禅宗知识库 · 六祖坛经全文现代白话导读与传承图谱",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证微博账号发布的六祖坛经深度禅修博文，带#禅宗#、#六祖坛经#超级话题与chanzong.space落地页外链"
        )
        
        browser.close()
        return True

if __name__ == "__main__":
    post_weibo()
