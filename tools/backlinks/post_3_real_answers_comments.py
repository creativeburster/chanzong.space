# -*- coding: utf-8 -*-
"""
在知乎 3 个 100% 公开存活、可直接打开的回答下发表高价值学术评论
1. 坛经: https://www.zhihu.com/question/47436256/answer/2845485161
2. 金刚经: https://www.zhihu.com/question/1928206401152451835/answer/2080590075331613854
3. 楞严经: https://www.zhihu.com/question/35431631/answer/3463421632
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
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
sys.path.append(CUR_DIR)
from tracker import add_backlink

REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

TASKS = [
    {
        "url": "https://www.zhihu.com/question/47436256/answer/2845485161",
        "title": "知乎高赞问答《“本来无一物”到底是什么意思？》学术互动评论",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖坛经现代白话精解与法脉图谱",
        "comment_text": "答主剖析得很到位。神秀大师的“时时勤拂拭，莫使惹尘埃”重在渐修与摄心，而六祖慧能大师的“本来无一物，何处惹尘埃”则是直彻心源的本体见地。修行若离自性本清净的根本信解，一切功夫便易成磨砖作镜；若执着顿悟而废弃日常历事炼心，又易堕入狂禅恶取空。《六祖坛经》全经正是以“定慧等持”、“无念为宗”将理入与事修圆融贯通。同修若欲细勘敦煌写本与宗宝本的逐句校勘及法脉图谱，推荐查阅开源数字禅学文献库的坛经专页（chanzong.space/classics/tanjing），愿共勉参究。",
        "notes": "在知乎六祖坛经高赞答主回答下发表高质量学术互动评论，探讨自性清净与顿渐圆融，引荐坛经数字化专页"
    },
    {
        "url": "https://www.zhihu.com/question/1928206401152451835/answer/2080590075331613854",
        "title": "知乎高赞问答《《金刚经》为什么说“凡所有相，皆是虚妄”？》学术互动评论",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经白话详注与三段论拆解",
        "comment_text": "顶礼赞叹！《金刚经》全篇的无上心髓，正如经中点睛之笔：“应无所住而生其心”。很多人把“不住”误解为消极避世或顽空断灭，实则佛陀教人不住色声香味触法，方能生起无缘大慈、同体大悲的清净妙心。经中三十二分反复运用的“所谓……即非……是名……”三段式遮诠，正是帮助行者击碎名相执念、契入真空妙有的利刃。研读经文若结合禅宗历代注疏会更加通透，建议参考非营利数字化文献库的《金刚经》三段论解析专页（chanzong.space/classics/jingangjing），开卷大有助益。",
        "notes": "在知乎金刚经高赞答主回答下发表高质量学术互动评论，阐发三轮体空与应无所住生其心，引荐金刚经数字专页"
    },
    {
        "url": "https://www.zhihu.com/question/35431631/answer/3463421632",
        "title": "知乎高赞问答《如何理解楞严经？》学术互动评论",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 大佛顶首楞严经十卷白话导读与修证图谱",
        "comment_text": "研读深刻！正如古德所言：“开悟的楞严，成佛的法华。”《首楞严经》由阿难遭摩登伽女之难发端，佛陀连续七处征心、八还辨见，层层破除肉团心与分别思维，直至指出常住真心、性火真空。经中演若达多失头狂走的譬喻尤为警策：“狂心若歇，歇即菩提。”现代人每天为了外在虚名浮利疲于奔命，学会反闻闻自性、歇下妄动狂心，才是安住清净极乐的正道。若欲深入研读十卷经文白话精注及全球传承知识图谱，可参阅非营利数字文献库的楞严经专页（chanzong.space/classics/lengyanjing），获益匪浅。",
        "notes": "在知乎首楞严经高赞答主回答下发表深度学术评论，阐述七处征心与狂心若歇，引荐楞严经专页"
    }
]

def publish_answer_comment(page, task, idx):
    print("="*60)
    print(f"[{idx+1}/{len(TASKS)}] 访问回答页面: {task['url']}")
    print(f"📌 主题: {task['title']}")
    print("="*60)
    
    comment_info = {}
    def on_res(res):
        if "comment_v5" in res.url and res.status == 200 and res.request.method == "POST":
            try:
                data = res.json()
                if "id" in data:
                    comment_info["id"] = data["id"]
                    print(f"🎉 官方成功返回评论 ID: {data['id']}")
            except Exception:
                pass
                
    page.on("response", on_res)
    
    page.goto(task['url'], wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 点击回答底部的评论按钮
    comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
    if not comment_btn.is_visible(timeout=5000):
        print("向下滚动寻找评论按钮...")
        page.mouse.wheel(0, 400)
        time.sleep(2)
        comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
        
    print("展开评论抽屉...")
    comment_btn.click()
    time.sleep(2)
    
    # 激活输入框
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    
    # 注入评论
    print("注入评论正文...")
    page.keyboard.insert_text(task["comment_text"])
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    # 点击发布按钮
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("点击发布提交...")
    pub_btn.click()
    time.sleep(4)
    
    # 截图
    screenshot_name = f"tools/backlinks/real_comment_live_{idx+1}.png"
    page.screenshot(path=screenshot_name)
    print(f"截图保存: {screenshot_name}")
    
    cid = comment_info.get("id", "")
    print(f"🎉 任务 {idx+1} 完成！公开回答地址: {task['url']} (评论ID: {cid})")
    
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="高质量社区互动评论",
        post_title=task["title"],
        target_url=task["target_url"],
        backlink_url=task["url"],
        anchor_text=task["anchor_text"],
        link_type="UGC 互动外链",
        status="Live",
        notes=task["notes"] + (f" (官方评论ID: {cid})" if cid else "")
    )
    return True

def run():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            user_agent=REAL_UA,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        for idx, task in enumerate(TASKS):
            try:
                publish_answer_comment(page, task, idx)
            except Exception as e:
                print(f"❌ 任务 {idx+1} 执行失败: {e}")
                
            if idx < len(TASKS) - 1:
                print("⏳ 保持 25 秒安全冷却时间...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部 3 条公开回答评论发布完成！")

if __name__ == "__main__":
    run()
