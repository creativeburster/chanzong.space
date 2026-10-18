# -*- coding: utf-8 -*-
"""
知乎高权重问答发布引擎（基于 Persistent Context，解决 40362 防风控）
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
from clean_for_zhihu import clean_markdown_for_zhihu
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

def publish_zhihu_answer(question_url: str, question_title: str, raw_answer: str, target_url: str, anchor_text: str, notes: str):
    print("="*60)
    print(f"🚀 启动知乎核心问答发布: {question_title}")
    print(f"👉 问题链接: {question_url}")
    print(f"👉 落地页: {target_url}")
    print("="*60)
    
    clean_text = clean_markdown_for_zhihu(raw_answer)
    
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True,
            args=["--no-first-run", "--no-default-browser-check", "--disable-blink-features=AutomationControlled"],
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        # 1. 访问目标问题
        print("[1/4] 进入目标问题详情页...")
        page.goto(question_url, wait_until="domcontentloaded", timeout=35000)
        time.sleep(4)
        print("当前页面标题:", page.title())
        
        # 检查是否已回答
        already_answered = page.query_selector("button:has-text('查看我的回答'), a:has-text('查看我的回答')")
        if already_answered:
            print("💡 当前账号已在此问题下发布过回答！")
            ans_href = page.evaluate("el => el.href || el.getAttribute('href')", already_answered)
            if not ans_href:
                ans_href = page.url
            elif not ans_href.startswith("http"):
                ans_href = f"https://www.zhihu.com{ans_href}"
            print(f"当前已发布回答 URL: {ans_href}")
            ctx.close()
            return ans_href
            
        # 2. 寻找并点击【写回答】
        print("[2/4] 寻找并点击【写回答】按钮...")
        write_btn = page.locator("button:has-text('写回答'), a:has-text('写回答')").first
        if not write_btn.is_visible():
            print("⚠️ 未找到【写回答】按钮，截图中...")
            page.screenshot(path="tools/backlinks/zhihu_err_no_btn.png")
            ctx.close()
            return None
            
        # 规避浮动 header 遮挡，使用 evaluate click 或 scroll+click
        page.evaluate("el => el.click()", write_btn.element_handle())
        time.sleep(3)
        
        # 3. 定位编辑器并注入正文
        print("[3/4] 定位编辑器并注入自然排版内容...")
        editor = page.locator(".public-DraftEditor-content, div[contenteditable='true']").first
        if not editor.is_visible():
            print("⚠️ 未找到富文本编辑器！")
            page.screenshot(path="tools/backlinks/zhihu_err_no_editor.png")
            ctx.close()
            return None
            
        editor.click()
        time.sleep(0.5)
        
        paragraphs = clean_text.split("\n\n")
        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue
            page.keyboard.insert_text(para_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.2)
            
        print("✅ 正文已注入！等待自动保存草稿...")
        time.sleep(3)
        
        # 4. 点击【发布回答】
        print("[4/4] 触发【发布回答】提交...")
        submit_btn = page.locator("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')").last
        if not submit_btn.is_visible():
            print("⚠️ 未找到【发布回答】按钮！")
            ctx.close()
            return None
            
        submit_btn.scroll_into_view_if_needed()
        time.sleep(0.5)
        submit_btn.hover()
        time.sleep(0.5)
        submit_btn.click()
        print("已点击【发布回答】，等待完成...")
        time.sleep(6)
        
        published_url = page.url
        for _ in range(5):
            if "/answer/" in page.url:
                published_url = page.url
                break
            time.sleep(1.5)
            
        # 提取我的回答链接
        if "/answer/" not in published_url:
            view_my_ans = page.query_selector("a:has-text('查看我的回答'), button:has-text('查看我的回答')")
            if view_my_ans:
                ans_href = page.evaluate("el => el.href || el.getAttribute('href')", view_my_ans)
                if ans_href:
                    published_url = ans_href if ans_href.startswith("http") else f"https://www.zhihu.com{ans_href}"
                    
        print(f"🎉 回答发布成功！有效独立链接: {published_url}")
        page.screenshot(path=f"tools/backlinks/zhihu_ans_success.png")
        
        add_backlink(
            platform="知乎 (Zhihu DA 95+)",
            region="国内",
            category="顶级中文问答社区",
            post_title=question_title,
            target_url=target_url,
            backlink_url=published_url,
            anchor_text=anchor_text,
            link_type="Dofollow / UGC",
            status="Live",
            notes=notes
        )
        
        ctx.close()
        return published_url
