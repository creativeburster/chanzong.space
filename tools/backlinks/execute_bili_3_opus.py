# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

OPUS_TASKS = [
    {
        "classic": "dachengqixinlun",
        "title": "【禅宗根基 · 一心二门】《大乘起信论》心性本觉义理与现代认知解构",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "《大乘起信论》梁译古本白话详解与心性脉络图谱（https://chanzong.space/classics/dachengqixinlun）",
        "notes": "B站官方认证账号“禅宗空间”发布《大乘起信论》独立图文动态(Opus)，免登录公开收录",
        "content": """【禅宗根基 · 一心二门】
马鸣菩萨于《大乘起信论》云：“依一心法，有二种门：一者心真如门，二者心生灭门。是二种门，皆各总摄一切法。”
现代人常陷入思虑内耗与情绪波动，实则是将“生灭门”的念头起落误认为真实的自己。真如自性本自清净、本不生灭；一念迷则随染缘成九相，一念悟则知万法唯是一心。

📚《大乘起信论》真谛梁译古本逐句白话现代详注与法脉图谱：
https://chanzong.space/classics/dachengqixinlun"""
    },
    {
        "classic": "chuanxinfayao",
        "title": "【直指人心 · 莫向外求】黄檗希运禅师《传心法要》即心即佛参修指引",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "《黄檗山断际禅师传心法要》白话详注与公案图谱（https://chanzong.space/classics/chuanxinfayao）",
        "notes": "B站官方认证账号“禅宗空间”发布《黄檗断际禅师传心法要》独立图文动态(Opus)，免登录公开收录",
        "content": """【直指人心 · 莫向外求】
黄檗断际禅师示众：“诸佛与一切众生，唯是一心，更无别法。此心无始已来，不曾生、不曾灭，本无相貌，不可以有无求，不可以起心动念求。”
世人学道，多向外驰求名相义解，如披沙拣金，反失本心。若能一念顿歇妄想执着，当下默契本心，无佛可成，无生可度，正是临济一派大机大用所在。

📚《黄檗断际禅师传心法要》唐·裴休集原经逐句白话与顿悟实相专页：
https://chanzong.space/classics/chuanxinfayao"""
    },
    {
        "classic": "xinxinming",
        "title": "【绝言绝虑 · 唯嫌拣择】三祖僧璨大师《信心铭》圆融无碍的觉醒心法",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "《信心铭》古本逐句白话详注与圆融实相图谱（https://chanzong.space/classics/xinxinming）",
        "notes": "B站官方认证账号“禅宗空间”发布《三祖僧璨信心铭》独立图文动态(Opus)，免登录公开收录",
        "content": """【绝言绝虑 · 唯嫌拣择】
禅宗三祖僧璨大师开篇即断：“至道无难，唯嫌拣择。但莫憎爱，洞然明白。毫厘有差，天地悬隔。”
人世间一切精神痛苦与对立拉扯，皆因内心微细的取舍与好恶分别。二由一有，一亦莫守；一心不生，万法无咎。不求真，不断妄，了知心性本自圆成，便是归根得旨的大自在。

📚《三祖僧璨大师信心铭》584字四言铭文逐句白话译注与法脉图谱：
https://chanzong.space/classics/xinxinming"""
    }
]

def publish_opus_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            user_agent=REAL_UA,
            viewport={"width": 1280, "height": 900}
        )
        ctx.add_cookies(cookie_list)
        page = ctx.new_page()
        
        for idx, task in enumerate(OPUS_TASKS):
            if idx > 0:
                print("防风控安全冷却，休眠 25 秒...", flush=True)
                time.sleep(25)
                
            print(f"\n[{idx+1}/3] 正在发布动态: {task['title']}", flush=True)
            page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            
            editor = page.query_selector('.bili-rich-textarea__inner')
            if not editor:
                print("未找到输入框，刷新页面...", flush=True)
                page.reload(wait_until="domcontentloaded")
                time.sleep(3)
                editor = page.query_selector('.bili-rich-textarea__inner')
                
            editor.click()
            time.sleep(0.5)
            page.keyboard.press("Control+A")
            time.sleep(0.2)
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            
            for line in task["content"].split("\n"):
                if line.strip():
                    page.keyboard.type(line, delay=10)
                page.keyboard.press("Enter")
                time.sleep(0.2)
                
            time.sleep(1)
            page.keyboard.press("Space")
            time.sleep(1)
            
            pub_btn = page.query_selector('.bili-dyn-publishing__action')
            if pub_btn:
                print("点击发布动态...", flush=True)
                pub_btn.click()
                time.sleep(3)
                
            confirm_btn = page.query_selector('.bili-dyn-specification-popup__btn')
            if confirm_btn and confirm_btn.is_visible():
                print("检测到规范弹窗，点击确认...", flush=True)
                confirm_btn.click()
                time.sleep(3)
                
            time.sleep(4)
            
            # 访问个人动态页提取最新 Opus URL
            my_dyn = "https://space.bilibili.com/520219006/dynamic"
            page.goto(my_dyn, wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            
            opus_url = page.evaluate("""() => {
                const link = document.querySelector('a[href*="/opus/"]');
                return link ? link.href : null;
            }""")
            
            if opus_url:
                print(f"✅ 动态发布成功，落地页: {opus_url}", flush=True)
                # 记录到 tracker
                rec_id = add_backlink(
                    platform="哔哩哔哩 (Bilibili DA 94+)",
                    region="国内",
                    category="社交媒体 / 动态广场",
                    post_title=task["title"],
                    target_url=task["target_url"],
                    backlink_url=opus_url,
                    anchor_text=task["anchor_text"],
                    link_type="Dofollow / UGC",
                    status="Live",
                    notes=task["notes"]
                )
                print(f"✅ 外链已入库: {rec_id}", flush=True)
            else:
                print(f"⚠️ 未能提取到动态 URL", flush=True)
                
        browser.close()

if __name__ == "__main__":
    publish_opus_flow()
    print("\n🎉 B 站 3 篇独立动态全部发布并入库完成！")
