# -*- coding: utf-8 -*-
"""
核查简书文章申诉结果、公开在架状态与通知中心消息
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

def check_jianshu_status():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        js_raw = json.load(f)
    cookies = js_raw if isinstance(js_raw, list) else [{"name": k, "value": v, "domain": ".jianshu.com", "path": "/"} for k, v in js_raw.items()]
    
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 1. 访问个人主页文章列表（检查公开展示的文章）
        print("1. 正在访问简书个人公开主页...")
        page.goto("https://www.jianshu.com/u/1043fba40b3c", timeout=30000) # 或者直接从首页点击进入
        time.sleep(3)
        if "404" in page.title() or not page.locator('.note-list').is_visible():
            # 从首页头像跳入
            page.goto("https://www.jianshu.com", timeout=30000)
            time.sleep(2)
            page.click('.user .avatar, .nav-user')
            time.sleep(1)
            page.click('a:has-text("我的主页")')
            time.sleep(3)
            
        print(f"个人主页实际 URL: {page.url}")
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_my_public_page.png"))
        
        public_articles = page.evaluate("""() => {
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
        print(f"公开在架文章数量: {len(public_articles)}")
        print("公开文章列表:")
        print(json.dumps(public_articles, ensure_ascii=False, indent=2))
        
        # 2. 访问简书消息中心通知
        print("\n2. 正在访问简书消息中心/系统通知...")
        page.goto("https://www.jianshu.com/notifications#/chats", timeout=30000)
        time.sleep(3)
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_notifications_now.png"))
        
        # 检查系统消息与申诉反馈
        notes_text = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.notification-list, .find-more, .content, .message, li')).map(el => el.innerText.trim()).filter(t => t.length > 5).slice(0, 10);
        }""")
        print("消息中心摘要:")
        for t in notes_text[:5]:
            print("-", t.replace('\n', ' '))
            
        # 3. 访问创作者后台 /writer#/
        print("\n3. 正在访问创作者后台编辑器查看文章锁定状态...")
        page.goto("https://www.jianshu.com/writer#/", timeout=30000)
        time.sleep(4)
        page.screenshot(path=os.path.join(CUR_DIR, "jianshu_writer_status_now.png"))
        
        writer_articles = page.evaluate("""() => {
            const list = [];
            const items = document.querySelectorAll('._2m9bv, ._2V6-V, li._25kio');
            for (const it of items) {
                list.push({
                    text: it.innerText.replace(/\\n/g, ' ').trim()
                });
            }
            return list;
        }""")
        print("写作后台文章状态:")
        print(json.dumps(writer_articles, ensure_ascii=False, indent=2))
        
        ctx.close()

if __name__ == "__main__":
    check_jianshu_status()
