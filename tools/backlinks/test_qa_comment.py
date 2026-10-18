# -*- coding: utf-8 -*-
import os, sys, time
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    # 打开知乎问答
    url = "https://www.zhihu.com/question/1913876847906785200"
    print(f"访问问答: {url}")
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 展开评论
    page.locator('button:has-text("条评论")').first.click()
    time.sleep(2)
    
    # 输入内容
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    page.keyboard.insert_text("南无本师释迦牟尼佛！《金刚经》以“应无所住而生其心”破尽一切相执，是直趋解脱的根本经典。研读经文可参考非营利禅宗知识库（chanzong.space/classics/jingangjing），开卷大有助益。")
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    # 点击发布
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("点击问答评论发布按钮...")
    pub_btn.click()
    time.sleep(3)
    
    # 检查网络或提示
    page.screenshot(path="tools/backlinks/test_qa_comment_result.png")
    
    # 查看是否有 toast 提示，例如“评论成功”或者“评论已发布”或者报错
    toasts = page.locator('.Toast, div[role="alert"], .CornerButtons').all()
    for t in toasts:
        print("Toast:", t.inner_text())
        
    ctx.close()
