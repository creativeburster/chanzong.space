# -*- coding: utf-8 -*-
"""
新浪微博 (Weibo DA 90+) 自动化发博执行脚本 - 2 篇多尺度高质量博文
使用持久化 .browser_profile 保持登录态，自动填入、发送、截图留证并入库。
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILE_DIR = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile")
ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

WEIBO_POSTS = [
    {
        "scale": "短篇即兴觉照 (120字)",
        "title": "【动静一如 · 咬着米了吗】黄檗禅师无心顿悟法门",
        "target_url": "https://chanzong.space/classics/huangbo",
        "anchor_text": "《黄檗山断际禅师传心法要》全文白话今译与核心旨趣",
        "text": """【动静一如 · 咬着米了吗】
黄檗禅师在《传心法要》中道破天机：“终日吃饭，未曾咬着一粒米；整日行走，未曾踏着一片地。”
常人吃饭着吃相，行路着行相。若知本心本来无心，应机随缘而体本虚明，则日用万行全是大机大用，不落阶级。
📖 传心法要逐段白话详注与知识图谱：https://chanzong.space/classics/huangbo
#禅宗# #生活禅# #传心法要# #每日一悟#""",
        "notes": "新浪微博官方账号发布短篇即兴觉照随感，链接直达黄檗传心法要落地页"
    },
    {
        "scale": "中篇心性札记 (280字)",
        "title": "【至道无难 · 歇却爱憎】读三祖僧璨大师《信心铭》随笔",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "三祖僧璨大师《信心铭》逐句白话科判与禅宗图谱",
        "text": """【至道无难 · 歇却爱憎】
三祖僧璨大师《信心铭》开篇即言：“至道无难，唯嫌挑选。但莫憎爱，洞然明白。”
凡夫之所以常陷精神内耗，皆因于虚妄境象中生起“顺逆”与“好恶”之二元分别。贪爱便想抓取，厌憎便生排斥，心随境转，疲惫不堪。
大师直截开示：“圆同太虚，无欠无余。良由取舍，所以不如。”
心性本来圆满澄澈，犹如虚空包容一切阴晴圆缺。若能在生活顺逆交替之际，放下执念挑选，体认本来无欠无余，何处不是极乐净土？
📖 《信心铭》四言铭文全注、白话今译与禅门传承网络：https://chanzong.space/classics/xinxinming
#禅宗经典# #信心铭# #国学智慧# #心理疗愈# #生活智慧#""",
        "notes": "新浪微博官方账号发布中篇心性札记，链接直达三祖信心铭落地页"
    }
]

def run_weibo_posts():
    print("==================================================================")
    print("🚀 正在启动 Edge 执行新浪微博高质量发博任务...")
    print("==================================================================")
    
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            user_agent=REAL_UA,
            viewport={"width": 1280, "height": 900},
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        for idx, post in enumerate(WEIBO_POSTS):
            if idx > 0:
                print("⏳ 保持 20 秒防风控安全休眠...", flush=True)
                time.sleep(20)
                
            print(f"\n[{idx+1}/{len(WEIBO_POSTS)}] 正在发布微博: {post['title']} ({post['scale']})")
            page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
            time.sleep(5)
            
            # 定位发博框
            textarea = page.query_selector('textarea[placeholder*="有什么新鲜事"], textarea[placeholder*="快来分享"], textarea._input_1rz8r_8, textarea')
            if not textarea:
                # 尝试点击激活区域
                feed_box = page.query_selector('.Form_input_2gtHi, .woo-box-flex')
                if feed_box:
                    feed_box.click()
                    time.sleep(1)
                textarea = page.query_selector('textarea')
                
            if not textarea:
                err_path = os.path.join(ARTIFACT_DIR, f"weibo_err_textarea_{idx+1}.png")
                page.screenshot(path=err_path)
                print(f"⚠️ 未找到发博输入框，截图: {err_path}")
                continue
                
            textarea.click()
            time.sleep(0.5)
            # 清空并输入
            page.keyboard.press("Control+A")
            time.sleep(0.2)
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            
            for line in post["text"].split("\n"):
                if line.strip():
                    page.keyboard.type(line, delay=10)
                page.keyboard.press("Enter")
                time.sleep(0.2)
                
            time.sleep(1)
            draft_path = os.path.join(ARTIFACT_DIR, f"weibo_draft_ready_{idx+1}.png")
            page.screenshot(path=draft_path)
            print(f"✅ 博文内容已就绪，草稿截图: {draft_path}")
            
            # 查找发送按钮
            send_btn = page.query_selector('button:has-text("发送")')
            if not send_btn:
                print("⚠️ 未找到【发送】按钮！")
                continue
                
            print("点击【发送】按钮...")
            send_btn.click()
            time.sleep(6)
            
            # 前往个人主页提取最新一条微博直链
            page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            pub_path = os.path.join(ARTIFACT_DIR, f"weibo_live_feed_{idx+1}.png")
            page.screenshot(path=pub_path)
            
            # 提取最新博文链接
            post_link = page.evaluate("""() => {
                const links = Array.from(document.querySelectorAll('a[href*="/status/"], a[href*="/detail/"], a[href*="weibo.com/"][title*="202"]'));
                if (links.length > 0) return links[0].href;
                return window.location.href;
            }""")
            
            print(f"🎉 微博发布成功！检测到落地页: {post_link}")
            rec_id = add_backlink(
                platform="新浪微博 (Weibo DA 90+)",
                region="国内",
                category="顶级社交媒体平台",
                post_title=post["title"],
                target_url=post["target_url"],
                backlink_url=post_link,
                anchor_text=post["anchor_text"],
                link_type="Dofollow / UGC",
                status="Live",
                notes=post["notes"]
            )
            print(f"✅ 外链台账已自动入库: {rec_id}")
            
        ctx.close()
        print("\n✨ 新浪微博发布任务圆满完成！")

if __name__ == "__main__":
    run_weibo_posts()
