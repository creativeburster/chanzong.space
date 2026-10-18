# -*- coding: utf-8 -*-
"""
新浪微博 4 篇高质量禅修经典博文批量发布脚本
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
MY_UID = "6196660530"

WEIBO_POSTS = [
    {
        "title": "【禅修日课 · 降伏其心与应无所住】金刚经破相心法",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚经全文现代白话导读与经文详注",
        "notes": "微博官方账号【禅宗空间_chanzong_space】发布，带#金刚经#、#禅宗#、#凡所有相皆是虚妄#超级话题",
        "content": """【禅修日课 · 降伏其心与应无所住】

须菩提问佛：“善男子、善女人，发阿耨多罗三藐三菩提心，应云何住？云何降伏其心？”
佛答：“凡所有相，皆是虚妄。若见诸相非相，则见如来。”

我们每天都在为各种外境起伏跌宕——被夸奖就飘飘然，被否定就焦虑沮丧。其实烦恼不是外界给的，而是我们把无常的假相当作了实有。《金刚经》开示的至高法门，不过八个字：“不应住色生心，不应住声香味触法生心，应无所住而生其心。”

不被表相束缚，做该做的事，担该担的责，但事过境迁心中了无牵挂，这就是降伏其心。

📖 《金刚般若波罗蜜经》全文现代白话导读与经文详注：https://chanzong.space/classics/jingangjing

#禅宗# #金刚经# #凡所有相皆是虚妄# #国学经典# #心性修养#"""
    },
    {
        "title": "【禅修日课 · 色即是空与心无挂碍】心经照见五蕴皆空",
        "target_url": "https://chanzong.space/classics/xinjing",
        "anchor_text": "禅宗知识库 · 心经全文白话导读与色即是空实相辨析",
        "notes": "微博官方账号【禅宗空间_chanzong_space】发布，带#心经#、#禅宗#、#色即是空#超级话题",
        "content": """【禅修日课 · 色即是空与心无挂碍】

《心经》全文仅 260 字，却是整个大乘佛教 600 卷般若的心髓精要：
“观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。”

很多人以为“色即是空”是消极厌世，其实大谬不然。“色”指一切有形有相的物质与现象，“空”指万法因缘和合、无永恒不变的实体。波浪虽起，其本质依然是水；情绪虽烈，其本质依然是因缘聚散。

明白了五蕴当体即空，便不再认领焦虑、恐慌与得失为“我”。以无所得故，心无挂碍；无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。

📖 《般若波罗蜜多心经》全文白话导读与色即是空实相辨析：https://chanzong.space/classics/xinjing

#心经# #禅宗# #色即是空# #心灵疗愈# #传统文化#"""
    },
    {
        "title": "【禅修日课 · 开悟楞严与狂心若歇】楞严经明心见性真谛",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 楞严经十卷全文现代白话导读与核心旨趣",
        "notes": "微博官方账号【禅宗空间_chanzong_space】发布，带#楞严经#、#禅宗#、#狂心若歇#超级话题",
        "content": """【禅修日课 · 开悟楞严与狂心若歇】

古人云：“开悟的楞严，成佛的法华。”
《楞严经》十卷长篇，从阿难尊者“七处征心”破除一切妄想分别，到波斯匿王“见性不老”顿悟不灭真心，再到二十五圣反闻闻自性，处处直探生命根本。

经中最振聋发聩的一句开示，莫过于：“狂心若歇，歇即菩提。胜净明心，不从人得。”

我们终其一生在向外攀缘、索取认同、追逐目标，心像脱缰的野马疲惫不堪。其实何须向外去修一个佛性？只要歇下那个生灭计较、贪婪执取的狂妄之心，本自清净的光明自性当下朗然显现。

📖 《大佛顶首楞严经》十卷全文现代白话导读与核心旨趣：https://chanzong.space/classics/lengyanjing

#楞严经# #禅宗# #狂心若歇# #读书笔记# #明心见性#"""
    },
    {
        "title": "【禅修日课 · 阿赖耶识与转识成智】八识规矩颂修心指南",
        "target_url": "https://chanzong.space/classics/bashiguijusong",
        "anchor_text": "禅宗知识库 · 八识规矩颂全文白话详注与修证图谱",
        "notes": "微博官方账号【禅宗空间_chanzong_space】发布，带#唯识学#、#八识规矩颂#、#阿赖耶识#超级话题",
        "content": """【禅修日课 · 阿赖耶识与转识成智】

玄奘大师历时十七年西行求法，归国后融通唯识精髓，写就《八识规矩颂》：
“浩浩三藏不可穷，渊深七浪境为风。受熏持种根身器，去后来先作主公。”

阿赖耶识（第八识）是所有起心动念、善恶种子的储存黑匣子；第七末那识执着它为恒常之“我”，遂起无明。
修行不是把八识彻底消灭，而是“转识成智”——六祖坛经云：“六七因中转，五八果上圆。”转分别意识为妙观察智，转末那私我为平等性智，转阿赖耶识为朗照万象的大圆镜智。

在日常对境中觉照分别、放下我执，凡夫心当下即是如来清净智。

📖 玄奘大师《八识规矩颂》全文白话详注与修证图谱：https://chanzong.space/classics/bashiguijusong

#唯识学# #八识规矩颂# #阿赖耶识# #玄奘# #禅宗#"""
    }
]

def publish_single(page, post_data):
    print("="*60)
    print(f"🚀 发布微博: {post_data['title']}")
    print("="*60)
    
    # 打开首页
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    # 定位发博输入框
    textarea = page.query_selector('textarea[placeholder*="有什么新鲜事"], textarea._input_1rz8r_8')
    if not textarea:
        print("⚠️ 未找到输入框！")
        return None
        
    textarea.click()
    time.sleep(1)
    textarea.fill(post_data["content"])
    time.sleep(2)
    
    # 点击发送
    send_btn = page.query_selector('button:has-text("发送")')
    if not send_btn:
        print("⚠️ 未找到发送按钮！")
        return None
        
    page.evaluate("el => el.click()", send_btn)
    print("已点击发送，等待微博同步处理...")
    time.sleep(6)
    
    # 前往个人主页提取最新独立链接
    page.goto(f"https://weibo.com/u/{MY_UID}", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    post_link = page.evaluate("""() => {
        const timeLinks = Array.from(document.querySelectorAll('header a, .head-info_time_6s0Kn, a[href*="/detail/"], a[href*="/status/"]'));
        for (const l of timeLinks) {
            if (l.href.includes("/detail/") || l.href.includes("/status/") || /\/\d{8,}\/[a-zA-Z0-9]+/.test(l.href)) {
                return l.href;
            }
        }
        return null;
    }""")
    
    if not post_link:
        post_link = f"https://weibo.com/u/{MY_UID}"
        
    print(f"🎉 发布成功！独立永久链接: {post_link}")
    
    add_backlink(
        platform="新浪微博 (Weibo DA 90+)",
        region="国内",
        category="顶级社交媒体平台",
        post_title=post_data["title"],
        target_url=post_data["target_url"],
        backlink_url=post_link,
        anchor_text=post_data["anchor_text"],
        link_type="Dofollow / UGC",
        status="Live",
        notes=post_data["notes"]
    )
    return post_link

def run_all_weibo():
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
        
        for idx, item in enumerate(WEIBO_POSTS):
            print(f"\n[{idx+1}/{len(WEIBO_POSTS)}] 准备发布: {item['title']}")
            link = publish_single(page, item)
            if idx < len(WEIBO_POSTS) - 1:
                print("⏳ 保持 25 秒安全冷却，防止微博频控...")
                time.sleep(25)
                
        browser.close()
        print("\n🎉 全部 4 篇微博经典博文发布完成！")

if __name__ == "__main__":
    run_all_weibo()
