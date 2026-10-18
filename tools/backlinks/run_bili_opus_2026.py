# -*- coding: utf-8 -*-
"""
哔哩哔哩 (Bilibili DA 94+) 图文动态 (Opus) 自动化发布矩阵 - 2026-09-16 批次
三级多尺度长短阶梯（短篇、中篇、长篇），去机器人模板化，带精准落地页与知识图谱回链。
"""
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(CUR_DIR, "bilibili_cookies.json")
sys.path.append(CUR_DIR)
from tracker import add_backlink

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(COOKIE_FILE, "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

OPUS_TASKS = [
    {
        "classic": "shiertimenlun",
        "title": "【中观觉照 · 缘起性空】读龙树菩萨《十二门论》破除二元对立妄见（短篇顿悟随感）",
        "target_url": "https://chanzong.space/classics/shiertimenlun",
        "anchor_text": "《十二门论》龙树中观缘起性空白话详解（https://chanzong.space/classics/shiertimenlun）",
        "notes": "B站官方账号【禅宗空间】发布短篇顿悟随感Opus动态，面向中观缘起性空专页",
        "content": """【中观觉照 · 缘起性空】
龙树菩萨造《十二门论》，立十二门正观层层荡涤因果自性妄见。凡夫执着常断有无，处处自设藩篱；若达诸法缘生无性，当体即空，便见法本无生、清净解脱。顺逆不碍，本来无事。

📚《十二门论》鸠摩罗什古本白话科判与禅宗中观图谱：
https://chanzong.space/classics/shiertimenlun"""
    },
    {
        "classic": "jingangsanmeijing",
        "title": "【达摩印心 · 金刚三昧】从《金刚三昧经》看二入四行的实修心髓（中篇修持札记）",
        "target_url": "https://chanzong.space/classics/jingangsanmeijing",
        "anchor_text": "《金刚三昧经》八品现代白话逐段精解与禅修图谱（https://chanzong.space/classics/jingangsanmeijing）",
        "notes": "B站官方账号【禅宗空间】发布中篇修持札记Opus动态，面向金刚三昧经专页",
        "content": """【达摩印心 · 金刚三昧】
后世多熟知达摩祖师以《楞伽》印心，殊不知其“理入与行入”之圣源深契于八品《金刚三昧经》。
经云：“法无在不在，理本寂无为。若达无生理，无生亦不生。”
现代人每天被各种信息与比较裹挟，所谓内耗焦虑，皆因将起落的客尘妄相认作真实自我。初祖壁观，非死水顽空，而是令心如墙壁，截断妄想驰求。在生活动静中履践“报冤行、随缘行、无所求行、称法行”，心无所住，随顺真如，自现坚固不坏的金刚三昧本觉心体。

📚《金刚三昧经》达摩根本印心典籍逐段白话详注与知识图谱：
https://chanzong.space/classics/jingangsanmeijing"""
    },
    {
        "classic": "pingshiyulu",
        "title": "【临济峭绝 · 自心觉照】元代平石如砥禅师语录与十二时歌见地考释（长篇公案解密）",
        "target_url": "https://chanzong.space/classics/pingshiyulu",
        "anchor_text": "《平石如砥禅师语录》全卷白话注疏与机锋图谱（https://chanzong.space/classics/pingshiyulu）",
        "notes": "B站官方账号【禅宗空间】发布长篇公案深度解密Opus动态，面向平石如砥语录专页",
        "content": """【临济峭绝 · 自心觉照】
元代平石如砥禅师历住保圣、定水、天童三大名刹，宗风孤拔峭绝，机锋操纵予夺如饿虎出林。
有学僧请问：“如何是本来面目？”
师劈头便答：“日出东方夜落西！”
僧惘然无对，师更喝云：“目前无法，意在目前。不是目前法，非耳目之所到！”

后世参禅人往往求玄弄妙，把现成活泼泼的见闻觉知丢在一旁，偏要向故纸堆上刻舟求剑。正如禅师在《十二时歌》中所警示：“平生操履莫虚捐，切忌旁求向外边。”
心性本无迷悟之别，迷即是一念向外抓取，悟即是当下觉照回光。若能在日常穿衣吃饭、待人接物之间歇却攀缘妄想，山河大地皆是如来藏，步步踏着实相。

📚 系统研读《平石如砥禅师语录》全本逐段白话疏解与公案机锋网络：
https://chanzong.space/classics/pingshiyulu"""
    }
]

def run():
    print("="*60)
    print("🚀 启动哔哩哔哩 (Bilibili DA 94+) 图文动态发布...")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent=REAL_UA,
            viewport={"width": 1280, "height": 900}
        )
        ctx.add_cookies(cookie_list)
        page = ctx.new_page()
        
        for idx, task in enumerate(OPUS_TASKS):
            if idx > 0:
                print("⏳ 保持 25 秒防风控安全休眠...", flush=True)
                time.sleep(25)
                
            print(f"\n[{idx+1}/{len(OPUS_TASKS)}] 正在发布 B 站动态: {task['title']}", flush=True)
            page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=35000)
            time.sleep(4)
            
            editor = page.query_selector('.bili-rich-textarea__inner')
            if not editor:
                print("未直接找到输入框，刷新重试...", flush=True)
                page.reload(wait_until="domcontentloaded")
                time.sleep(3)
                editor = page.query_selector('.bili-rich-textarea__inner')
                
            if not editor:
                print(f"⚠️ 无法找到输入框，截图留证！")
                page.screenshot(path=f"tools/backlinks/bili_err_editor_{idx+1}.png")
                continue
                
            editor.click()
            time.sleep(0.5)
            page.keyboard.press("Control+A")
            time.sleep(0.2)
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            
            for line in task["content"].split("\n"):
                if line.strip():
                    page.keyboard.type(line, delay=8)
                page.keyboard.press("Enter")
                time.sleep(0.2)
                
            time.sleep(1)
            page.keyboard.press("Space")
            time.sleep(1)
            
            pub_btn = page.query_selector('.bili-dyn-publishing__action')
            if pub_btn:
                print("点击发布动态按钮...", flush=True)
                pub_btn.click()
                time.sleep(3)
                
            confirm_btn = page.query_selector('.bili-dyn-specification-popup__btn')
            if confirm_btn and confirm_btn.is_visible():
                print("检测到规范确认弹窗，点击确认...", flush=True)
                confirm_btn.click()
                time.sleep(3)
                
            time.sleep(4)
            
            # 前往空间动态页提取最新 Opus 落地链接
            my_dyn = "https://space.bilibili.com/520219006/dynamic"
            page.goto(my_dyn, wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            
            opus_url = page.evaluate("""() => {
                const link = document.querySelector('a[href*="/opus/"]');
                return link ? link.href : null;
            }""")
            
            if opus_url:
                print(f"🎉 B站动态发布成功！落地页直链: {opus_url}", flush=True)
                page.screenshot(path=f"tools/backlinks/bili_opus_live_{idx+1}.png")
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
                print(f"⚠️ 未能提取到 Opus 链接", flush=True)
                
        browser.close()
        print("\n🎉 全部 B 站动态发布任务圆满完成！")

if __name__ == "__main__":
    run()
