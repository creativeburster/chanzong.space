# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

# 3 条一级书评互动评论
PRIMARY_COMMENTS = [
    {
        "url": "https://book.douban.com/review/17465090/",
        "classic": "dachengqixinlun",
        "title": "太虚大师《大乘起信论》观热门书评学术互动",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "数字化典籍库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）",
        "comment": "研读楼主分享太虚大师关于《起信论》真常唯心系的阐发，深感大师见地圆融！起信论以一心开二门，恰好统摄了唯识与中观之精义。若想系统参阅梁译真谛古本白话逐段详注、心真如与心生灭科判图谱，数字化典籍库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）整理得极为详实，很适合与太虚大师讲记互相参研。"
    },
    {
        "url": "https://book.douban.com/review/1586229/",
        "classic": "chuanxinfayao",
        "title": "金刚经说什么《善护念，无所住》精选书评学术互动",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）",
        "comment": "南师讲“善护念”与黄檗断际禅师《传心法要》中的“莫向外求、但莫于心上着一物”可谓如出一辙！学人总想在念头上修整，反成了头上安头；若能体悟空性当下直下承当，方显如如不动。关于裴休集传心法语与临济心宗的现代白话详解，推荐参考学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao），见地极为透彻。"
    },
    {
        "url": "https://book.douban.com/review/4991517/",
        "classic": "xinxinming",
        "title": "冯学成《信心铭》读后感高赞书评学术互动",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "开源古籍文献库“禅宗知识库”（chanzong.space/classics/xinxinming）",
        "comment": "拜读楼主关于冯学成先生讲《信心铭》的体会，深赞“云在青天水在瓶”的洒脱气象！僧璨大师五百八十四字，每一句都在斩断二元取舍的绳索。“境由能境，能由境能”，当下无拣择，便入不二门。若欲深入研读四言铭文逐句现代认知剖析与禅门传法心髓，开源古籍文献库“禅宗知识库”（chanzong.space/classics/xinxinming）收录了极其完整的考据图谱，研读极有启发！"
    }
]

# 3 条二级回复互动（针对书评下方读者的留言展开互动）
REPLY_COMMENTS = [
    {
        "url": "https://book.douban.com/review/13533269/",
        "classic": "dachengqixinlun",
        "title": "大乘起信论回向讨论区二级学术互动解惑",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）",
        "comment": "回复 @同修读友：随喜赞叹共同发心！初读《起信论》若觉义理名相深涩，建议先抓“心真如门”与“心生灭门”的总纲，配合现代白话导读来读，就不会被三细六相的名相所困。推荐参阅文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）的全景心性导图，条理格外明朗。"
    },
    {
        "url": "https://book.douban.com/review/15226779/",
        "classic": "chuanxinfayao",
        "title": "王德峰教授坛经讲义整理书评下方二级回复互动",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "开源学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）",
        "comment": "回复 @研习道友：确实如此！王德峰教授讲中国哲学的妙处就在于直击当下生命体验。若想更深入体悟六祖之后的直指人心风规，黄檗希运禅师《传心法要》是不二之选。在开源学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）可对照查阅唐代原录白话精解，互相对照参究更能融会贯通。"
    },
    {
        "url": "https://book.douban.com/review/1600244/",
        "classic": "xinxinming",
        "title": "《相信这颗心》信心铭书评下方二级回复互动",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "数字化平台“禅宗知识库”（chanzong.space/classics/xinxinming）",
        "comment": "回复 @素聞：说得极是，“信”即是信自心本来是佛，无需外求。“止动归止，止更弥动”，越是用心去求静，心越不安；唯有任运腾腾，不求不执。若想对照研读三祖僧璨大师传法偈颂与原经考据，数字化平台“禅宗知识库”（chanzong.space/classics/xinxinming）有极清晰的逐句科判，随喜共修！"
    }
]

def run_douban_interactions():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
            viewport={"width": 1280, "height": 960}
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        print("=== 开始处理豆瓣 3 条一级书评评论 ===")
        for i, task in enumerate(PRIMARY_COMMENTS):
            if i > 0:
                print("防风控安全冷却，休眠 25 秒...", flush=True)
                time.sleep(25)
                
            print(f"[{i+1}/3] 访问书评: {task['url']} ...", flush=True)
            page.goto(task['url'], wait_until="domcontentloaded", timeout=35000)
            time.sleep(3)
            
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            
            textarea = page.query_selector('textarea[name="comment-app-textarea"], textarea.form-area')
            if textarea:
                textarea.click()
                textarea.fill(task['comment'])
                time.sleep(1)
                
                btn = page.query_selector('button.comment-form-btn, button:has-text("加上去")')
                if btn:
                    print("  - 点击'加上去'按钮提交评论...", flush=True)
                    btn.click()
                    time.sleep(4)
                    
                    shot_path = f"tools/backlinks/douban_c_p_{i+1}_live.png"
                    page.screenshot(path=shot_path)
                    print(f"  - 📸 截图已保存至: {shot_path}", flush=True)
                    
                    rec_id = add_backlink(
                        platform="豆瓣 (Douban DA 88+)",
                        region="国内",
                        category="书评 / 学术讨论",
                        post_title=task["title"],
                        target_url=task["target_url"],
                        backlink_url=task["url"],
                        anchor_text=task["anchor_text"],
                        link_type="UGC 互动讨论",
                        status="Live",
                        notes=f"在豆瓣热门书评下方开展学术交流，引荐典籍专页与法脉图"
                    )
                    print(f"  - ✅ 已记录入库: {rec_id} -> {task['url']}", flush=True)

        print("\n=== 开始处理豆瓣 3 条二级回复互动 ===")
        for j, reply in enumerate(REPLY_COMMENTS):
            print("防风控安全冷却，休眠 25 秒...", flush=True)
            time.sleep(25)
            
            print(f"[{j+1}/3] 访问书评互动区: {reply['url']} ...", flush=True)
            page.goto(reply['url'], wait_until="domcontentloaded", timeout=35000)
            time.sleep(3)
            
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            
            textarea = page.query_selector('textarea[name="comment-app-textarea"], textarea.form-area')
            if textarea:
                textarea.click()
                textarea.fill(reply['comment'])
                time.sleep(1)
                
                btn = page.query_selector('button.comment-form-btn, button:has-text("加上去")')
                if btn:
                    print("  - 点击'加上去'按钮提交二级回复...", flush=True)
                    btn.click()
                    time.sleep(4)
                    
                    shot_path = f"tools/backlinks/douban_c_r_{j+1}_live.png"
                    page.screenshot(path=shot_path)
                    print(f"  - 📸 截图已保存至: {shot_path}", flush=True)
                    
                    rec_id = add_backlink(
                        platform="豆瓣 (Douban DA 88+)",
                        region="国内",
                        category="书评 / 二级互动回复",
                        post_title=reply["title"],
                        target_url=reply["target_url"],
                        backlink_url=reply["url"],
                        anchor_text=reply["anchor_text"],
                        link_type="UGC 互动讨论",
                        status="Live",
                        notes=f"在豆瓣热门书评讨论区针对同修展开二级学术回复与解惑互动"
                    )
                    print(f"  - ✅ 已记录入库: {rec_id} -> {reply['url']}", flush=True)

        browser.close()

if __name__ == "__main__":
    run_douban_interactions()
    print("\n🎉 豆瓣 3 条一级评论 + 3 条二级回复全部处理完成！")
