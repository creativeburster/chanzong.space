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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "weibo_cookie.json")

def probe_weibo():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"} for k, v in cookie_dict.items()]
    
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
        
        url = "https://weibo.com/2156211775/Rh5wjdjgi"
        print(f"正在访问微博博文: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(4)
        
        # 滚动展示评论区
        page.evaluate("window.scrollBy(0, 600)")
        time.sleep(2)
        
        # 检查一级评论输入框
        inputs = page.query_selector_all('textarea')
        print(f"找到 textarea 数量: {len(inputs)}")
        
        # 寻找【回复】按钮
        reply_btns = page.locator('button:has-text("回复"), a:has-text("回复"), span:has-text("回复")').all()
        print(f"找到回复元素数量: {len(reply_btns)}")
        for idx, rb in enumerate(reply_btns[:5]):
            print(f"  回复元素 {idx+1}: tag={rb.evaluate('el => el.tagName')}, visible={rb.is_visible()}, text={rb.inner_text().strip()}")
            
        page.screenshot(path=os.path.join(CUR_DIR, "weibo_reply_probe.png"))
        print("已保存微博评论区截图: weibo_reply_probe.png")
        
        browser.close()

if __name__ == "__main__":
    probe_weibo()
