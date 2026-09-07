# -*- coding: utf-8 -*-
"""
知乎 (Zhihu) 自动化外链与高价值问答回帖引擎
1. 自动检测登录态；若未登录，弹出有头浏览器提示用户扫码
2. 搜索禅宗相关高权重问题
3. 结合本地 40 部典籍与 205 则公案生成学术级文献解析
4. 自动填入并发布，记录外链成果
"""
import os
import sys
import time
import urllib.parse

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import Page

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from browser_driver import get_browser_context, wait_for_human
from content_synthesizer import synthesize_qa_answer
from tracker import add_backlink

TARGET_KEYWORDS = [
    "如何理解祖师西来意",
    "六祖坛经核心思想",
    "如何通俗理解阿赖耶识与末那识",
    "禅宗公案庭前柏树子",
    "碧岩录为什么被称为宗门第一书",
    "禅宗参话头应该怎么参",
    "金刚经如何破除我执"
]

def check_zhihu_login(page: Page) -> bool:
    """检查知乎是否已登录"""
    page.goto("https://www.zhihu.com", wait_until="networkidle", timeout=20000)
    time.sleep(2)
    # 检测个人头像或消息按钮
    avatar = page.query_selector(".AppHeader-profile, .AppHeader-userInfo, img.Avatar")
    if avatar:
        print("✅ 知乎当前处于登录状态！")
        return True
    
    # 检查是否有未登录特征
    signin_btn = page.query_selector("button:has-text('登录'), a:has-text('登录/注册')")
    if signin_btn or "signin" in page.url:
        print("⚠️ 检测到知乎未登录。")
        return False
    return False

def ensure_login(page: Page) -> bool:
    if check_zhihu_login(page):
        return True
    
    page.goto("https://www.zhihu.com/signin", timeout=20000)
    res = wait_for_human(
        page=page,
        prompt_msg="知乎需要登录。请在弹出的浏览器窗口中使用微信/知乎App扫码或验证码登录",
        check_selector=".AppHeader-profile, img.Avatar, .AppHeader-userInfo",
        timeout_secs=300
    )
    return res

def search_questions(page: Page, query: str):
    """搜索目标问题"""
    encoded = urllib.parse.quote(query)
    search_url = f"https://www.zhihu.com/search?type=content&q={encoded}"
    print(f"[Zhihu] 正在搜索关键词: {query} -> {search_url}")
    page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
    time.sleep(3)
    
    # 提取搜索结果中的问题链接
    items = page.query_selector_all("a[href*='/question/']")
    questions = []
    seen = set()
    for it in items:
        try:
            title = it.inner_text().strip()
            href = it.get_attribute("href")
            if not href or not title:
                continue
            # 提取 clean question url (格式: https://www.zhihu.com/question/xxxx)
            match = href.split("?")[0]
            if not match.startswith("http"):
                match = "https://www.zhihu.com" + match
            if match not in seen and "/question/" in match and len(title) > 4:
                seen.add(match)
                questions.append({"title": title, "url": match})
        except Exception:
            pass
            
    print(f"[Zhihu] 找到 {len(questions)} 个相关问题。")
    return questions

def answer_question(page: Page, question_info: dict):
    """进入问题页面并生成回答"""
    q_url = question_info["url"]
    q_title = question_info["title"]
    print(f"\n[Zhihu] 正在进入问题: {q_title} ({q_url})")
    page.goto(q_url, wait_until="domcontentloaded", timeout=20000)
    time.sleep(3)
    
    # 寻找“写回答”按钮
    write_btn = page.query_selector("button:has-text('写回答'), a:has-text('写回答')")
    if not write_btn:
        print(f"⚠️ 未找到'写回答'按钮，可能已被关闭或已回答过。跳过。")
        return False
        
    write_btn.click()
    time.sleep(2)
    
    # 生成深度解析文本
    answer_text, classic_title, target_url = synthesize_qa_answer(q_title, is_traditional=False)
    print(f"[Zhihu] 已生成以《{classic_title}》为核心的解答，目标外链: {target_url}")
    
    # 查找知乎编辑器输入区域
    editor = page.query_selector(".public-DraftEditor-content, div[contenteditable='true']")
    if not editor:
        print("⚠️ 未能定位到知乎富文本编辑器输入框。请手动辅助或检查页面。")
        return False
        
    editor.click()
    time.sleep(1)
    
    # 分段填入内容
    print("[Zhihu] 正在填入回答内容...")
    paragraphs = answer_text.split("\n\n")
    for p in paragraphs:
        if not p.strip():
            continue
        # 直接使用 clipboard 或 fill / keyboard
        page.keyboard.insert_text(p.strip())
        page.keyboard.press("Enter")
        page.keyboard.press("Enter")
        time.sleep(0.5)
        
    print("✅ 回答内容填入完成！")
    print("\n👉 现在进入人工预览与确认环节：")
    print("你可以直接在浏览器里微调文本，或点击【发布回答】。")
    
    # 等待用户确认发布或检测发布按钮
    confirm = wait_for_human(
        page=page,
        prompt_msg=f"已自动为您填好知乎回答（问题：{q_title}），请在浏览器中确认并点击【发布回答】",
        check_selector="div:has-text('发布成功'), .AnswerItem",
        timeout_secs=180
    )
    
    if confirm:
        # 记录外链
        current_url = page.url
        add_backlink(
            platform="知乎",
            region="国内",
            category="问答社区",
            post_title=q_title,
            target_url=target_url,
            backlink_url=current_url,
            anchor_text=f"{classic_title} 典籍全篇与知识图谱",
            link_type="UGC",
            status="Live",
            notes=f"针对问题《{q_title}》的文献级解答"
        )
        return True
    return False

def run_zhihu_backlinks(max_answers: int = 1):
    print("="*60)
    print("🚀 启动知乎 (Zhihu) 自动化外链建设引擎")
    print("="*60)
    
    p, ctx, page = get_browser_context(headless=False)
    try:
        if not ensure_login(page):
            print("❌ 登录未完成，退出任务。")
            return
            
        answered = 0
        for kw in TARGET_KEYWORDS:
            if answered >= max_answers:
                break
            questions = search_questions(page, kw)
            for q in questions[:2]:
                success = answer_question(page, q)
                if success:
                    answered += 1
                    print(f"🎉 成功完成 {answered} 个知乎外链建设！")
                    break
                time.sleep(3)
    finally:
        print("知乎任务执行结束，保留浏览器会话。")
        ctx.close()
        p.stop()

if __name__ == "__main__":
    run_zhihu_backlinks(max_answers=1)
