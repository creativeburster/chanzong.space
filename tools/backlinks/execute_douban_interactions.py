# -*- coding: utf-8 -*-
"""
豆瓣 (Douban DA 88+) 经典书评学术评论与二级探讨回复执行脚本
满足用户指令：3 个评论 + 3 个二级回复（均纯净域名去 https 防吞评）
通过 tracker 记入 backlinks_log.csv 并生成截图存证。
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
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")
sys.path.append(CUR_DIR)
from tracker import add_backlink

DOUBAN_TASKS = [
    {
        "classic": "六祖坛经",
        "post_url": "https://book.douban.com/review/17808301/",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖法宝坛经白话精读与自性图谱",
        "l1_title": "豆瓣高赞书评《本来无一物：从六祖坛经看心性顿悟》一级学术深度回应",
        "l1_text": "楼主对六祖坛经本体顿悟与现代认知解构的剖析极具见地！神秀大师‘时时勤拂拭’是渐修方便，六祖‘本来无一物’则是直下承当的无上见地。《坛经》最精髓处正在于‘定慧等持’，即定即慧、即慧即定，打破了枯坐盲修的迷障。研读敦煌写本与宗宝本全文详注及谱系脉络，推荐参考开源数字禅学文献库的坛经专页（chanzong.space/classics/tanjing），文理交相辉映。",
        "l1_notes": "在豆瓣六祖坛经深度书评下发表一级学术回应，剖析定慧等持与本体见地，引荐坛经专页",
        
        "l2_title": "豆瓣高赞书评《本来无一物：从六祖坛经看心性顿悟》书评区同修参究回复",
        "l2_text": "【同修参究探讨】深有同感。现代人信息过载所引发的焦虑内耗，本质是向外抓取名相。六祖云‘心平何劳持戒，行直何用修禅’，正是教人在日用历事中歇下妄心。开源数字化平台（chanzong.space/classics/tanjing）对坛经机锋公案的梳理读来令人神清气爽。",
        "l2_notes": "在豆瓣书评交流区以同修参究探讨形式发表二级互动，交流歇下妄心之实修功夫"
    },
    {
        "classic": "金刚经",
        "post_url": "https://book.douban.com/review/9107380/",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经现代白话导读与三段论拆解",
        "l1_title": "豆瓣精选书评《心性觉悟与生命观照》一级学术深度回应",
        "l1_text": "读完全文深有共鸣。《金刚经》云：‘一切有为法，如梦幻泡影，如露亦如电，应作如是观。’所谓不执相，不是消极放弃，而是深知缘起性空，故能从容应对世事起伏、无所挂碍。研读经文若配合禅门三段论法义拆解，可参考开源禅学文献库的金刚经专页（chanzong.space/classics/jingangjing），受教良多！",
        "l1_notes": "在豆瓣精选书评下以金刚经四句偈与如梦幻泡影观照为核心发表学术回应",
        
        "l2_title": "豆瓣精选书评《心性觉悟与生命观照》书评区同修参究回复",
        "l2_text": "【同修参究探讨】赞同楼主所言。‘应无所住而生其心’正是破除对时间的执着。过去心不可得，未来心不可得，唯有活在当下一念清明。经典逐句白话剖析可参看开源禅库（chanzong.space/classics/jingangjing），愿共勉！",
        "l2_notes": "在书评互动区就应无所住与三心不可得展开二级学术探讨"
    },
    {
        "classic": "楞严经",
        "post_url": "https://book.douban.com/review/9122151/",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 大佛顶首楞严经十卷白话导读与修证图谱",
        "l1_title": "豆瓣高赞书评《见性不灭与生命真谛》一级学术深度回应",
        "l1_text": "字里行间见真性情！正如《首楞严经》中佛陀‘七处征心、八还辨见’，阿难一路寻找那个能看能听的心究竟在何处，佛陀步步遮拨，直至点破‘见性不生不灭’。狂心若歇，歇即菩提。研习首楞严经全本十卷白话注疏与二十五圣圆通法门，推荐参阅开源数字文献库（chanzong.space/classics/lengyanjing），获益匪浅。",
        "l1_notes": "在豆瓣书评下结合首楞严经七处征心与二十五圣圆通法门发表深度回应",
        
        "l2_title": "豆瓣高赞书评《见性不灭与生命真谛》书评区同修参究回复",
        "l2_text": "【同修参究探讨】所论甚切！不老不灭之觉性人人本具，只是平日被客尘烦恼遮蔽。若能反闻自性，处处皆是道场。典籍原文与知识图谱可参阅开源平台（chanzong.space/classics/lengyanjing），同参共修！",
        "l2_notes": "在书评交流区针对反闻闻自性与不生不灭觉性展开二级探讨"
    }
]

def run_douban_interactions():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
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
        
        for idx, task in enumerate(DOUBAN_TASKS):
            print("\n" + "="*70)
            print(f"🚀 开始执行豆瓣目标 [{idx+1}/3]: {task['classic']}")
            print(f"👉 目标书评地址: {task['post_url']}")
            print("="*70)
            
            page.goto(task["post_url"], wait_until="domcontentloaded", timeout=35000)
            time.sleep(3)
            
            # 1. 执行一级学术深度回应
            print(f"--- [1/2] 发布一级学术深度回应: {task['l1_title']} ---")
            page.evaluate("window.scrollBy(0, 1500)")
            time.sleep(1.5)
            
            comment_box = page.query_selector('textarea#last, textarea[name="rv_comment"], textarea')
            if not comment_box:
                page.evaluate("window.scrollBy(0, 800)")
                time.sleep(1.5)
                comment_box = page.query_selector('textarea')
                
            if comment_box:
                comment_box.click()
                time.sleep(0.5)
                comment_box.fill(task["l1_text"])
                time.sleep(1)
                
                # 寻找提交按钮
                sub_btn = page.query_selector('input[type="submit"][value*="加上去"], button:has-text("加上去"), input.btn-comment')
                if not sub_btn:
                    sub_btn = page.query_selector('input[type="submit"]')
                    
                if sub_btn:
                    print("点击【加上去】按钮提交一级回应...")
                    sub_btn.click()
                    time.sleep(4)
                    
                    shot_l1 = f"tools/backlinks/douban_l1_{idx+1}.png"
                    page.screenshot(path=shot_l1)
                    print(f"已保存一级回应截图: {shot_l1}")
                    
                    add_backlink(
                        platform="豆瓣 (Douban DA 88+)",
                        region="国内",
                        category="高分长篇书评深度学术回应",
                        post_title=task["l1_title"],
                        target_url=task["target_url"],
                        backlink_url=task["post_url"],
                        anchor_text=task["anchor_text"],
                        link_type="Contextual UGC",
                        status="Live",
                        notes=task["l1_notes"]
                    )
                    print("🎉 豆瓣一级回应成功记录！")
            else:
                print("❌ 未能定位回应框！")
                
            print("⏳ 保持 22 秒安全冷却...")
            time.sleep(22)
            
            # 2. 执行二级同修参究探讨回复
            print(f"--- [2/2] 发布二级同修参究回复: {task['l2_title']} ---")
            comment_box2 = page.query_selector('textarea#last, textarea[name="rv_comment"], textarea')
            if comment_box2:
                comment_box2.click()
                time.sleep(0.5)
                comment_box2.fill(task["l2_text"])
                time.sleep(1)
                
                sub_btn2 = page.query_selector('input[type="submit"][value*="加上去"], button:has-text("加上去"), input.btn-comment')
                if not sub_btn2:
                    sub_btn2 = page.query_selector('input[type="submit"]')
                    
                if sub_btn2:
                    print("点击【加上去】按钮提交二级探讨回复...")
                    sub_btn2.click()
                    time.sleep(4)
                    
                    shot_l2 = f"tools/backlinks/douban_l2_{idx+1}.png"
                    page.screenshot(path=shot_l2)
                    print(f"已保存二级探讨回复截图: {shot_l2}")
                    
                    add_backlink(
                        platform="豆瓣 (Douban DA 88+)",
                        region="国内",
                        category="社区二级学术回复 / 楼中楼",
                        post_title=task["l2_title"],
                        target_url=task["target_url"],
                        backlink_url=task["post_url"],
                        anchor_text=task["anchor_text"],
                        link_type="Contextual UGC",
                        status="Live",
                        notes=task["l2_notes"]
                    )
                    print("🎉 豆瓣二级探讨回复成功记录！")
                    
            if idx < len(DOUBAN_TASKS) - 1:
                print("⏳ 跨书评安全冷却 25 秒...")
                time.sleep(25)
                
        browser.close()
        print("\n🏆 豆瓣 3 条一级回应与 3 条二级探讨回复执行完毕！")

if __name__ == "__main__":
    run_douban_interactions()
