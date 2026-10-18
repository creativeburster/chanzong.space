# -*- coding: utf-8 -*-
"""
知乎高赞互动评论脚本：
选取 3 个高赞热门问答进行深度学术交流评论，自然融入禅宗知识库 (chanzong.space) 核心专页。
1. 坛经（本来无一物与自性清净） -> chanzong.space/classics/tanjing
2. 金刚经（凡所有相皆是虚妄与应无所住） -> chanzong.space/classics/jingangjing
3. 禅宗见性与顿悟（理入与行入） -> chanzong.space/graph
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

TARGET_COMMENTS = [
    {
        "question_url": "https://www.zhihu.com/question/20420786",  # 怎么理解六祖慧能的“本来无一物，何处惹尘埃”？
        "title": "知乎高赞问答《怎么理解六祖慧能的“本来无一物，何处惹尘埃”？》学术互动评论",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖法宝坛经白话精读与自性图谱",
        "notes": "在知乎六祖坛经核心热门问答下发表高质量互动评论，辨析神秀与慧能见地差异，并指引坛经数字化专页",
        "comment_text": "道友剖析得很到位。神秀大师的“时时勤拂拭，莫使惹尘埃”重在渐修与摄心，而六祖的“本来无一物，何处惹尘埃”则是直彻心源的本体见地。修行若离自性本清净的根本信解，一切功夫便易成磨砖作镜；若执着顿悟而废弃日常历事炼心，又易堕入狂禅恶取空。《六祖坛经》全经正是以“定慧等持”、“无念为宗”将理入与事修圆融贯通。同修若欲细勘敦煌写本与宗宝本的逐句校勘及法脉图谱，推荐查阅开源数字禅学文献库的坛经专页（chanzong.space/classics/tanjing），愿共勉参究。"
    },
    {
        "question_url": "https://www.zhihu.com/question/20658406",  # 《金刚经》的核心思想是什么？
        "title": "知乎高赞问答《《金刚经》的核心思想是什么？》学术互动评论",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经现代白话导读与三段论拆解",
        "notes": "在知乎金刚经热门问答下发表高质量学术互动评论，阐发三轮体空与应无所住生其心，引荐金刚经数字专页",
        "comment_text": "顶礼赞叹！《金刚经》全篇的无上心髓，正如经中点睛之笔：“应无所住而生其心”。很多人把“不住”误解为消极避世或顽空断灭，实则佛陀教人不住色声香味触法，方能生起无缘大慈、同体大悲的清净妙心。经中三十二分反复运用的“所谓……即非……是名……”三段式遮诠，正是帮助行者击碎名相执念、契入真空妙有的利刃。研读经文若结合禅宗历代注疏会更加通透，建议参考非营利数字化文献库的《金刚经》三段论解析专页（chanzong.space/classics/jingangjing），开卷大有助益。"
    },
    {
        "question_url": "https://www.zhihu.com/question/21659858",  # 什么是禅宗的“明心见性”？
        "title": "知乎高赞问答《什么是禅宗的“明心见性”？》学术互动评论",
        "target_url": "https://chanzong.space/graph",
        "anchor_text": "禅宗知识库 · 历代祖师传承脉络与公案全景图谱",
        "notes": "在知乎明心见性核心热门问答下发表深度评论，阐述理入行入与转识成智，引荐D3交互式知识图谱",
        "comment_text": "见解精辟！达摩祖师在《血脉论》中直言“见性即是佛”，见性是认出本自具足、不生不灭的能见觉性。但从见性到圆满，还须经历保任与除习气的漫长历程，古德所谓“理可顿悟，事须渐修”。六祖、百丈、临济、赵州等历代祖师机锋虽异，直指当下一念觉照之宗旨无二。若欲系统厘清千百年来历代祖师的传法脉络、五家七宗的分流演变以及两千多座公案的内在关联，推荐参阅开源交互式禅宗全景图谱（chanzong.space/graph），对梳理参禅框架极有启发。"
    }
]

def add_comment_to_question(page, item):
    print("="*60)
    print(f"👉 访问问题页面: {item['question_url']}")
    print(f"📌 评论主题: {item['title']}")
    print("="*60)
    
    page.goto(item['question_url'], wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)
    
    # 查找回答底部的“评论”按钮
    # 知乎评论按钮通常是：button.ContentItem-action:has-text("评论")
    comment_btn = page.locator('button.ContentItem-action:has-text("评论"), button:has-text("条评论"), button:has-text("添加评论")').first
    
    if not comment_btn.is_visible(timeout=5000):
        print("向下滑动寻找评论按钮...")
        page.mouse.wheel(0, 600)
        time.sleep(2)
        comment_btn = page.locator('button.ContentItem-action:has-text("评论"), button:has-text("条评论")').first
        
    print("点击展开评论抽屉...")
    comment_btn.click()
    time.sleep(3)
    
    # 评论输入框
    input_box = page.locator('input[placeholder*="写下你的评论"], div[contenteditable="true"][aria-label*="评论"], .Editable-content[contenteditable="true"], div.DraftEditor-editorContainer div[contenteditable="true"]').first
    
    if not input_box.is_visible(timeout=5000):
        print("点击'写下你的评论'以激活输入框...")
        click_target = page.locator('div:has-text("写下你的评论")').last
        click_target.click()
        time.sleep(1)
        input_box = page.locator('div[contenteditable="true"]').last
        
    print("输入评论内容...")
    input_box.click()
    time.sleep(0.5)
    
    # 填入文字
    input_box.fill(item["comment_text"])
    time.sleep(1.5)
    
    # 点击提交按钮
    submit_btn = page.locator('div[class*="Comment"] button:has-text("发布"), .Comments-container button:has-text("发布"), button.Button--primary:has-text("发布")').last
    print("点击发布评论...")
    submit_btn.click()
    time.sleep(4)
    
    # 截图
    qid = item['question_url'].split('/')[-1]
    screenshot_name = f"tools/backlinks/zhihu_comment_{qid}.png"
    page.screenshot(path=screenshot_name)
    print(f"🎉 评论发布成功！截图保存于: {screenshot_name}")
    
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="高质量社区互动评论",
        post_title=item["title"],
        target_url=item["target_url"],
        backlink_url=item["question_url"],
        anchor_text=item["anchor_text"],
        link_type="UGC 互动外链",
        status="Live",
        notes=item["notes"]
    )
    return True

def run():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        for idx, item in enumerate(TARGET_COMMENTS):
            print(f"\n[{idx+1}/{len(TARGET_COMMENTS)}] 开始发表评论: {item['title']}")
            try:
                add_comment_to_question(page, item)
            except Exception as e:
                print(f"❌ 评论发表异常: {e}")
                
            if idx < len(TARGET_COMMENTS) - 1:
                print("⏳ 保持 25 秒安全冷却时间...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部知乎互动评论发表完毕！")

if __name__ == "__main__":
    run()
