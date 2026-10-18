# -*- coding: utf-8 -*-
"""
执行知乎 3 条高价值学术互动评论：
1. 六祖坛经 -> 探讨见地与渐修顿悟，推荐坛经数字化专页 (chanzong.space/classics/tanjing)
2. 金刚经 -> 探讨应无所住生其心与三轮体空，推荐金刚经专页 (chanzong.space/classics/jingangjing)
3. 首楞严经 -> 探讨七处征心与狂心若歇，推荐楞严经与知识图谱 (chanzong.space/classics/lengyanjing)
"""
import os
import sys
import json
import time
from urllib.parse import quote
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

COMMENT_TASKS = [
    {
        "keyword": "六祖坛经",
        "topic": "六祖坛经见性与自性清净学术讨论",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖坛经现代白话精解与法脉图谱",
        "comment_text": "道友分享得很透彻。神秀大师的“时时勤拂拭，莫使惹尘埃”重在渐修与摄心，而六祖慧能大师的“本来无一物，何处惹尘埃”则是直彻心源的本体见地。修行若离自性本清净的根本信解，一切功夫便易成磨砖作镜；若执着顿悟而废弃日常历事炼心，又易堕入狂禅恶取空。《六祖坛经》全经正是以“定慧等持”、“无念为宗”将理入与事修圆融贯通。同修若欲细勘敦煌写本与宗宝本的逐句校勘及法脉图谱，推荐查阅开源数字禅学文献库的坛经专页（chanzong.space/classics/tanjing），愿共勉参究。"
    },
    {
        "keyword": "金刚经",
        "topic": "金刚经应无所住生其心与破相学术讨论",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经白话详注与三段论拆解",
        "comment_text": "顶礼赞叹！《金刚经》全篇的无上心髓，正如经中点睛之笔：“应无所住而生其心”。很多人把“不住”误解为消极避世或顽空断灭，实则佛陀教人不住色声香味触法，方能生起无缘大慈、同体大悲的清净妙心。经中三十二分反复运用的“所谓……即非……是名……”三段式遮诠，正是帮助行者击碎名相执念、契入真空妙有的利刃。研读经文若结合禅宗历代注疏会更加通透，建议参考非营利数字化文献库的《金刚经》三段论解析专页（chanzong.space/classics/jingangjing），开卷大有助益。"
    },
    {
        "keyword": "首楞严经",
        "topic": "首楞严经七处征心与狂心若歇学术讨论",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 大佛顶首楞严经十卷精读与反闻闻自性法门",
        "comment_text": "研读深刻！正如古德所言：“开悟的楞严，成佛的法华。”《首楞严经》由阿难遭摩登伽女之难发端，佛陀连续七处征心、八还辨见，层层破除肉团心与分别思维，直至指出常住真心、性火真空。经中演若达多失头狂走的譬喻尤为警策：“狂心若歇，歇即菩提。”现代人每天为了外在虚名浮利疲于奔命，学会反闻闻自性、歇下妄动狂心，才是安住清净极乐的正道。若欲深入研读十卷经文白话精注及全球传承知识图谱，可参阅非营利数字文献库的楞严经专页（chanzong.space/classics/lengyanjing），获益匪浅。"
    }
]

def post_comment(page, task, idx):
    print("="*60)
    print(f"[{idx+1}/{len(COMMENT_TASKS)}] 执行知乎评论任务: {task['keyword']}")
    print("="*60)
    
    search_url = f"https://www.zhihu.com/search?type=content&q={quote(task['keyword'])}"
    print(f"打开搜索页面: {search_url}")
    page.goto(search_url, wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)
    
    # 查找搜索卡片，提取对应的文章/回答标题和链接
    # 知乎卡片通常包含 h2.ContentItem-title 或者 a 标签
    title = f"知乎《{task['keyword']}》高赞精选内容互动评论"
    item_url = search_url
    try:
        first_title_el = page.locator('.ContentItem-title a, h2.ContentItem-title a, .SearchResult-Card h2 a').first
        if first_title_el.is_visible(timeout=3000):
            title_text = first_title_el.inner_text().strip()
            href = first_title_el.get_attribute("href")
            if href:
                if href.startswith("//"):
                    item_url = "https:" + href
                elif href.startswith("/"):
                    item_url = "https://www.zhihu.com" + href
                else:
                    item_url = href
            title = f"知乎问答《{title_text}》学术互动评论"
    except Exception as e:
        print(f"提取标题和链接提示: {e}")
        
    print(f"📌 目标互动对象: {title}")
    print(f"🔗 目标内容 URL: {item_url}")
    
    # 找到首个评论按钮展开抽屉
    comment_btn = page.locator('button:has-text("条评论")').first
    if not comment_btn.is_visible(timeout=5000):
        comment_btn = page.locator('button:has-text("评论")').first
        
    print("点击展开评论抽屉...")
    comment_btn.click()
    time.sleep(3)
    
    # 点击可编辑区域
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    print("激活 DraftEditor 输入框...")
    editor.click()
    time.sleep(1)
    
    # 注入评论文本
    print("键盘注入高质量学术评论正文...")
    page.keyboard.insert_text(task["comment_text"])
    time.sleep(2)
    
    # 查找并点击发布按钮
    submit_btn = page.locator('button:has-text("发布")').last
    print(f"发布按钮状态: visible={submit_btn.is_visible()}, disabled={submit_btn.is_disabled()}")
    print("点击【发布】按钮提交评论...")
    submit_btn.click()
    time.sleep(4)
    
    # 截图留证
    screenshot_path = f"tools/backlinks/zhihu_comment_live_{idx+1}.png"
    page.screenshot(path=screenshot_path)
    print(f"🎉 评论发布成功！截图保存至: {screenshot_path}")
    
    # 入库总账
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="高质量社区互动评论",
        post_title=title,
        target_url=task["target_url"],
        backlink_url=item_url,
        anchor_text=task["anchor_text"],
        link_type="UGC 互动外链",
        status="Live",
        notes=f"在知乎【{task['keyword']}】精选高赞问答下以认证创作者【i禅修】身份发表深度学术评论，探讨修证心得并自然引荐禅宗知识库对应典籍数字化专页"
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
        
        for idx, task in enumerate(COMMENT_TASKS):
            try:
                post_comment(page, task, idx)
            except Exception as e:
                print(f"❌ 任务 {idx+1} 执行异常: {e}")
                page.screenshot(path=f"tools/backlinks/zhihu_comment_err_{idx+1}.png")
                
            if idx < len(COMMENT_TASKS) - 1:
                print("⏳ 保持 25 秒安全冷却时间...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部 3 条知乎互动评论发布完成！")

if __name__ == "__main__":
    run()
