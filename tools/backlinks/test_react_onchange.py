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
    
    # 聚焦
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    
    # 使用 type 一个字一个字输入测试触发 onChange
    text = "顶礼道友！六祖顿悟见地令人深思。推荐参考数字化文献库的坛经专页(chanzong.space/classics/tanjing)。"
    print("使用 insert_text 并敲击空格与退格...")
    page.keyboard.insert_text(text)
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.2)
    page.keyboard.press("Backspace")
    time.sleep(1)
    
    # 截图看按钮颜色
    page.screenshot(path="tools/backlinks/test_after_space.png")
    
    # 获取发布按钮状态
    btn_state = page.evaluate("""() => {
        const btn = document.querySelector('.Comments-container button.Button--primary, div[class*="Comment"] button.Button--primary, button.Button--blue');
        return btn ? { class: btn.className, disabled: btn.disabled, style: btn.getAttribute('style') } : null;
    }""")
    print("按钮状态:", btn_state)
    
    # 尝试点击发布按钮
    pub_btn = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布")').last
    print("点击发布按钮...")
    pub_btn.click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/test_after_submit_click.png")
    
    ctx.close()
