# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

cur_dir = os.path.dirname(os.path.abspath(__file__))
cookie_path = os.path.join(cur_dir, ".browser_profile", "weibo_cookie.json")
sys.path.append(cur_dir)
from tracker import add_backlink

MY_UID = "6196660530"

POST = {
    "classic": "金刚三昧经",
    "title": "【禅宗印心 · 金刚三昧】达摩祖师二入四行根本圣典与无生本觉",
    "target_url": "https://chanzong.space/classics/jingangsanmeijing",
    "anchor_text": "禅宗知识库 · 金刚三昧经八品白话精注与达摩心脉图谱",
    "notes": "微博官方账号发布，带#金刚三昧经#、#禅宗智慧#话题，引导至金刚三昧经专页",
    "content": """【禅宗印心 · 金刚三昧】

达摩初祖东来传心，后世多熟知其以《楞伽》印心，殊不知其“二入四行”根本教理圣源正是八品《金刚三昧经》。
经云：“法无在不在，理本寂无为。若见法生者，即是生灭想；若达无生理，无生亦不生。”

藉教悟宗，凝住壁观。在生活动静中履践“报冤行、随缘行、无所求行、称法行”，截断妄想驰求，当下契入坚固不坏的金刚三昧本觉心体。

深入研读八品逐段白话精解与禅修图谱：
📖 禅宗知识库：https://chanzong.space/classics/jingangsanmeijing

#金刚三昧经# #禅宗智慧# #达摩祖师# #二入四行# #心性修养#"""
}

def test_pub():
    with open(cookie_path, "r", encoding="utf-8") as f:
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
        
        print("访问微博首页...")
        page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=35000)
        time.sleep(5)
        
        textarea = page.query_selector('textarea[placeholder*="有什么新鲜事"], textarea._input_1rz8r_8, textarea')
        if not textarea:
            print("尝试直接点击发博区域...")
            page.mouse.click(500, 220)
            time.sleep(2)
            textarea = page.query_selector('textarea')
            
        page.screenshot(path="tools/backlinks/weibo_pub_probe.png")
        print("输入框检测:", bool(textarea))
        
        if textarea:
            textarea.click()
            time.sleep(0.5)
            textarea.fill(POST["content"])
            time.sleep(2)
            page.screenshot(path="tools/backlinks/weibo_pub_filled.png")
            
            send_btn = page.query_selector('button:has-text("发送")')
            if send_btn:
                print("点击【发送】博文...")
                page.evaluate("el => el.click()", send_btn)
                time.sleep(5)
                page.screenshot(path="tools/backlinks/weibo_pub_sent.png")
                
                # 访问个人主页抓取直链
                page.goto(f"https://weibo.com/u/{MY_UID}", wait_until="domcontentloaded", timeout=30000)
                time.sleep(4)
                
                post_link = page.evaluate("""() => {
                    const links = Array.from(document.querySelectorAll('header a, a[href*="/detail/"], a[href*="/status/"], .head-info_time_6s0Kn a'));
                    for (const l of links) {
                        if (l.href.includes("/detail/") || l.href.includes("/status/") || /\\/\\d{8,}\\/[a-zA-Z0-9]+/.test(l.href)) {
                            return l.href;
                        }
                    }
                    return null;
                }""")
                print(f"🎉 微博发布成功！独立链接: {post_link}")
                if post_link:
                    add_backlink(
                        platform="新浪微博 (Weibo DA 90+)",
                        region="国内",
                        category="顶级社交媒体平台",
                        post_title=POST["title"],
                        target_url=POST["target_url"],
                        backlink_url=post_link,
                        anchor_text=POST["anchor_text"],
                        link_type="Dofollow / UGC",
                        status="Live",
                        notes=POST["notes"]
                    )
        browser.close()

if __name__ == "__main__":
    test_pub()
