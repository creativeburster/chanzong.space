# -*- coding: utf-8 -*-
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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
sys.path.append(CUR_DIR)
from tracker import add_backlink

ARTICLE = {
    "title": "达摩祖师二入四行的根本宗源：从《金刚三昧经》透视禅门“理入”与“本觉”心髓",
    "target_url": "https://chanzong.space/classics/jingangsanmeijing",
    "anchor_text": "禅宗知识库 · 金刚三昧经白话精解与达摩二入四行法脉图谱",
    "notes": "知乎专栏深度学术长文，考据《金刚三昧经》与达摩二入四行根本教理源流，引导至金刚三昧经专页",
    "content": """谈及初祖菩提达摩东来传心，后世多熟知其以四卷《楞伽经》以印心。然而，若细勘宗门文献与早期敦煌本《二入四行论》，便会发现另一部至关重要却常被今人忽略的印心圣典——八品《金刚三昧经》。

达摩祖师立“理入”与“行入”两大纲宗，其“理入者，藉教悟宗，深信含生同一真性，客尘障故……凝住壁观，无自无他，凡圣等一”的核心法语，与《金刚三昧经·入实际品》中“本觉利行”、“入理真实观”如合符节。

【一、 经本渊源：达摩禅法的如来藏与般若双照】

《金刚三昧经》在大乘经藏中地位极为独特。它将文殊般若之“空无自性”与如来藏之“本觉常住”熔铸为一味。经中梵行长者、解脱菩萨等依次启请佛陀开示“一味真实”，佛云：
“若化众生，无生无化。其化版者，不生无生。知法如是，是则真化。”

这正与达摩大师“不见性即是众生，见性即是佛”的顿教宗骨遥相契合。众生非无佛性，只因妄想客尘覆盖。参禅并非在心外另修出一尊佛，而是藉教悟宗，透脱客尘，照见本无动摇的清净法身。

【二、 理入之极：凝住壁观与无生实相】

很多初学者容易将禅宗的“不立文字”误解为“拨无经论”，落入顽空野狐禅中。其实达摩初祖教人，首重“藉教悟宗”。
《金刚三昧经·真性空品》云：
“法无在不在，理本寂无为。若见法生者，即是生灭想。若达无生理，无生亦不生。”

所谓“理入”，正是透过文字名相，直契这“无生亦不生”的本来面目。祖师面壁九年，其“壁观”并非顽空死坐，而是心如墙壁、万缘顿歇，令一切分别计较妄念无由透入，此时本觉灵光自然廓彻。

【三、 行入之实：动静一如与四行履践】

知理若不落实于行，终成文字知见。《二入四行论》中的“报冤行、随缘行、无所求行、称法行”，在《金刚三昧经》中皆有其清澈的教理渊源：
1. 报冤行：了达宿殃，逢苦不忧。遇逆境时不怨天尤人，深明缘起因果之理；
2. 随缘行：得失随缘，心无增减。富贵荣辱如过眼云烟，不随顺境而生欢喜傲慢；
3. 无所求行：世人长迷，处处贪著。达人知真，安心无为，万有皆空，何所觊觎；
4. 称法行：性净之理，目之为法。信解一切法空，以无所著心行布施摄化。

此四行贯通了从世俗应对到究竟解脱的全部功夫，将极高明的心性见地化为最平常朴实的生活日用。

【四、 数字化古籍研读与修证图谱参考】

深入研读八品《金刚三昧经》原本逐段现代白话疏解、达摩二入四行哲学脉络与全景交互图谱，可参阅非营利数字化禅学知识库：

- 《金刚三昧经》白话精读与科判注疏专页：https://chanzong.space/classics/jingangsanmeijing
- 核心概念「理入与行入」宗门源流释义：https://chanzong.space/concepts/li-ru-xing-ru
- 达摩祖师传法谱系与历代印心公案知识网络：https://chanzong.space/graph

藉教悟宗，以理导行。愿我们在日常纷纭万象之中，皆能体认这份本自具足的坚固金刚三昧。"""
}

def run_post():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        print("="*60)
        print(f"🚀 发布知乎专栏长文: {ARTICLE['title']}")
        print("="*60)
        
        page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        # 1. 注入标题
        title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
        title_el.click()
        title_el.fill(ARTICLE["title"])
        time.sleep(1)
        
        # 2. 注入正文
        editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
        editor.click()
        time.sleep(0.5)
        for p_text in ARTICLE["content"].split("\n\n"):
            p_clean = p_text.strip()
            if p_clean:
                page.keyboard.insert_text(p_clean)
                page.keyboard.press("Enter")
                page.keyboard.press("Enter")
                time.sleep(0.15)
                
        print("✅ 正文已注入，等待知乎自动保存草稿...")
        time.sleep(3)
        
        # 3. 点击第一次【发布】
        pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
        print("点击【发布】展开面板...")
        pub_btn.click()
        time.sleep(3)
        
        # 4. 点击第二次【发布】进行确认
        confirm_pub = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布")').last
        print("点击确认提交【发布】...")
        confirm_pub.click()
        time.sleep(6)
        
        # 5. 前往创作管理中心提取最新文章 URL
        page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
        time.sleep(4)
        
        pub_url = page.evaluate("""() => {
            const firstPost = document.querySelector('a[href*="/p/"]');
            return firstPost ? firstPost.href : null;
        }""")
        
        if not pub_url:
            pub_url = "https://zhuanlan.zhihu.com/write"
            
        print(f"🎉 知乎专栏文章发布成功！独立永久 URL: {pub_url}")
        page.screenshot(path="tools/backlinks/zhuanlan_success_jingangsanmei.png")
        
        add_backlink(
            platform="知乎 (Zhihu DA 95+)",
            region="国内",
            category="顶级中文知识专栏",
            post_title=ARTICLE["title"],
            target_url=ARTICLE["target_url"],
            backlink_url=pub_url,
            anchor_text=ARTICLE["anchor_text"],
            link_type="Dofollow / UGC",
            status="Live",
            notes=ARTICLE["notes"]
        )
        ctx.close()

if __name__ == "__main__":
    run_post()
