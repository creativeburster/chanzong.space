# -*- coding: utf-8 -*-
"""
精准核查简书真实用户 (92585df02061) 的公开文章与申诉状态
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
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

COOKIE_FILE = os.path.join(CUR_DIR, ".browser_profile", "jianshu_cookie.json")
MY_JIANSHU_UID = "92585df02061"

def check_jianshu_real_status():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        js_raw = json.load(f)
    cookies = js_raw if isinstance(js_raw, list) else [{"name": k, "value": v, "domain": ".jianshu.com", "path": "/"} for k, v in js_raw.items()]
    
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 1. 访问真实个人公开主页
        profile_url = f"https://www.jianshu.com/u/{MY_JIANSHU_UID}"
        print(f"1. 访问个人主页: {profile_url}")
        page.goto(profile_url, timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_my_public_page_real.png"))
        
        articles = page.evaluate("""() => {
            const list = [];
            const items = document.querySelectorAll('.note-list li');
            for (const it of items) {
                const titleEl = it.querySelector('.title');
                const timeEl = it.querySelector('.time');
                if (titleEl) {
                    list.push({
                        title: titleEl.innerText.trim(),
                        url: titleEl.href,
                        time: timeEl ? timeEl.innerText.trim() : ''
                    });
                }
            }
            return list;
        }""")
        print(f"公开文章数量: {len(articles)}")
        print("公开文章列表:")
        print(json.dumps(articles, ensure_ascii=False, indent=2))
        
        # 2. 访问通知中心查看申诉与提醒
        print("\n2. 访问消息通知中心...")
        page.goto("https://www.jianshu.com/notifications", timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_notifications_real.png"))
        
        notifs = page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('.notification-list li, .comment-message, .find-more, .message-list li'));
            return items.map(el => el.innerText.replace(/\\n/g, ' ').trim()).filter(t => t.length > 2).slice(0, 10);
        }""")
        print("消息通知列表:")
        for n in notifs:
            print("-", n)
            
        # 3. 访问写作后台查看文章锁定/发布状态
        print("\n3. 访问写作后台...")
        page.goto("https://www.jianshu.com/writer#/", timeout=30000)
        time.sleep(4)
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_writer_real.png"))
        
        notes = page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('._2m9bv, ._2V6-V, li._25kio'));
            return items.map(el => el.innerText.replace(/\\n/g, ' ').trim());
        }""")
        print("写作后台文章:")
        for nt in notes:
            print("-", nt)
            
        ctx.close()

if __name__ == "__main__":
    check_jianshu_real_status()
