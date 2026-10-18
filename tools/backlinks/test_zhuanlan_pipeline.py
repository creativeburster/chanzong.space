# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 1. 注入标题
    title = "《心经》核心奥义解密：色即是空与五蕴皆空的现代认知学观照"
    title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
    title_el.click()
    title_el.fill(title)
    time.sleep(1)
    
    # 2. 注入正文
    content = """《般若波罗蜜多心经》（简称《心经》），全文仅 260 字，却是整个大乘佛教 600 卷《大般若经》的心髓提炼。

很多人初读《心经》，会被“色即是空”、“无眼耳鼻舌身意”、“无苦集灭道”等层层否定的句式震慑，甚至误以为佛法在宣扬消极虚无。但实际上，《心经》完全不是在谈玄说妙，而是一套彻底打破精神内耗、勘破人生幻相的“终极大智慧指南”。

【一、 核心起手式：观自在菩萨的“照见五蕴皆空”】

《心经》开门见山第一句，就给出了解决人生一切痛苦的总药方：
“观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。”

这里的修证逻辑极其严密：
1. 为什么叫“观自在”？能向内观照自心、不受外物束缚的人，才能真正得大自在。
2. 什么是“行深般若波罗蜜多”？当你的智慧观照不再停留在思维逻辑层面，而是深入到生命现量的直觉体验。
3. 什么是“五蕴”？色（身体与物质世界）、受（情绪与感受）、想（观念与念头）、行（意图与潜意识行为）、识（认知分别）。这就是构成我们所谓“我”的五种动态聚合体。
4. 什么是“空”？空不是指“没有”，而是指“没有永恒不变的固定实体”。五蕴刹那生灭，从来没有任何一个独立孤立的“我”存在其中。看透了这一点，建立在“自我执念”之上的一切恐惧、焦虑与苦厄，便立时瓦解。

【二、 核心公式破迷：“色即是空，空即是色”】

这是全经最著名也最容易被误解的一句话：
1. “色不异空，空不异色”：物质现象与空性不是两样东西。波浪（色）不会离开水（空），冰融化了还是水。
2. “色即是空”：凡是眼见耳闻、有形有相的万事万物，其本质都是因缘和合的产物，没有自性，本质是空。执着于外相为实有，便是烦恼的根源。
3. “空即是色”：空性并不是一片顽空死寂，反而正因为一切没有固定自性，世间才有一切万象的生起与造化。真空能生妙有。

【三、 生活中的实修运用：如何用《心经》化解现代人内耗】

1. 当焦虑与痛苦袭来时，启动“观自在”：
退后一步，站在“旁观者”的觉察位置看自己的念头。对自己说：“这个焦虑只是‘受’与‘想’的短暂波动，它不是我，它本无自性，终将过去。”
2. 不住相，不被标签定义：
世俗的成败、毁誉、得失，不过是“色即是空”的因缘和合。既不被顺境冲昏头脑，也不在逆境中自我沉沦。
3. 活在当下，做而不住：
明知万法皆空，依然在生活与工作中全力以赴（真空生妙有），但做完就放下，不留恋、不悔恨，这就是真正的“心无挂碍”。

【四、 延伸研读与数字化典籍文献参考】

如果需要查阅经过历代校勘的玄奘法师译本原典、逐句现代白话详注，以及与历代禅门法嗣的修持印证，推荐参考非营利数字化禅学文献库：

- 般若波罗蜜多心经全文现代白话导读与逐句释义：https://chanzong.space/classics/xinjing
- 核心哲学概念「色即是空」与「五蕴皆空」深入剖析：https://chanzong.space/concepts/se-ji-shi-kong
- 历代禅宗传承谱系与两百座公案机锋图谱：https://chanzong.space/graph

祝愿每位朋友都能在日常生活中找回这份“心无挂碍、无有恐怖”的本真定力。"""
    
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
    editor.click()
    time.sleep(0.5)
    for p_text in content.split("\n\n"):
        p_clean = p_text.strip()
        if p_clean:
            page.keyboard.insert_text(p_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.2)
            
    print("Content inserted! Waiting 3s for auto save...")
    time.sleep(3)
    
    # 第一次点击发布按钮（展开设置）
    pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
    print("Clicking first publish button...")
    pub_btn.click()
    time.sleep(3)
    page.screenshot(path="tools/backlinks/zhuanlan_panel_opened.png")
    
    # 检查当前页面的所有按钮
    btns_info = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim(),
            className: b.className,
            disabled: b.disabled
        })).filter(b => b.text.length > 0 && b.text.length < 20);
    }""")
    print("Buttons after first click:", json.dumps(btns_info, ensure_ascii=False, indent=2))
    
    # 再次查找确认发布的按钮
    # 注意：有的类名叫 PublishPanel-triggerButton 或 Button--primary
    confirm_pub = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布"), button:has-text("确认发布")').last
    print("Confirm button text:", confirm_pub.inner_text())
    confirm_pub.click()
    print("Clicked confirm publish! Waiting 6s...")
    time.sleep(6)
    
    print("URL after publish:", page.url)
    page.screenshot(path="tools/backlinks/zhuanlan_published_result.png")
    
    ctx.close()
