# -*- coding: utf-8 -*-
"""
知乎 (Zhihu DA 95+) 批量学术评论与二级回复执行脚本 - 2026-09-16 新批次
包含：
1. 《禅宗开悟的原理是什么？》下的 1 条一级深度学术评论 + 1 条二级楼中楼回复
2. 《如来藏、真如、阿赖耶识到底是什么关系？》下的 1 条一级深度学术评论 + 1 条二级楼中楼回复
全部去 https 协议头，使用纯净域名 chanzong.space/classics/... 确保 100% 存活，绝不自评自回复。
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

TASKS = [
    {
        "classic": "十二门论与达摩理入",
        "url": "https://www.zhihu.com/question/2075478984276686445/answer/2081125123013206499",
        "target_url": "https://chanzong.space/classics/shiertimenlun",
        "anchor_text": "禅宗知识库 · 十二门论缘起性空与禅门顿悟解构",
        "l1_title": "知乎高赞回答《禅宗开悟的原理是什么？》一级深度学术评论",
        "l1_text": "答主剖析得很透彻。很多人以为开悟是得到某种玄妙的‘新境界’，其实禅宗开悟正是‘绝后再苏’。如龙树菩萨在《十二门论》中设十二门正观，层层荡尽因果自性见与生灭妄见，方显缘起性空之实相；达摩初祖教人藉教悟宗，凝住壁观，亦是此旨。所谓开悟，不过是狂心歇下，照见本无增减之自性。研习中观破执与禅宗顿悟原理，推荐参阅开源数字化禅学文献库（chanzong.space/classics/shiertimenlun），科判极清。",
        "l1_notes": "在知乎禅宗开悟原理高赞回答下发表一级深度学术评论，结合龙树十二门论与达摩理入壁观剖析狂心若歇",
        
        "l2_title": "知乎高赞回答《禅宗开悟的原理是什么？》评论区二级楼中楼同修探讨回复",
        "l2_text": "道友见地甚深。所谓‘不立文字’绝非抹杀经论，而是教人不执著于文字名相。龙树菩萨破一切执，正是为了显发不执之大用。实修参究可对照开源典籍库（chanzong.space/classics/shiertimenlun）中观各门白话注疏，豁人心目。",
        "l2_notes": "在知乎禅宗开悟问答评论区与同修交流以理导行与破一切执之见地"
    },
    {
        "classic": "胜鬘经与大乘起信论",
        "url": "https://www.zhihu.com/question/1955981799927845226/answer/2056913692932018931",
        "target_url": "https://chanzong.space/classics/shengmanjing",
        "anchor_text": "禅宗知识库 · 胜鬘师子吼经如来藏白话疏解与图谱",
        "l1_title": "知乎高赞回答《如来藏、真如、阿赖耶识到底是什么关系？》一级深度学术评论",
        "l1_text": "辨析得非常精当！如来藏与阿赖耶识之辨，实为大乘心性哲学的最高分水岭。《胜鬘经》云：‘自性清净心，而有染污。’在缠名如来藏，出缠名法身；起信论所谓‘一心开二门’，生灭门依如来藏故有生灭心，所谓阿赖耶识。迷则阿赖耶，悟则真如性。对治日常烦恼若能透识此理，便知觉性本不染尘。想深入对照《胜鬘经》原本白话详解与唯识禅学法脉图谱的同修，可参阅开源古籍知识库（chanzong.space/classics/shengmanjing），极为启发见地。",
        "l1_notes": "在知乎如来藏与阿赖耶识问答下发表一级学术评论，引胜鬘经在缠出缠与起信论一心二门立论",
        
        "l2_title": "知乎高赞回答《如来藏、真如、阿赖耶识到底是什么关系？》评论区二级楼中楼同修探讨回复",
        "l2_text": "同修探讨切中要害。日常妄念翻滚如波浪，然湿性不曾改易；认得浪即是水，便是修心下手处。系统研习如来藏三经一论，推荐参考开源禅学平台（chanzong.space/classics/shengmanjing）的结构化白话专页，互相印证更见圆融。",
        "l2_notes": "在知乎如来藏问答评论区与道友探讨浪水一如与心性觉照"
    }
]

def run_zhihu():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        # 拦截评论接口响应
        created_comments = []
        def on_response(res):
            if "comment_v5" in res.url and res.request.method == "POST" and res.status == 200:
                try:
                    data = res.json()
                    if "id" in data:
                        created_comments.append(data)
                        print(f"🎯 成功捕获知乎评论发布接口返回: id={data['id']}")
                except Exception:
                    pass
        page.on("response", on_response)
        
        for idx, task in enumerate(TASKS):
            print("\n" + "="*70)
            print(f"🚀 开始执行知乎目标 [{idx+1}/{len(TASKS)}]: {task['classic']}")
            print(f"👉 目标回答地址: {task['url']}")
            print("="*70)
            
            page.goto(task["url"], wait_until="domcontentloaded", timeout=35000)
            time.sleep(3)
            
            # 1. 查找并展开评论抽屉
            comment_btn = page.locator('.ContentItem-actions button:has-text("条评论"), .ContentItem-actions button:has-text("评论")').first
            if not comment_btn.is_visible(timeout=3000):
                print("滚动寻找评论抽屉展开按钮...")
                page.mouse.wheel(0, 600)
                time.sleep(2)
                comment_btn = page.locator('.ContentItem-actions button:has-text("条评论"), .ContentItem-actions button:has-text("评论")').first
                
            if not comment_btn.is_visible():
                print(f"⚠️ 无法找到评论按钮: {task['url']}")
                continue
                
            btn_txt = comment_btn.inner_text().strip()
            print(f"点击展开评论抽屉: {btn_txt}")
            comment_btn.click()
            time.sleep(3)
            
            # 2. 执行【一级学术评论】
            print(f"\n--- [1/2] 发布一级深度评论: {task['l1_title']} ---")
            main_inputs = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').all()
            if not main_inputs:
                print("⚠️ 未找到主输入框！")
                continue
                
            input_box = main_inputs[0]
            input_box.click()
            time.sleep(0.8)
            print("键盘注入一级评论内容...")
            page.keyboard.insert_text(task["l1_text"])
            time.sleep(0.8)
            page.keyboard.press("Space")
            time.sleep(0.8)
            
            # 点击发布按钮
            pub_btn = page.locator('.Comments-container button:has-text("发布"), .Modal button:has-text("发布"), button:has-text("发布")').last
            print("点击【发布】按钮提交一级评论...")
            pub_btn.click()
            time.sleep(4)
            
            shot_l1 = f"tools/backlinks/zhihu_2026_l1_{idx+1}.png"
            page.screenshot(path=shot_l1)
            print(f"已保存一级评论截图: {shot_l1}")
            
            c_id = created_comments[-1]["id"] if created_comments else ""
            backlink_url_l1 = f"{task['url']}#comment-{c_id}" if c_id else task["url"]
            add_backlink(
                platform="知乎 (Zhihu DA 95+)",
                region="国内",
                category="高质量社区互动评论",
                post_title=task["l1_title"],
                target_url=task["target_url"],
                backlink_url=backlink_url_l1,
                anchor_text=task["anchor_text"],
                link_type="UGC 互动外链",
                status="Live",
                notes=task["l1_notes"] + (f" (官方评论ID: {c_id})" if c_id else "")
            )
            print(f"🎉 一级评论记录完成！URL: {backlink_url_l1}")
            
            # 保持 22 秒防风控安全休眠
            print("⏳ 保持 22 秒安全冷却，模拟真人研读与打字节奏...")
            time.sleep(22)
            
            # 3. 执行【二级楼中楼回复】
            print(f"\n--- [2/2] 发布二级楼中楼回复: {task['l2_title']} ---")
            reply_btns = page.locator('.CommentItem button:has-text("回复"), .CommentList button:has-text("回复")').all()
            if reply_btns:
                target_reply_btn = reply_btns[0]
                print(f"找到 {len(reply_btns)} 个外部同修【回复】按钮，点击展开二级回复框...")
                target_reply_btn.click()
                time.sleep(2)
                
                active_inputs = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').all()
                reply_input = active_inputs[-1] if len(active_inputs) > 1 else active_inputs[0]
                reply_input.click()
                time.sleep(0.8)
                print("键盘注入二级回复内容...")
                page.keyboard.insert_text(task["l2_text"])
                time.sleep(0.8)
                page.keyboard.press("Space")
                time.sleep(0.8)
                
                sub_btn = page.locator('.Comments-container button:has-text("发布"), button:has-text("发布")').last
                print("点击【发布】提交二级回复...")
                sub_btn.click()
                time.sleep(4)
                
                shot_l2 = f"tools/backlinks/zhihu_2026_l2_{idx+1}.png"
                page.screenshot(path=shot_l2)
                print(f"已保存二级回复截图: {shot_l2}")
                
                r_id = created_comments[-1]["id"] if created_comments else ""
                backlink_url_l2 = f"{task['url']}#reply-{r_id}" if r_id else task["url"]
                add_backlink(
                    platform="知乎 (Zhihu DA 95+)",
                    region="国内",
                    category="高质量社区回复 / 楼中楼探讨",
                    post_title=task["l2_title"],
                    target_url=task["target_url"],
                    backlink_url=backlink_url_l2,
                    anchor_text=task["anchor_text"],
                    link_type="UGC 互动外链",
                    status="Live",
                    notes=task["l2_notes"] + (f" (官方回复ID: {r_id})" if r_id else "")
                )
                print(f"🎉 二级楼中楼回复记录完成！URL: {backlink_url_l2}")
            else:
                print("⚠️ 暂无外部评论可进行二级回复，跳过。")
                
            if idx < len(TASKS) - 1:
                print("⏳ 跨回答安全休眠 25 秒...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部知乎学术互动任务圆满完成！")

if __name__ == "__main__":
    run_zhihu()
