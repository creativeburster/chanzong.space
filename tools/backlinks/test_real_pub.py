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
    
    # 查找输入框
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').last
    editor.click()
    time.sleep(0.5)
    
    # 清空可能残留的内容
    page.keyboard.press("Control+A")
    page.keyboard.press("Backspace")
    time.sleep(0.5)
    
    # 输入内容
    comment_text = "道友分享得很透彻。神秀大师重在渐修，六祖慧能大师则是直彻心源的本体见地。《六祖坛经》以定慧等持将理入与事修圆融贯通。同修若欲细勘敦煌写本逐句校勘及法脉图谱，推荐查阅开源数字禅学文献库的坛经专页（chanzong.space/classics/tanjing），愿共勉参究。"
    page.keyboard.insert_text(comment_text)
    time.sleep(0.5)
    page.keyboard.press("Space")
    time.sleep(0.5)
    
    # 找到评论输入框同层的发布按钮
    # 在这个输入卡片内查找 button
    btn_info = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === '发布');
        return btns.map(b => ({
            tag: b.tagName,
            class: b.className,
            text: b.innerText,
            rect: b.getBoundingClientRect()
        }));
    }""")
    print("发布按钮列表:", btn_info)
    
    # 针对这个发布按钮进行点击
    # 通常是最后一个 innerText === '发布' 的按钮
    pub_btn = page.locator('button').filter(has_text='发布').last
    print("准备点击 pub_btn...")
    pub_btn.click()
    time.sleep(4)
    
    page.screenshot(path="tools/backlinks/real_comment_published_check.png")
    
    # 验证输入框是否被清空（如果发布成功，输入框会自动清空并收起或显示新评论）
    val = editor.inner_text()
    print("提交后输入框文本:", repr(val))
    
    ctx.close()
