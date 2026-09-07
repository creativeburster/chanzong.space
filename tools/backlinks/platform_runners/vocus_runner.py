# -*- coding: utf-8 -*-
"""
方格子 (Vocus.cc) 自动化外链与繁体专栏发布引擎
面向台湾/香港及海外繁体读者：
1. 自动检测登录态；未登录则提示用户在弹出的浏览器中通过 Google/邮箱登录
2. 自动生成正体中文禅宗深度长文（包含典籍原文、现代导读、知识图谱链接）
3. 填入方格子编辑器，辅助发布并记录外链
"""
import os
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import Page

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from browser_driver import get_browser_context, wait_for_human
from content_synthesizer import synthesize_article
from tracker import add_backlink

def check_vocus_login(page: Page) -> bool:
    """检查方格子是否已登录"""
    page.goto("https://vocus.cc", wait_until="domcontentloaded", timeout=25000)
    time.sleep(3)
    
    # 查找写文章按钮或头像
    avatar = page.query_selector("img[alt*='avatar'], div[class*='Avatar'], a[href*='/editor']")
    if avatar:
        print("✅ 方格子 (Vocus) 当前处于登录状态！")
        return True
        
    signin_btn = page.query_selector("button:has-text('登入'), a:has-text('登入')")
    if signin_btn:
        print("⚠️ 检测到方格子未登录。")
        return False
    return False

def ensure_vocus_login(page: Page) -> bool:
    if check_vocus_login(page):
        return True
        
    page.goto("https://vocus.cc/login", timeout=25000)
    res = wait_for_human(
        page=page,
        prompt_msg="方格子 (Vocus) 需要登入。请在弹出的浏览器窗口中完成登入（支持 Google 帳號快捷登入）",
        check_selector="a[href*='/editor'], button:has-text('開始創作'), img[alt*='avatar']",
        timeout_secs=300
    )
    return res

def create_and_publish_vocus_article(page: Page):
    """创建并发布繁体禅学专栏"""
    print("[Vocus] 正在导航到方格子创作中心...")
    page.goto("https://vocus.cc/editor", wait_until="domcontentloaded", timeout=25000)
    time.sleep(4)
    
    # 生成正体中文文章
    title_tw, body_tw, target_url = synthesize_article(is_traditional=True)
    print(f"[Vocus] 已生成正体文章: 《{title_tw}》")
    print(f"[Vocus] 目标外链: {target_url}")
    
    # 定位标题与正文输入区
    title_input = page.query_selector("textarea[placeholder*='標題'], input[placeholder*='標題'], textarea[class*='title']")
    if title_input:
        title_input.click()
        title_input.fill(title_tw)
        time.sleep(1)
        
    # 正文编辑器
    editor = page.query_selector("div[contenteditable='true'], .DraftEditor-editorContainer")
    if editor:
        editor.click()
        time.sleep(1)
        paragraphs = body_tw.split("\n\n")
        for p in paragraphs:
            if not p.strip():
                continue
            page.keyboard.insert_text(p.strip())
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.3)
            
    print("✅ 繁体专栏文章草稿填入完毕！")
    print("👉 请在弹出的浏览器窗口中确认排版，并点击【發布】（Publish）。")
    
    published = wait_for_human(
        page=page,
        prompt_msg=f"已自动填入繁体专栏《{title_tw}》，请在方格子窗口中确认标签（如：禪修、佛學）并点击【發布】",
        check_selector="div:has-text('發布成功'), a:has-text('查看文章')",
        timeout_secs=240
    )
    
    current_url = page.url
    if published or "article" in current_url:
        add_backlink(
            platform="方格子 (Vocus)",
            region="海外繁体",
            category="专栏长文",
            post_title=title_tw,
            target_url=target_url,
            backlink_url=current_url,
            anchor_text=f"參修指要與全球圖譜",
            link_type="Dofollow",
            status="Live",
            notes="面向台湾及海外正体华文读者的禅宗经典导读与知识图谱专栏"
        )
        return True
    return False

def run_vocus_backlinks():
    print("="*60)
    print("🚀 启动方格子 (Vocus) 繁体外链建设引擎")
    print("="*60)
    
    p, ctx, page = get_browser_context(headless=False)
    try:
        if not ensure_vocus_login(page):
            print("❌ 登入未完成，退出任务。")
            return
        create_and_publish_vocus_article(page)
    finally:
        print("方格子任务结束，保留会话。")
        ctx.close()
        p.stop()

if __name__ == "__main__":
    run_vocus_backlinks()
