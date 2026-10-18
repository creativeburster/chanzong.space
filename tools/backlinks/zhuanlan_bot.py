# -*- coding: utf-8 -*-
"""
知乎专栏长文自动化发布与追踪测试模块
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "zhihu_cookie.json")
sys.path.append(CUR_DIR)
from clean_for_zhihu import clean_markdown_for_zhihu
from tracker import add_backlink

def publish_zhuanlan(title: str, content: str, target_url: str, anchor_text: str, notes: str):
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    print("="*60)
    print(f"🚀 启动知乎高权重专栏发布: {title}")
    print(f"👉 落地页: {target_url}")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 1. 打开专栏编辑器
        print("[1/5] 打开知乎专栏编辑器...")
        page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)
        
        # 2. 填写标题
        print("[2/5] 注入文章大标题...")
        title_el = page.query_selector('textarea[placeholder*="请输入标题"], textarea.Input')
        if not title_el:
            print("⚠️ 未找到标题输入框！")
            page.screenshot(path="tools/backlinks/zhuanlan_err_no_title.png")
            browser.close()
            return None
            
        title_el.click()
        title_el.fill(title)
        time.sleep(1)
        
        # 3. 填写正文
        print("[3/5] 注入自然排版学术正文...")
        editor = page.query_selector('.public-DraftEditor-content, div[contenteditable="true"]')
        if not editor:
            print("⚠️ 未找到正文输入框！")
            page.screenshot(path="tools/backlinks/zhuanlan_err_no_editor.png")
            browser.close()
            return None
            
        editor.click()
        time.sleep(0.5)
        
        # 将内容清洗为知乎风格
        clean_text = clean_markdown_for_zhihu(content)
        paragraphs = clean_text.split("\n\n")
        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue
            page.keyboard.insert_text(para_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.25)
            
        print("✅ 正文已注入！等待知乎自动保存草稿...")
        time.sleep(4)
        page.screenshot(path="tools/backlinks/zhuanlan_draft_saved.png")
        
        # 4. 点击【发布】按钮
        print("[4/5] 触发知乎专栏【发布】...")
        pub_btn = page.query_selector('button:has-text("发布")')
        if not pub_btn:
            print("⚠️ 未找到发布按钮！")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", pub_btn)
        time.sleep(4)
        page.screenshot(path="tools/backlinks/zhuanlan_after_click_pub.png")
        
        # 检查是否有二次确认弹窗（例如选择专题/话题/版权等）
        confirm_btn = page.query_selector('.Modal button:has-text("确认发布"), .Modal button:has-text("发布"), .PublishPanel button:has-text("确认发布")')
        if confirm_btn:
            print("💡 检测到发布确认弹窗，点击最终发布...")
            page.evaluate("el => el.click()", confirm_btn)
            time.sleep(4)
            page.screenshot(path="tools/backlinks/zhuanlan_after_confirm.png")
            
        # 5. 等待页面跳转至已发布的文章详情页
        print("[5/5] 获取知乎文章永久独立链接...")
        published_url = page.url
        # 最长等待 12 秒跳转
        for _ in range(6):
            if "/p/" in page.url:
                published_url = page.url
                break
            time.sleep(2)
            
        print(f"当前页面 URL: {published_url}")
        page.screenshot(path="tools/backlinks/zhuanlan_final.png")
        
        # 如果还在编辑器页面，从草稿列表或文章管理中获取最新发布文章
        if "/p/" not in published_url:
            print("⚠️ 未直接重定向至 /p/ 页面，进入个人主页文章列表核对...")
            page.goto("https://www.zhihu.com/people/duliuxiang/posts", wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)
            latest_post_url = page.evaluate("""() => {
                const link = document.querySelector('.List-item a[href*="/p/"], .ContentItem-title a[href*="/p/"]');
                return link ? link.href : null;
            }""")
            if latest_post_url:
                published_url = latest_post_url
                print(f"🎉 从创作者文章主页成功抓取到新发布专栏文章: {published_url}")
            else:
                published_url = f"https://www.zhihu.com/people/duliuxiang/posts"
                
        print(f"🌟 知乎专栏成果永久链接: {published_url}")
        
        add_backlink(
            platform="知乎 (Zhihu DA 95+)",
            region="国内",
            category="顶级中文知识专栏",
            post_title=title,
            target_url=target_url,
            backlink_url=published_url,
            anchor_text=anchor_text,
            link_type="Dofollow / UGC",
            status="Live",
            notes=notes
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    # 测试发布第 1 篇
    test_title = "《心经》核心奥义解密：色即是空与五蕴皆空的现代认知学观照"
    test_content = """《般若波罗蜜多心经》（简称《心经》），全文仅 260 字，却是整个大乘佛教 600 卷《大般若经》的心髓提炼。

很多人初读《心经》，会被“色即是空”、“无眼耳鼻舌身意”、“无苦集灭道”等层层否定的句式震慑，甚至误以为佛法在宣扬消极虚无。但实际上，《心经》完全不是在谈玄说妙，而是一套彻底打破精神内耗、勘破人生幻相的“终极大智慧指南”。

如果用一句话概括《心经》的核心宗旨，那就是：
透过大智慧观照生命的无常与缘起（空性），破除一切执着，从而熄灭烦恼恐惧，证得本来清净自在的自性涅槃。

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

“受想行识，亦复如是”——你的情绪、烦恼、焦虑、得失心，其本质与物质现象一样，都只是缘起缘灭的过客，你本来就不必认领它们为“我”。

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

    publish_zhuanlan(
        title=test_title,
        content=test_content,
        target_url="https://chanzong.space/classics/xinjing",
        anchor_text="禅宗知识库 · 般若波罗蜜多心经专页与色即是空实相辨析",
        notes="知乎认证创作者【i禅修】发布高权重专栏文章，心经认知学解密，无机器人痕迹，含心经专页与图谱回链"
    )
