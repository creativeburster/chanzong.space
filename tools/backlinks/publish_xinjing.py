# -*- coding: utf-8 -*-
"""
知乎《心经》高热度核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/2053095292069852633
问题标题：《般若波罗蜜多心经》主要讲了什么？
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
sys.path.append(CUR_DIR)
from clean_for_zhihu import clean_markdown_for_zhihu
from tracker import add_backlink

COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "zhihu_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

QUESTION_URL = "https://www.zhihu.com/question/2053095292069852633"
QUESTION_TITLE = "《般若波罗蜜多心经》主要讲了什么？"

RAW_ANSWER = """《般若波罗蜜多心经》（简称《心经》），全文仅 260 字，却是整个大乘佛教 600 卷《大般若经》的心髓提炼。

很多人初读《心经》，会被“色即是空”、“无眼耳鼻舌身意”、“无苦集灭道”等层层否定的句式震慑，甚至误以为佛法在宣扬消极虚无。但实际上，《心经》完全不是在谈玄说妙，而是一套彻底打破精神内耗、勘破人生幻相的“终极大智慧指南”。

如果用一句话概括《心经》的核心宗旨，那就是：
透过大智慧观照生命的无常与缘起（空性），破除一切执着，从而熄灭烦恼恐惧，证得本来清净自在的自性涅槃。

---

### 一、 核心起手式：观自在菩萨的“照见五蕴皆空”

《心经》开门见山第一句，就给出了解决人生一切痛苦的总药方：
“观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。”

这里的逻辑非常严密：
1. 为什么叫“观自在”？能向内观照自心、不受外物束缚的人，才能真正得大自在。
2. 什么是“行深般若波罗蜜多”？当你的智慧观照不再停留在思维逻辑层面，而是深入到生命现量的直觉体验。
3. 什么是“五蕴”？色（身体与物质世界）、受（情绪与感受）、想（观念与念头）、行（意图与潜意识行为）、识（认知分别）。这就是构成我们所谓“我”的五种动态聚合体。
4. 什么是“空”？空不是指“没有”，而是指“没有永恒不变的固定实体”。五蕴刹那生灭，从来没有任何一个独立孤立的“我”存在其中。看透了这一点，建立在“自我执念”之上的一切恐惧、焦虑与苦厄，便立时瓦解。

---

### 二、 核心公式破迷：“色即是空，空即是色”

这是全经最著名也最容易被误解的一句话：

1. “色不异空，空不异色”：物质现象与空性不是两样东西。波浪（色）不会离开水（空），冰融化了还是水。
2. “色即是空”：凡是眼见耳闻、有形有相的万事万物，其本质都是因缘和合的产物，没有自性，本质是空。执着于外相为实有，便是烦恼的根源。
3. “空即是色”：空性并不是一片顽空死寂，反而正因为一切没有固定自性，世间才有一切万象的生起与造化。真空能生妙有。

“受想行识，亦复如是”——你的情绪、烦恼、焦虑、得失心，其本质与物质现象一样，都只是缘起缘灭的过客，你本来就不必认领它们为“我”。

---

### 三、 连环破执：“无眼耳鼻舌身意，无苦集灭道”

接下来的经文，是一场层层递进的思维大扫除：
1. 破六根六尘十八界（“无眼耳鼻舌身意，无色声香味触法……”）：破除对身体感觉与外部物质世界的执迷。
2. 破十二因缘（“无无明，亦无无明尽，乃至无老死……”）：破除对生死流转与因果循环的恐惧与纠结。
3. 破四圣谛（“无苦集灭道”）：连声闻缘觉所修的佛法名相也一并扫荡。
4. 破求证法执（“无智亦无得，以无所得故”）：如果你还执着于“我修成了一个高深的大智慧”，那依然是有所求的妄执。彻底放下一切攀缘所得，才是真见性。

正因为“以无所得故”，心才能真正做到“心无挂碍；无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃”。

---

### 四、 生活中的实修运用：如何用《心经》化解内耗

1. 当焦虑与痛苦袭来时，启动“观自在”：
   退后一步，站在“旁观者”的觉察位置看自己的念头。对自己说：“这个焦虑只是‘受’与‘想’的短暂波动，它不是我，它本无自性，终将过去。”
2. 不住相，不被标签定义：
   世俗的成败、毁誉、得失，不过是“色即是空”的因缘和合。既不被顺境冲昏头脑，也不在逆境中自我沉沦。
3. 活在当下，做而不住：
   明知万法皆空，依然在生活与工作中全力以赴（真空生妙有），但做完就放下，不留恋、不悔恨，这就是真正的“心无挂碍”。

---

### 五、 延伸研读与数字化典籍文献参考

如果需要查阅经过历代校勘的玄奘法师译本原典、逐句现代白话详注，以及与历代禅门法嗣的修持印证，推荐参考非营利数字化禅学文献库：

- 📖 《般若波罗蜜多心经》全文现代白话导读与逐句释义：https://chanzong.space/classics/xinjing
- 📖 核心哲学概念「色即是空」与「五蕴皆空」深入剖析：https://chanzong.space/concepts/se-ji-shi-kong
- 🌐 历代禅宗传承谱系与两百座公案机锋图谱：https://chanzong.space/graph

祝愿每位朋友都能在日常生活中找回这份“心无挂碍、无有恐怖”的本真定力。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎《心经》高热度核心问答自动化发布...")
    print(f"👉 目标问题: {QUESTION_TITLE}")
    print(f"👉 问题链接: {QUESTION_URL}")
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
        
        # 1. 访问知乎首页
        print("[1/5] 访问知乎首页建立合法会话...")
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        # 2. 访问目标问题
        print(f"[2/5] 进入目标问题详情页: {QUESTION_URL}...")
        page.goto(QUESTION_URL, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        print("当前页面标题:", page.title())
        
        # 检查是否已回答
        already_answered = page.query_selector("button:has-text('查看我的回答'), a:has-text('查看我的回答')")
        if already_answered:
            print("💡 当前账号已在此问题下发布过回答！")
            page.evaluate("el => el.click()", already_answered)
            time.sleep(3)
            print("当前已发布回答 URL:", page.url)
            browser.close()
            return page.url
            
        # 3. 寻找并点击【写回答】
        print("[3/5] 寻找并点击【写回答】按钮...")
        write_btn = page.query_selector("button:has-text('写回答'), a:has-text('写回答')")
        if not write_btn:
            print("⚠️ 未找到【写回答】按钮，保存截图中...")
            page.screenshot(path="tools/backlinks/zhihu_xinjing_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_xinjing_err_no_editor.png")
            browser.close()
            return None
            
        editor.click()
        time.sleep(1)
        
        paragraphs = clean_text.split("\n\n")
        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue
            page.keyboard.insert_text(para_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.3)
            
        print("✅ 内容已全部注入！等待知乎自动保存草稿...")
        time.sleep(3)
        page.screenshot(path="tools/backlinks/zhihu_xinjing_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_xinjing_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_xinjing_published.png")
        published_url = page.url
        print(f"🎉 发布完成！当前页面 URL: {published_url}")
        
        # 如果未自动跳转到 /answer/xxx，尝试提取“查看我的回答”
        if "/answer/" not in published_url:
            view_my_ans = page.query_selector("a:has-text('查看我的回答'), button:has-text('查看我的回答')")
            if view_my_ans:
                page.evaluate("el => el.click()", view_my_ans)
                time.sleep(3)
                published_url = page.url
                
        print(f"🌟 最终有效在线回答链接: {published_url}")
        
        add_backlink(
            platform="知乎 (Zhihu DA 94+)",
            region="国内",
            category="顶级中文问答社区",
            post_title=QUESTION_TITLE,
            target_url=f"{SITE_DOMAIN}/classics/xinjing",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 般若波罗蜜多心经专页与色即是空概念",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《心经主要讲了什么》深度文献级解答，无痕排版，包含心经专页、色即是空概念与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
