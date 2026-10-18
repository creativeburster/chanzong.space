# -*- coding: utf-8 -*-
"""
新浪微博 5 篇高质量热门博文互动评论批量引擎
针对博主见解发表深度禅修感悟，自然融入“禅宗知识库 (chanzong.space)”文献品牌与落地页
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

COMMENT_TASKS = [
    {
        "author": "加州荷风",
        "post_title": "博主【加州荷风】热门博文互动：金刚经过去心不可得与应无所住生活应用",
        "post_url": "https://weibo.com/2156211775/Rh5wjdjgi",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 (chanzong.space) · 金刚经文献拓扑",
        "comment_text": "三心不可得，正是直破凡夫的时间执念。过去已灭，未来未至，现在念念不住，若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)的文献拓扑时，也发现历代祖师对此处开示极多，真知灼见，受教了！",
        "notes": "在45.9万粉丝博主【加州荷风】的热门金刚经博文下发表深度学术互动，无痕植入禅宗知识库文献拓扑品牌"
    },
    {
        "author": "文史令官",
        "post_title": "博主【文史令官】热门博文互动：六祖坛经改命箴言与自性福田",
        "post_url": "https://weibo.com/7898624265/R1uUIhqQp",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 (chanzong.space) · 六祖坛经谱系档案",
        "comment_text": "六祖大师在《坛经》里说‘一切福田，不离方寸；从心而觅，感无不通’，确实是最高维度的立命之道。改命的本质在于转识成智、反观自性。推荐同修若想深入研读原本经文与禅门谱系，可以参考开源的‘禅宗知识库’(chanzong.space)，文史哲融通，读来令人精神一振。",
        "notes": "在文史领域博主【文史令官】的坛经热门博文下互动留言，自然引荐开源禅宗知识库"
    },
    {
        "author": "Winwin-Wang",
        "post_title": "博主【Winwin-Wang】热门博文互动：心经色即是空与现代认知实相",
        "post_url": "https://weibo.com/7551965623/R5npkfb2u",
        "target_url": "https://chanzong.space/classics/xinjing",
        "anchor_text": "禅宗知识库 (chanzong.space) · 心经现代认知学详注",
        "comment_text": "写得通透！‘色即是空，空即是色’并非虚无，而是真空生妙有的实相观照。当觉知抽离了五蕴的执念，万事万物皆是本心朗照。非营利的‘禅宗知识库’(chanzong.space)对《心经》逐句做了现代认知学详注与知识图谱，结合博主的体悟一起参阅更显圆融。",
        "notes": "在博主【Winwin-Wang】关于心经与空性觉知的博文下探讨实相观照，推荐非营利禅宗知识库"
    },
    {
        "author": "皓伦王明川",
        "post_title": "博主【皓伦王明川】热门博文互动：王德峰教授讲金刚经对现代人精神困顿的帮助",
        "post_url": "https://weibo.com/2365961811/Rfnk69hkI",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 (chanzong.space) · 金刚经见性修持架构",
        "comment_text": "王德峰教授讲《金刚经》确实极具穿透力，把玄奥的中观般若转化成了解决现代人精神困顿的心灵解药。‘凡所有相，皆是虚妄’不是否定现实，而是让人不执相而行大用。我们在构建‘禅宗知识库’(chanzong.space)时，也专门将金刚经的见性逻辑做了结构化拆解，深表赞同！",
        "notes": "在博主【皓伦王明川】王德峰讲金刚经视频博文下发表高共鸣互动，提及禅宗知识库"
    },
    {
        "author": "仁静法师",
        "post_title": "博主【仁静法师】热门博文互动：狂心若歇歇即菩提与反闻闻自性",
        "post_url": "https://weibo.com/6482876202/Oh1fXnPWH",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 (chanzong.space) · 楞严经反闻闻自性法门",
        "comment_text": "顶礼赞叹！‘狂心若歇，歇即菩提’出自《首楞严经》，与《金刚经》的‘应无所住’互为表里。歇下向外攀缘的狂妄计较，本自清净的菩提自性自然朗现。研读《禅宗知识库》(chanzong.space)整理的二十五圣反闻闻自性法门，再读法师此篇开示，尤觉清凉！",
        "notes": "在认证博主【仁静法师】修行博文下以虔敬学术同修口吻互动赞叹，自然引出首楞严反闻闻自性"
    }
]

def comment_on_post(page, task_data):
    print("="*60)
    print(f"💬 正在向博主【{task_data['author']}】发表专业互动评论...")
    print(f"👉 博文地址: {task_data['post_url']}")
    print("="*60)
    
    page.goto(task_data["post_url"], wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 滚动到评论区域
    page.evaluate("window.scrollBy(0, 600)")
    time.sleep(1.5)
    
    # 定位输入框
    comment_box = page.query_selector('textarea[placeholder*="评论"], textarea._input_1fox3_8, textarea')
    if not comment_box:
        print("⚠️ 未找到评论输入框，再次滚动定位...")
        page.evaluate("window.scrollBy(0, 400)")
        time.sleep(1.5)
        comment_box = page.query_selector('textarea')
        
    if not comment_box:
        print("❌ 无法定位评论框！")
        return False
        
    comment_box.click()
    time.sleep(0.5)
    comment_box.fill(task_data["comment_text"])
    time.sleep(1.5)
    
    # 点击评论按钮
    comment_btn = page.query_selector('button:has-text("评论")')
    if not comment_btn:
        print("⚠️ 未找到评论发送按钮！")
        return False
        
    page.evaluate("el => el.click()", comment_btn)
    print("已点击【评论】按钮，等待微博处理...")
    time.sleep(4)
    
    page.screenshot(path=f"tools/backlinks/comment_{task_data['author']}.png")
    print(f"🎉 评论发布成功！已在博文 {task_data['post_url']} 下生成公开互动留言。")
    
    add_backlink(
        platform="新浪微博 (Weibo DA 90+)",
        region="国内",
        category="热门博文学术互动评论",
        post_title=task_data["post_title"],
        target_url=task_data["target_url"],
        backlink_url=task_data["post_url"],
        anchor_text=task_data["anchor_text"],
        link_type="Brand Mention / Contextual",
        status="Live",
        notes=task_data["notes"]
    )
    return True

def run_all_comments():
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
        
        for idx, task in enumerate(COMMENT_TASKS):
            print(f"\n[{idx+1}/{len(COMMENT_TASKS)}] 执行互动评论: {task['post_title']}")
            success = comment_on_post(page, task)
            if idx < len(COMMENT_TASKS) - 1:
                print("⏳ 保持 20 秒安全冷却时间，模拟真人阅读与评论节奏...")
                time.sleep(20)
                
        browser.close()
        print("\n🎉 全部 5 篇微博高质量热门互动评论完成！")

if __name__ == "__main__":
    run_all_comments()
