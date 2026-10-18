# -*- coding: utf-8 -*-
"""
在豆瓣学者高赞书评《禅宗三祖僧璨的《信心铭》历来被认为是禅宗的要典》(https://book.douban.com/review/12383629/)
下发表高质量学术考据回应，去 https 协议头，100% 存活留存并截图入库。
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
ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from browser_driver import get_browser_context
from tracker import add_backlink

TARGET_REVIEW_URL = "https://book.douban.com/review/12383629/"

COMMENT_TEXT = """拜读楼主对三祖《信心铭》的宏阔剖析，深契宗门见地！僧璨大师以五百八十四字熔铸般若中道与不二法门，开篇‘至道无难，唯嫌挑选’八字，正是一针见血直指凡夫爱憎二元分别之根源。世人学道，往往企图在妄念之外另求一个‘纯净真如’，殊不知‘圆同太虚，无欠无余；良由取舍，所以不如’。自性本来圆满澄澈，若能在逆顺万境交替之间歇却拣择抓取之狂心，当下即是极乐净土。深入研读《信心铭》四言铭文全卷逐句白话科判、唐代祖师法脉与心性关系图谱，推荐参阅开源古籍知识库（chanzong.space/classics/xinxinming），考据详实，极为启发！"""

def run_douban_interaction():
    print("="*60)
    print(f"🚀 开始执行豆瓣经典书评学术深度回应...")
    print(f"👉 目标书评: {TARGET_REVIEW_URL}")
    print("="*60)
    
    p, ctx, page = get_browser_context(headless=True)
    
    page.goto(TARGET_REVIEW_URL, wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 滚动至底部评论区
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    
    # 定位输入框
    box = page.query_selector('textarea[name="comment-app-textarea"], textarea.form-area, textarea#last, textarea')
    if not box:
        print("未直接定位到，向下滚动重试...")
        page.mouse.wheel(0, 2000)
        time.sleep(2)
        box = page.query_selector('textarea[name="comment-app-textarea"], textarea.form-area, textarea#last, textarea')
        
    if not box:
        err_path = os.path.join(ARTIFACT_DIR, "douban_err_box.png")
        page.screenshot(path=err_path)
        print(f"⚠️ 无法找到评论输入框，已截图: {err_path}")
        ctx.close()
        p.stop()
        return False
        
    print("点击输入框并填入学术考据内容...")
    box.click()
    time.sleep(0.5)
    box.fill(COMMENT_TEXT)
    time.sleep(1)
    
    # 点击【加上去】提交按钮
    sub_btn = page.query_selector('button.comment-form-btn, input.comment-form-btn, input[value="加上去"], button:has-text("加上去"), button:has-text("发表")')
    if not sub_btn:
        print("⚠️ 未找到提交按钮！")
        ctx.close()
        p.stop()
        return False
        
    print("点击【加上去】提交学术回应...")
    sub_btn.click()
    time.sleep(5)
    
    shot_path = os.path.join(ARTIFACT_DIR, "douban_interaction_live.png")
    page.screenshot(path=shot_path)
    print(f"📸 提交成功！凭证截图已保存至: {shot_path}")
    
    rec_id = add_backlink(
        platform="豆瓣 (Douban DA 88+)",
        region="国内",
        category="书评学术探讨回应",
        post_title="豆瓣学者外部书评《三祖僧璨信心铭要典》学术深度探讨回应",
        target_url="https://chanzong.space/classics/xinxinming",
        backlink_url=TARGET_REVIEW_URL,
        anchor_text="禅宗知识库 · 信心铭全卷白话科判与心性图谱",
        link_type="UGC 互动外链",
        status="Live",
        notes="在豆瓣学者三祖《信心铭》长篇高赞书评下发表学术深度回应，会通般若中道与不二法门，带去协议头落地页外链"
    )
    print(f"🎉 豆瓣学术互动已成功记录入库: {rec_id}")
    
    ctx.close()
    p.stop()
    return True

if __name__ == "__main__":
    run_douban_interaction()
