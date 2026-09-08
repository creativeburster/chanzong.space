# -*- coding: utf-8 -*-
"""
新浪微博 (weibo.com DA 90+) 自动化发布与外链追踪引擎
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

def publish_weibo_post(title: str, content: str, target_url: str, anchor_text: str, notes: str):
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
    print("="*60)
    print("🚀 启动新浪微博自动化发博引擎...")
    print(f"👉 标题/主题: {title}")
    print(f"👉 落地页: {target_url}")
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
        
        # 1. 打开首页
        print("[1/4] 打开微博首页...")
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
        time.sleep(4)
        
        # 2. 定位发博框
        print("[2/4] 注入博文内容...")
        textarea = page.query_selector('textarea[placeholder*="有什么新鲜事"], textarea._input_1rz8r_8')
        if not textarea:
            print("⚠️ 未找到微博发博输入框！")
            browser.close()
            return None
            
        textarea.click()
        time.sleep(1)
        textarea.fill(content)
        time.sleep(2)
        
        # 3. 发送
        print("[3/4] 点击发送按钮...")
        send_btn = page.query_selector('button:has-text("发送")')
        if not send_btn:
            print("⚠️ 未找到发送按钮！")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", send_btn)
        print("已点击发送，等待微博处理...")
        time.sleep(6)
        
        # 4. 获取永久链接
        print("[4/4] 提取已发布博文永久独立链接...")
        user_link = page.evaluate("""() => {
            const user = document.querySelector('header a[class*="name"], .head-info_name_36r12 a, a[href*="/u/"]');
            return user ? user.href : null;
        }""")
        
        permanent_url = "https://weibo.com/"
        if user_link:
            page.goto(user_link, wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)
            permanent_url = page.evaluate("""() => {
                const link = document.querySelector('a[href*="/status/"], a[href*="/detail/"], header a[class*="time"]');
                return link ? link.href : window.location.href;
            }""")
            
        print(f"🎉 微博成功发布！永久独立链接: {permanent_url}")
        
        add_backlink(
            platform="新浪微博 (Weibo DA 90+)",
            region="国内",
            category="顶级社交媒体平台",
            post_title=title,
            target_url=target_url,
            backlink_url=permanent_url,
            anchor_text=anchor_text,
            link_type="Dofollow / UGC",
            status="Live",
            notes=notes
        )
        
        browser.close()
        return permanent_url

if __name__ == "__main__":
    test_c = "【禅宗每日微修】一切有为法，如梦幻泡影。金刚经全文导读：https://chanzong.space/classics/jingangjing #金刚经# #禅宗#"
    # publish_weibo_post("测试金刚经", test_c, "https://chanzong.space/classics/jingangjing", "金刚经专页", "测试发布")
