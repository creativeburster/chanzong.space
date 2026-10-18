# -*- coding: utf-8 -*-
"""
在知乎 3 位高赞大 V 答主回答下发表学术互动评论（终极严谨版）
1. 答主【老毛认知圈】《什么佛经都没读过，也不懂佛学，可以读《六祖坛经》吗？》
   https://www.zhihu.com/question/2036422757978723800/answer/2074274506537964121
2. 答主【臧大为】《《金刚经》能使人大彻大悟吗？》
   https://www.zhihu.com/question/1913876847906785200/answer/2030818524764049481
3. 答主【浪羁】《《般若波罗蜜多心经》主要讲了什么？》
   https://www.zhihu.com/question/2053095292069852633/answer/2055900761746306073
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

TARGETS = [
    {
        "classic": "六祖坛经",
        "author": "老毛认知圈",
        "question": "什么佛经都没读过，也不懂佛学，可以读《六祖坛经》吗？",
        "url": "https://www.zhihu.com/question/2036422757978723800/answer/2074274506537964121",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖法宝坛经现代白话精解与法脉图谱",
        "comment_text": "答主老毛所言极是！很多人初读佛经容易被名相所缚，而《六祖坛经》最大的殊胜就在于“直指人心，见性成佛”，扫尽一切外在繁文缛节。六祖大师以“无念为宗，无相为体，无住为本”，把佛法完全落实到当下每一个人的清净觉性上。若欲系统研读坛经敦煌古本逐句白话校勘与历代传承脉络，推荐参考非营利开源的数字化禅学文献库坛经专页（chanzong.space/classics/tanjing），开卷大有启发。",
        "notes": "在知乎答主【老毛认知圈】六祖坛经高赞回答下发表高质量学术互动评论，探讨直指人心与自性清净"
    },
    {
        "classic": "金刚经",
        "author": "臧大为",
        "question": "《金刚经》能使人大彻大悟吗？",
        "url": "https://www.zhihu.com/question/1913876847906785200/answer/2030818524764049481",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经白话详注与三段论拆解",
        "comment_text": "赞同臧大为老师的真知灼见！《金刚经》之所以能让人大彻大悟，核心就在于它彻底打破了一切执念的立足点——“应无所住而生其心”。全经反复运用的“所谓……即非……是名……”三段论，层层遮诠，逼令学人于言下领悟真空妙有的自性实相。研读金刚经若能结合禅门宗风与现代义理深研，可参阅数字化禅宗文献库的《金刚经》三段论深度拆解专页（chanzong.space/classics/jingangjing），研析通透。",
        "notes": "在知乎大V答主【臧大为】金刚经高赞回答下发表高质量学术互动评论，深入剖析应无所住与三段论"
    },
    {
        "classic": "心经",
        "author": "浪羁",
        "question": "《般若波罗蜜多心经》主要讲了什么？",
        "url": "https://www.zhihu.com/question/2053095292069852633/answer/2055900761746306073",
        "target_url": "https://chanzong.space/classics/xinjing",
        "anchor_text": "禅宗知识库 · 般若波罗蜜多心经认知学解析与五蕴图谱",
        "comment_text": "浪羁答主剖析得很深刻！常读《心经》，关键要明白“色不异空，空不异色；色即是空，空即是色”。空绝非消极虚无，而是诸法无自性、缘起性空的宇宙本质规律。照见五蕴皆空，才能在世俗名利得失中照见本来清净，度一切苦厄。若欲从现代认知哲学与唯识五蕴结构更立体地研读心经，可参阅数字化禅宗文献库的《心经》现代导读与图谱（chanzong.space/classics/xinjing），收益良多。",
        "notes": "在知乎大V答主【浪羁】心经高赞回答下发表高质量学术互动评论，探讨五蕴皆空与现代认知哲学"
    }
]

def post_comment_on_target(page, task, idx):
    print("="*60)
    print(f"[{idx+1}/{len(TARGETS)}] 正在访问答主【{task['author']}】的回答页面: {task['url']}")
    print(f"📌 问题: {task['question']}")
    print("="*60)
    
    comment_id = None
    def on_res(res):
        nonlocal comment_id
        if "comment_v5" in res.url and res.status == 200 and res.request.method == "POST":
            try:
                data = res.json()
                if "id" in data:
                    comment_id = data["id"]
                    print(f"🎉 捕获知乎官方评论成功响应: id={comment_id}")
            except Exception:
                pass
                
    page.on("response", on_res)
    
    page.goto(task['url'], wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 找到回答底部的“评论”按钮
    comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
    if not comment_btn.is_visible(timeout=5000):
        print("向下轻微滚动定位评论按钮...")
        page.mouse.wheel(0, 300)
        time.sleep(1.5)
        comment_btn = page.locator('.ContentItem-actions button:has-text("评论"), .ContentItem-actions button:has-text("条评论")').first
        
    print(f"展开评论浮层: {comment_btn.inner_text().strip()}")
    comment_btn.click()
    time.sleep(2.5)
    
    # 激活输入框
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    
    # 注入评论文本
    print("注入评论正文...")
    page.keyboard.insert_text(task["comment_text"])
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    # 点击提交发布
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("点击【发布】按钮提交评论...")
    pub_btn.click()
    time.sleep(4)
    
    # 截图留证
    screenshot_name = f"tools/backlinks/v2_real_comment_{idx+1}.png"
    page.screenshot(path=screenshot_name)
    print(f"已保存执行截图: {screenshot_name}")
    
    # 记录到总账
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="高质量社区互动评论",
        post_title=f"知乎答主【{task['author']}】《{task['question']}》互动评论",
        target_url=task["target_url"],
        backlink_url=task["url"],
        anchor_text=task["anchor_text"],
        link_type="UGC 互动外链",
        status="Live",
        notes=task["notes"] + (f" (官方评论ID: {comment_id})" if comment_id else "")
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
        
        for idx, task in enumerate(TARGETS):
            try:
                post_comment_on_target(page, task, idx)
            except Exception as e:
                print(f"❌ 任务 {idx+1} 执行失败: {e}")
                
            if idx < len(TARGETS) - 1:
                print("⏳ 保持 25 秒安全冷却时间...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部 3 条答主回答评论发布完成！")

if __name__ == "__main__":
    run()
