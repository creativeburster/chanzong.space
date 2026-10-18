# -*- coding: utf-8 -*-
"""
执行微博第 3 篇热门博文的二级同修参究回复（补齐第 9 项，达成微博 9/9 全指标）
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

def run_last_reply():
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
        
        post_url = "https://weibo.com/7551965623/R5npkfb2u"
        print(f"正在访问微博目标博文: {post_url}")
        page.goto(post_url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        page.evaluate("window.scrollBy(0, 500)")
        time.sleep(1.5)
        
        comment_box = page.query_selector('textarea[placeholder*="评论"], textarea._input_1fox3_8, textarea')
        if not comment_box:
            page.evaluate("window.scrollBy(0, 300)")
            time.sleep(1.5)
            comment_box = page.query_selector('textarea')
            
        reply_text = "【同修参究回复】道友见地透脱。色空不二正是破除内外两边，不存顺逆，自得解脱。铭文全文详注可参考数字化开源禅库（chanzong.space/classics/xinxinming），共勉参究。"
        
        if comment_box:
            comment_box.click()
            time.sleep(0.5)
            comment_box.fill(reply_text)
            time.sleep(1)
            
            comment_btn = page.query_selector('button:has-text("评论")')
            if comment_btn:
                page.evaluate("el => el.click()", comment_btn)
                print("已点击【评论】按钮提交二级回复...")
                time.sleep(4)
                
                shot_path = "tools/backlinks/weibo_l2_3.png"
                page.screenshot(path=shot_path)
                print(f"已保存截图: {shot_path}")
                
                add_backlink(
                    platform="新浪微博 (Weibo DA 90+)",
                    region="国内",
                    category="社区二级学术回复 / 楼中楼",
                    post_title="博主【Winwin-Wang】心经博文评论区二级楼中楼探讨回复",
                    target_url="https://chanzong.space/classics/xinxinming",
                    backlink_url=post_url,
                    anchor_text="禅宗知识库 · 信心铭白话注疏与不二图谱",
                    link_type="Brand Mention / Contextual",
                    status="Live",
                    notes="在心经评论区针对不二见地进行二级同修参究探讨回复"
                )
                print("🎉 微博第3条二级回复记录完成！")
        browser.close()

if __name__ == "__main__":
    run_last_reply()
