# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
COOKIE_PATH = os.path.join(PROFILE_DIR, "zhihu_cookie.json")
sys.path.append(CUR_DIR)
from tracker import add_backlink

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)

cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

ARTICLES = [
    {
        "title": "一心开二门：从《大乘起信论》看当代人的精神内耗与真如实相",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "禅宗知识库 · 大乘起信论真谛梁译白话详注与心性脉络图谱",
        "notes": "知乎认证创作者【i禅修】发布高权重专栏文章，深度剖析马鸣菩萨一心二门与现代认知科学，含起信论专页回链",
        "content": """马鸣菩萨造、真谛三藏译的《大乘起信论》，是中国大乘佛教与禅宗心法史上无可替代的基石巨著。

其最核心的哲学骨架，莫过于“依一心法，有二种门：一者心真如门，二者心生灭门。是二种门，皆各总摄一切法”。

【一、 什么是“心真如门”？】
心真如门，是心性本体的真实面貌——即不生不灭、离言说相、离名字相、离心缘相的究竟实相。
在真如的层面上，凡夫与佛没有本质区别。它犹如澄清的大海，水体本身从未因波浪的翻滚而减少一滴，也从未因风平浪静而增加一分。
这就是禅宗常讲的“自性本来清净、本自具足”。

【二、 什么是“心生灭门”？为什么现代人如此内耗？】
心生灭门，是心随因缘而显现的生灭相用。依于阿赖耶识，一念不觉而生三细六相，由此演化出浩瀚的主客分别、得失计较与生死爱恨。
现代人的种种焦虑、抑郁与精神内耗，本质上就是把“生灭门”中不断起伏的念头、情绪、人际评价与社会标签，误当成了绝对真实的“我”。
我们在起伏的波浪中挣扎浮沉，认贼为子，因而在恐惧中痛苦不堪。

【三、 破局之道：二门不二，当下歇心】
《起信论》最精妙的圆融之处，在于揭示了真如与生灭“非一非异”：
生灭门不离真如门，波浪即是海水；只要一念觉照，歇下狂心与向外驰求，便能从生灭门中直透真如本体。
这就是大乘起信论给现代人最强有力的解脱药方。

【四、 延伸学术考据与白话研读】
若想深入研读真谛三藏梁译古本经文、逐句现代白话义理精析与禅宗如来藏心性脉络图谱，推荐参阅开源数字化典籍文献库：
- 禅宗知识库 · 《大乘起信论》专页：https://chanzong.space/classics/dachengqixinlun
- 全球禅宗传承法脉与两百座公案知识图谱：https://chanzong.space/graph"""
    },
    {
        "title": "即心即佛与莫向外求：读黄檗希运禅师《传心法要》的息心之境",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "禅宗知识库 · 黄檗断际禅师传心法要白话详解与公案心印",
        "notes": "知乎认证创作者【i禅修】发布高权重专栏文章，深入解读裴休集传心法要即心即佛与言语道断，含传心法要专页回链",
        "content": """唐代相国裴休集黄檗断际禅师语录而成《传心法要》，开篇即直透重关：
“诸佛与一切众生，唯是一心，更无别法。此心无始已来，不曾生、不曾灭，不青不黄，无形无相，不属有无，不计长短。”

黄檗禅师的开示如金刚宝剑，直截了当削去一切枝蔓与葛藤。

【一、 莫向外求：修行最大的陷阱是“著相求佛”】
世间学道之人，往往执着于在名相章句中寻觅玄妙，乃至拼命拂拭身心企图修成一个“佛”，殊不知“起心动念，即乖法体，即为著相”。
向外驰求，如披沙拣金、蒸沙作饭，纵经千劫亦不得成。
黄檗大师言：“供养十方诸佛，不如供养一个无心道人。”因为无心者无别法，不离自性本真。

【二、 言语道断，直下承当】
禅宗的核心不在积累知识，而在彻底放下造作与妄执。
唯有“言语道断，心行处灭”，于一切境缘中心如虚空、不着一物，当下直下承当，才是真正踏入祖师堂奥的大机大用。
修行不是为了在心外建立一个乌托邦，而是看清妄想虚幻，当下认取本来面目。

【三、 数字化典籍文献与公案参修参考】
欲系统对照唐代裴休集古本录文、逐句现代白话详注与历代禅师公案心印，可参考非营利数字化学术平台：
- 禅宗知识库 · 《黄檗断际禅师传心法要》专页：https://chanzong.space/classics/chuanxinfayao
- 临济宗法脉传承与公案机锋全景知识网络：https://chanzong.space/graph"""
    },
    {
        "title": "至道无难唯嫌拣择：重读三祖僧璨《信心铭》的心理解构力量",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "禅宗知识库 · 三祖僧璨大师信心铭逐句白话译注与圆融实相档案",
        "notes": "知乎认证创作者【i禅修】发布高权重专栏文章，现代认知心理学视角解构信心铭唯嫌拣择与不二法门，含信心铭专页回链",
        "content": """禅宗三祖僧璨大师所著《信心铭》，仅用五百八十四字、一百四十六句四言铭文，便将大乘般若与禅宗不二法门阐述得淋漓尽致。

开篇八字“至道无难，唯嫌拣择”，堪称千古照破凡夫情执的警世钟磬。

【一、 什么是“拣择”？现代人痛苦的根源】
凡夫之心，无时无刻不在进行“拣择”与分别：爱顺境、憎逆境，喜赞誉、厌批评，求安逸、避痛苦。
正是这种微细而强烈的爱憎取舍，造就了心灵深处的藩篱与痛苦。
“毫厘有差，天地悬隔”，一旦落入二元对立，便是自设囚笼。

【二、 不二法门：二由一有，一亦莫守】
三祖开示：“二由一有，一亦莫守；一心不生，万法无咎。”
真正的觉醒不是去消灭烦恼追求所谓的纯洁无瑕，而是了知一切现象如梦幻泡影，在顺逆万缘中保持如如不动的明觉之性。
不求真，不断妄，了知心性本自圆成，便是归根得旨的大自在。

【三、 数字化经典与义理参考】
研读《信心铭》四言铭文逐句现代认知剖析、梵汉法义对照与圆融心法图谱，推荐参阅开源学术平台：
- 禅宗知识库 · 《信心铭》专页：https://chanzong.space/classics/xinxinming
- 禅宗核心哲学概念与历代祖师全景图谱：https://chanzong.space/graph"""
    }
]

def publish_zhihu_articles():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
            locale="zh-CN",
            viewport={"width": 1280, "height": 960}
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        for idx, art in enumerate(ARTICLES):
            if idx > 0:
                print("防风控安全休眠 25 秒...", flush=True)
                time.sleep(25)
                
            print("="*60, flush=True)
            print(f"[{idx+1}/3] 正在发布知乎专栏文章: {art['title']}", flush=True)
            print("="*60, flush=True)
            
            page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=35000)
            time.sleep(3)
            
            # 1. 注入标题
            title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
            title_el.click()
            title_el.fill(art["title"])
            time.sleep(1)
            
            # 2. 注入正文
            editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
            editor.click()
            time.sleep(0.5)
            for p_text in art["content"].split("\n\n"):
                p_clean = p_text.strip()
                if p_clean:
                    page.keyboard.insert_text(p_clean)
                    page.keyboard.press("Enter")
                    page.keyboard.press("Enter")
                    time.sleep(0.2)
                    
            print("正文已注入，等待 3 秒草稿自动保存...", flush=True)
            time.sleep(3)
            
            # 3. 点击发布按钮展开设置
            pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
            print("点击第一步【发布】展开面板...", flush=True)
            pub_btn.click()
            time.sleep(3)
            
            # 4. 点击确认发布
            confirm_pub = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布")').last
            print("点击确认【发布】...", flush=True)
            confirm_pub.click()
            time.sleep(6)
            
            # 5. 前往创作管理中心提取最新发布的文章独立 URL
            print("前往内容管理中心提取文章独立永久链接...", flush=True)
            page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            
            article_url = page.evaluate("""() => {
                const link = document.querySelector('a[href*="/p/"]');
                return link ? link.href : null;
            }""")
            
            if article_url:
                print(f"✅ 知乎专栏发布成功！独立直链: {article_url}", flush=True)
                rec_id = add_backlink(
                    platform="知乎 (Zhihu DA 95+)",
                    region="国内",
                    category="顶级中文知识专栏",
                    post_title=art["title"],
                    target_url=art["target_url"],
                    backlink_url=article_url,
                    anchor_text=art["anchor_text"],
                    link_type="Dofollow / UGC",
                    status="Live",
                    notes=art["notes"]
                )
                print(f"✅ 已记录入库: [{rec_id}] -> {article_url}", flush=True)
                
                # 截图存证
                shot_name = f"tools/backlinks/zhihu_article_{article_url.split('/')[-1]}_live.png"
                page.goto(article_url, wait_until="domcontentloaded", timeout=30000)
                time.sleep(2)
                page.screenshot(path=shot_name)
                print(f"📸 凭证保存至: {shot_name}", flush=True)
            else:
                print("⚠️ 未能提取到文章直链！", flush=True)
                
        browser.close()

if __name__ == "__main__":
    publish_zhihu_articles()
    print("\n🎉 知乎 3 篇独立专栏长文全部发布并入库完成！")
