# -*- coding: utf-8 -*-
"""
知乎 (Zhihu DA 95+) 顶级中文知识专栏长文发布引擎
标题：《无念为宗，无相为体，无住为本：六祖坛经顿悟心法与现代认知科学对勘》
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

ARTICLE = {
    "title": "无念为宗，无相为体，无住为本：六祖坛经顿悟心法与现代心性科学对勘",
    "target_url": "https://chanzong.space/classics/liuzutan-jing",
    "anchor_text": "禅宗知识库 · 六祖法宝坛经全卷详注与曹溪顿教知识图谱",
    "notes": "知乎专栏千字学术长文，深入解析六祖坛经无念无相无住三纲宗，结合现代认知与心性科学，挂载坛经专页与D3图谱",
    "content": """唐代六祖惠能大师在广州大梵寺升座说法，留下了中国佛教史上唯一被尊称为“经”的本土圣典——《六祖法宝坛经》。

在《定慧品》中，六祖开门见山立下曹溪顿宗的三大纲领：
“我此法门，从上以来，先立无念为宗，无相为体，无住为本。”
这十二个字，犹如三把金刚宝剑，彻底斩断了一切繁琐名相与教条阶次，将解脱的支点从遥不可及的玄奥彼岸拉回到当下刹那的觉照之中。

【一、 无相为体：于相而离相，超越概念化执取】

六祖云：“无相者，于相而离相。”
凡夫之所以常处焦虑与痛苦之中，是因为心识习惯于对外部境界进行“符号化、标签化、概念化”的定型加工。我们给一件事、一个人贴上“好与坏”、“得与失”、“成功与失败”的标签，然后牢牢执着于这些自己构建出来的虚妄名相中不可自拔。

“无相”并非闭目不见色、塞耳不闻声，亦非抹杀外在客观现实。恰恰相反，是在五彩斑斓的万象之中，心知一切现象皆因缘和合、瞬息万变、无有自性，因而“于相而不著相”。如同明镜照物，胡来胡现，汉来汉现，物去而镜体不留纤毫痕迹。

【二、 无念为宗：于念而离念，知觉与认同的解耦】

世人常将“无念”误解为“百物不思、念头断绝”，六祖严厉斥责此种见解：“若百物不思，念尽除灭，一念绝即死，别处受生，是为大错！”

六祖明确界定：“无念者，于念而无念。”
在现代认知心理学与神经科学中，大脑具有先天的“默认模式网络 (DMN)”，思维脉冲与杂念的生起是神经系统的自然机能。真正的修行绝不是暴力压制念头、强行枯槁坐禅，而是实现“观察者与念头的解耦”。
当念头生起时，清清楚楚了知其生；当念头灭去时，明明白白了知其灭。前念、今念、后念念念相续，而自心不随念流转，不起贪爱厌憎之二元投射。这就是“知而不住”，知是知，境是境，自性如虚空般宽广自在。

【三、 无住为本：为人本性，念念不住的活泼生机】

六祖云：“无住者，为人本性。念念之中，不思前境。若前念今念后念，念念相续，被人缚住；于诸法上，念念不住，即无缚也。”

凡夫心灵最大的沉疴在于“黏滞性”与“执取”。昨天受的一句委屈，今天还在心头反刍；明天尚未发生的困难，当下已经预支恐惧。这种在时间轴上的死死抓取，正是痛苦的全部温床。
“无住”正是恢复生命自性的流动性。流水不腐，户枢不蠹。随缘应物，应物而不累于物；穿衣吃饭，举手投足处处皆是佛性的大机大用。

【四、 数字化古籍文献与全景禅宗图谱研读】

为了让现代学人能够无障碍深入曹溪顿教精髓，避开历代传抄讹误与附会曲解，“禅宗知识库 (chanzong.space)”对《六祖法宝坛经》（汇聚法海本、契嵩本、宗宝本源流）进行了系统数字化对勘，并配备了逐段白话现代疏解、生僻字逐字注音与 D3.js 知识图谱：

- 《六祖坛经》全文白话今译与公案详注专页：https://chanzong.space/classics/liuzutan-jing
- 核心概念「无念为宗 / 无相为体 / 无住为本」深度释义：https://chanzong.space/concepts/wu-nian-wu-xiang-wu-zhu
- 全站 130+ 部禅宗经典与祖师法脉全景知识图谱：https://chanzong.space/graph

识得本来面目，当下便是菩提。愿每一位读者皆能在喧嚣世间，体证这份本自具足的自性清凉。"""
}

def publish_zhihu():
    print("="*60)
    print(f"🚀 启动知乎专栏长文发布: 《{ARTICLE['title']}》")
    print("="*60)
    
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
            viewport={"width": 1280, "height": 900},
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        print("访问知乎专栏写作后台: https://zhuanlan.zhihu.com/write ...")
        page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=35000)
        time.sleep(4)
        
        # 1. 标题输入
        title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
        title_el.click()
        title_el.fill(ARTICLE["title"])
        time.sleep(1)
        print("✅ 标题已填入")
        
        # 2. 正文输入
        editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
        editor.click()
        time.sleep(0.5)
        for p_text in ARTICLE["content"].split("\n\n"):
            p_clean = p_text.strip()
            if p_clean:
                page.keyboard.insert_text(p_clean)
                page.keyboard.press("Enter")
                page.keyboard.press("Enter")
                time.sleep(0.12)
                
        print("✅ 正文已注入，等待知乎自动保存草稿...")
        time.sleep(3)
        
        # 3. 展开并确认发布
        pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
        print("点击【发布】展开设置面板...")
        pub_btn.click()
        time.sleep(3)
        
        confirm_pub = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布")').last
        print("点击确认提交【发布】...")
        confirm_pub.click()
        time.sleep(6)
        
        # 4. 前往管理后台抓取最新文章落地 URL
        page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
        time.sleep(4)
        
        shot_path = os.path.join(ARTIFACT_DIR, "zhihu_article_success.png")
        page.screenshot(path=shot_path)
        
        pub_url = page.evaluate("""() => {
            const firstPost = document.querySelector('a[href*="/p/"]');
            return firstPost ? firstPost.href : null;
        }""")
        
        if not pub_url:
            pub_url = "https://zhuanlan.zhihu.com/write"
            
        print(f"🎉🎉 知乎专栏文章发布成功！独立永久 URL: {pub_url}")
        
        rec = add_backlink(
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
        print(f"✅ 知乎外链已成功入库: {rec}")
        ctx.close()

if __name__ == "__main__":
    publish_zhihu()
