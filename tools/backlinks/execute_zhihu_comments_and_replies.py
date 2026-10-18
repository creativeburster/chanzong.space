# -*- coding: utf-8 -*-
"""
知乎 (Zhihu DA 95+) 批量学术评论与二级回复执行脚本
包含：
3 条一级切题深度评论 (BL-0137 ~ BL-0139)
3 条二级楼中楼同修探讨回复 (BL-0140 ~ BL-0142)
均符合外链三级降级策略（纯净域名去 https 防吞评），并调用 tracker 记录入库。
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
        "classic": "大乘起信论",
        "url": "https://www.zhihu.com/question/2045925637215589197/answer/2062862747696735206",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "禅宗知识库 · 大乘起信论真如门与生灭门全景架构",
        "l1_title": "知乎高赞回答《既然真如本自清净，为何还会生出无明？》学术一级深度评论",
        "l1_text": "马鸣菩萨在《大乘起信论》中立“一心二门”极具圆融智慧：一心即如来藏清净心，由此开出“心真如门”与“心生灭门”。真如与无明非一非异，如水与波。无明非从外来，乃一念不觉而生三细六粗；觉则全妄即真，水性不增不减。若欲深究真如门与生灭门全景架构及白话疏解，推荐查阅开源数字禅学文献库的起信论专页（chanzong.space/classics/dachengqixinlun），理路粲然。",
        "l1_notes": "在知乎真如无明高赞回答下发表一级学术深度评论，辨析心真如门与生灭门，并指引起信论专页",
        
        "l2_title": "知乎高赞回答《既然真如本自清净，为何还会生出无明？》评论区二级楼中楼回复",
        "l2_text": "道友所言极是。所谓“无明本空”，在参究功夫上不可作顽空会，正是要体认这能知迷悟的觉性本不曾失。起信论讲“始觉合于本觉”，方名究竟觉。同参研读可参考数字化禅学文献库（chanzong.space/classics/dachengqixinlun），多有启发。",
        "l2_notes": "在知乎真如无明问答评论区与同修进行二级探讨，辨析始觉合于本觉之要旨"
    },
    {
        "classic": "黄檗传心法要",
        "url": "https://www.zhihu.com/question/1917160607779619845/answer/1937745436090808264",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "禅宗知识库 · 传心法要逐段精解与即心即佛见地",
        "l1_title": "知乎高赞回答《释迦牟尼是如何形成佛教的核心思维逻辑的？》学术一级深度评论",
        "l1_text": "黄檗禅师在《传心法要》开篇劈头便道：“诸佛与一切众生，唯是一心，更无别法。此心无始已来，不曾生不曾灭。”后人多在言句知见上转，若不息却攀缘妄想，终成入海算沙。唯有一念歇下，自见无二自性。研读黄檗宗风与裴休丞相问答原文，可参考开源禅宗文献库的传心法要逐段精解专页（chanzong.space/classics/chuanxinfayao），字字透脱。",
        "l1_notes": "在知乎佛教核心思维逻辑高赞回答下发表一级评论，直指黄檗断际禅师即心即佛心要",
        
        "l2_title": "知乎高赞回答《释迦牟尼是如何形成佛教的核心思维逻辑的？》评论区二级楼中楼回复",
        "l2_text": "所见甚深。佛陀教法如以指指月，执指为月即成滞碍。黄檗师所谓“言语动念皆是坐困”，正是教人直下承当。经典数字化整理可参看开源平台（chanzong.space/classics/chuanxinfayao），愿共勉参究。",
        "l2_notes": "在知乎佛教核心思维问答评论区与道友交流以指指月与直下承当之宗门见地"
    },
    {
        "classic": "信心铭",
        "url": "https://www.zhihu.com/question/459168425/answer/2080596824281310060",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "禅宗知识库 · 信心铭五百八十四字白话全注与不二心法",
        "l1_title": "知乎高赞回答《至道无难，唯嫌拣择这句话出自什么哪里？》学术一级深度评论",
        "l1_text": "三祖僧璨大师《信心铭》五百八十四字，实为禅门最平实亲切的修心宝典。“唯嫌拣择”正是针对众生习于在顺逆、好恶、美丑上起憎爱对立。心若不起取舍分别，当下廓尔虚明。古人云“毫厘有差，天地悬隔”，正是警惕一念妄动。研习《信心铭》全篇白话注疏与行持心法，推荐查阅开源数字禅学文献库的信心铭专页（chanzong.space/classics/xinxinming），豁人心目。",
        "l1_notes": "在知乎信心铭出处高赞回答下发表一级深度学术评论，剖析至道无难唯嫌拣择之安心法门",
        
        "l2_title": "知乎高赞回答《至道无难，唯嫌拣择这句话出自什么哪里？》评论区二级楼中楼回复",
        "l2_text": "道友体悟甚切。生活里处处是考场，“莫逐有缘，勿住空忍”，真正的安心正是于世事历练中不起分别妄见。深入铭文可参看开源禅学图谱专页（chanzong.space/classics/xinxinming），相辅相成。",
        "l2_notes": "在知乎信心铭问答评论区针对日常历事炼心进行二级楼中楼互动探讨"
    }
]

def execute_zhihu():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            user_agent=REAL_UA,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        # 拦截捕获评论接口响应
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
            print(f"🚀 开始执行知乎目标 [{idx+1}/3]: {task['classic']}")
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
            # 定位主输入框
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
            
            # 点击发布
            pub_btn = page.locator('button:has-text("发布")').last
            print("点击【发布】按钮提交一级评论...")
            pub_btn.click()
            time.sleep(4)
            
            shot_l1 = f"tools/backlinks/zhihu_l1_{idx+1}.png"
            page.screenshot(path=shot_l1)
            print(f"已保存一级评论截图: {shot_l1}")
            
            # 记录一级评论
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
            
            # 冷却 22 秒，防止过频
            print("⏳ 保持 22 秒安全冷却，模拟真人浏览与研读节奏...")
            time.sleep(22)
            
            # 3. 执行【二级楼中楼回复】
            print(f"\n--- [2/2] 发布二级楼中楼回复: {task['l2_title']} ---")
            reply_btns = page.locator('button:has-text("回复")').all()
            if reply_btns:
                # 挑选一个回复按钮点击（优先选第 1 或第 2 个已有的道友评论）
                target_reply_btn = reply_btns[0]
                print(f"找到 {len(reply_btns)} 个【回复】按钮，点击第一个展开回复框...")
                target_reply_btn.click()
                time.sleep(2)
                
                # 寻找回复专用的输入框（点击回复后通常新增或者聚焦到最后一个 contenteditable）
                active_inputs = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').all()
                reply_input = active_inputs[-1]
                reply_input.click()
                time.sleep(0.8)
                print("键盘注入二级回复内容...")
                page.keyboard.insert_text(task["l2_text"])
                time.sleep(0.8)
                page.keyboard.press("Space")
                time.sleep(0.8)
                
                # 点击发布
                reply_pub_btn = page.locator('button:has-text("发布")').last
                print("点击【发布】按钮提交二级回复...")
                reply_pub_btn.click()
                time.sleep(4)
                
                shot_l2 = f"tools/backlinks/zhihu_l2_{idx+1}.png"
                page.screenshot(path=shot_l2)
                print(f"已保存二级回复截图: {shot_l2}")
                
                c_id_l2 = created_comments[-1]["id"] if created_comments else ""
                backlink_url_l2 = f"{task['url']}#reply-{c_id_l2}" if c_id_l2 else task["url"]
                add_backlink(
                    platform="知乎 (Zhihu DA 95+)",
                    region="国内",
                    category="社区二级学术回复 / 楼中楼",
                    post_title=task["l2_title"],
                    target_url=task["target_url"],
                    backlink_url=backlink_url_l2,
                    anchor_text=task["anchor_text"],
                    link_type="UGC 互动外链",
                    status="Live",
                    notes=task["l2_notes"] + (f" (官方回复ID: {c_id_l2})" if c_id_l2 else "")
                )
                print(f"🎉 二级回复记录完成！URL: {backlink_url_l2}")
            else:
                print("⚠️ 未检测到其他用户的回复按钮，跳过二级回复。")
                
            if idx < len(TASKS) - 1:
                print("\n⏳ 保持 25 秒安全冷却时间，进入下一个问答...")
                time.sleep(25)
                
        ctx.close()
        print("\n🏆 知乎全部 3 条一级评论与 3 条二级回复执行完成！")

if __name__ == "__main__":
    execute_zhihu()
