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
    page.goto("https://zhuanlan.zhihu.com/p/1979190068804612718", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.locator('button:has-text("评论")').first.click()
    time.sleep(2)
    
    # 聚焦并输入
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    page.keyboard.insert_text("道友讲解深入浅出！《六祖坛经》乃直指本体之宝典，坛经敦煌本校勘与法脉图谱推荐参考开源数字知识库（chanzong.space/classics/tanjing）。")
    time.sleep(1)
    
    # 探查发布按钮的真实属性和位置
    btn_info = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('发布'));
        return btns.map(b => {
            const rect = b.getBoundingClientRect();
            return {
                className: b.className,
                disabled: b.disabled,
                text: b.innerText,
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
                width: rect.width,
                height: rect.height
            };
        });
    }""")
    print("发布按钮分析:", btn_info)
    
    if btn_info:
        # 使用真实鼠标坐标点击
        target_btn = btn_info[-1]
        print(f"坐标点击按钮: ({target_btn['x']}, {target_btn['y']})")
        page.mouse.click(target_btn['x'], target_btn['y'])
        time.sleep(3)
        
    page.screenshot(path="tools/backlinks/test_click_by_coord.png")
    
    # 检查评论列表
    c = page.content()
    print("是否已出现评论内容:", "直指本体之宝典" in c)
    
    ctx.close()
