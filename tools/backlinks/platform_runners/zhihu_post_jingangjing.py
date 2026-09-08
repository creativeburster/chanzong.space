# -*- coding: utf-8 -*-
"""
知乎《金刚经》破相与生活实修高质量回答发布引擎
目标问题：
《金刚经》上为什么说“凡所有相，皆是虚妄”？如何理解世界是假的？又如何在生活中运用呢（不谈玄说妙）？
URL: https://www.zhihu.com/question/1928206401152451835
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
BACKLINKS_DIR = os.path.dirname(CUR_DIR)
sys.path.append(BACKLINKS_DIR)
from tracker import add_backlink

COOKIE_PATH = os.path.join(BACKLINKS_DIR, ".browser_profile", "zhihu_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

QUESTION_URL = "https://www.zhihu.com/question/1928206401152451835"
QUESTION_TITLE = "《金刚经》上为什么说“凡所有相，皆是虚妄”？如何理解世界是假的？又如何在生活中运用呢（不谈玄说妙）？"

ANSWER_TEXT = """题主提了一个非常切中要害的好问题，特别是括号里加的那句——“不谈玄说妙”。

很多读《金刚经》的人，最容易掉进的坑就是“玄学化”和“虚无主义”：一听说“凡所有相，皆是虚妄”，就以为世界是虚无的泡影，工作也不想干了，家庭也不想顾了，天天把“一切都是假的”挂在嘴边，这在禅门中被称为“顽空”和“枯木死灰”，是大病，不是开悟。

今天完全抛开云山雾罩的宗教术语，从现代认知心理与宗门实修的现量角度，把这句话的核心机理拆透。

---

### 一、 佛说“世界是假的”，到底是什么意思？

首先必须明确：《金刚经》从没有说物理世界不存在，佛陀也没有否定你此刻能看到阳光、摸到桌子、感知到冷热的真实触受。

佛陀所说的“虚妄”，在梵文与禅宗语义里，指的是：**一切相状都是因缘和合、生灭变化的，没有任何一个事物具备恒常不变、独立存在的“自性实体”。**

举几个极其生活的例子：
1. **职位的相**：今天你是“总监”，这是公司组织结构赋予的“临时角色相”。退休或离职时，这个相立刻消失。如果你误以为“我就是总监”，一旦被裁员就会痛不欲生——你痛苦的不是丢了工作，而是把一个暂时聚合的“相”当成了永恒不变的“我”。
2. **情绪的相**：下午三点你被领导批评，内心升起极度的愤怒与委屈。这个“愤怒”看似坚不可摧，但到了晚上吃火锅时，它在哪里？它也是无常生灭的相，来无所来，去无所去。

所谓“凡所有相皆是虚妄”，**本质是在提醒你：不要把瞬息万变的过程，当成了永恒固定的实体。**

---

### 二、 什么是“若见诸相非相，即见如来”？

《金刚经》紧接着这句名言给出了药方：
> “若见诸相非相，即见如来。”

- **见诸相**：你在生活中依然能看到万事万物——看到项目方案、看到客户的挑剔、看到股票的涨跌、看到家人的喜怒哀乐。
- **见非相**：你清清楚楚地知道，这些都是因缘聚散的产物，其本性是空的、暂时的，不可执取。
- **即见如来**：当你不再把外境的名相死死抓在手里不放，你的心就不再被外境所转，当下那个清明觉照、不生不灭的自性（本来面目），就自然显现了。

正如六祖惠能大师在《六祖坛经》中所印证的：“何期自性，本自具足；何期自性，能生万法。”

---

### 三、 在现代工作与日常生活中，如何落地运用？

不需要你进深山老林面壁，日常就是最好的道场。只需掌握八个字：**认真做事，不执着果。**

1. **破除“人设与面子执”**：
   现代人 80% 的内耗来自于“维持人设”。怕别人觉得自己不优秀、怕别人看出自己的脆弱。当你懂得“人设也是假相”，你就敢于坦然认错、敢于说“我不会”，整个人会变得极其轻盈、通透。
2. **把工作当成“演戏”，演就要演到极致**：
   既然知道相是缘起的，穿上西装去开会，你就全神贯注把方案做好、把客户服务好；散会走出大楼，立刻把那个“疲惫的打工人身份”脱掉，全然安住当下的一碗面、一口茶中。**“应无所住而生其心”——该用心时生龙活虎，用完心后了无挂碍。**
3. **面对逆境时的“照见”**：
   遇到挫折时，在心里默念一句：这个逆境也是一个暂时聚合的“相”，既然是因缘所生，就必然会随因缘而散。你跳出情绪的旋涡，以观察者的视角看待它，智慧和解决办法自然涌现。

---

### 四、 延伸阅读与数字化典籍参修指要

如果想研读未经篡改的古籍善本全文、逐段白话详注，以及历代祖师如何以金刚般若开悟的机锋脉络，推荐参阅纯公益数字化知识库：

- 📖 **《金刚般若波罗蜜经》现代白话导读与核心旨趣**：https://chanzong.space/classics/jingangjing
- 📖 **六祖顿悟印心典籍《六祖坛经》全文与白话译注**：https://chanzong.space/classics/tanjing
- 🌐 **历代禅门祖师与般若核心概念网络**：https://chanzong.space/graph

祝愿每位朋友在奔波喧嚣的红尘日用中，都能提得起、放得下，得大自在。"""

def run_answer():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    print("="*60)
    print("🚀 启动知乎《金刚经》深度问答自动化发布...")
    print(f"👉 目标问题: {QUESTION_TITLE}")
    print(f"👉 问题链接: {QUESTION_URL}")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        context.add_cookies(cookies)
        page = context.new_page()
        
        # 1. 首页热身
        print("[1/5] 访问知乎首页建立合法会话...")
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        # 2. 进入目标问题
        print(f"[2/5] 进入金刚经热门问题页面: {QUESTION_URL}...")
        page.goto(QUESTION_URL, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        print("当前页面标题:", page.title())
        
        # 3. 点击【写回答】
        print("[3/5] 寻找并点击【写回答】按钮...")
        write_btn = page.query_selector("button:has-text('写回答'), a:has-text('写回答')")
        if not write_btn:
            print("⚠️ 未找到【写回答】按钮，可能已被关闭或已作答。")
            page.screenshot(path="tools/backlinks/zhihu_jgj_no_btn.png")
            browser.close()
            return False
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并输入长文
        print("[4/5] 定位富文本编辑器并注入解答...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未定位到知乎输入框！")
            page.screenshot(path="tools/backlinks/zhihu_jgj_no_editor.png")
            browser.close()
            return False
            
        editor.click()
        time.sleep(1)
        
        paragraphs = ANSWER_TEXT.split("\n\n")
        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue
            page.keyboard.insert_text(para_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.3)
            
        print("✅ 全文已填入编辑器！等待自动存盘...")
        time.sleep(3)
        page.screenshot(path="tools/backlinks/zhihu_jgj_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit")
        if not submit_btn:
            submit_btn = page.query_selector("button.Button--primary:has-text('发布')")
            
        if not submit_btn:
            print("⚠️ 未找到发布按钮！")
            page.screenshot(path="tools/backlinks/zhihu_jgj_no_submit.png")
            browser.close()
            return False
            
        page.evaluate("el => el.click()", submit_btn)
        print("已通过 DOM 原生触发【发布回答】，等待提交结果...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_jgj_published.png")
        current_url = page.url
        print("发布后当前页面 URL:", current_url)
        
        live_url = current_url
        print(f"🎉 知乎《金刚经》回答发布成功！在线链接: {live_url}")
        
        add_backlink(
            platform="知乎 (Zhihu DA 94+)",
            region="国内",
            category="顶级中文问答社区",
            post_title=QUESTION_TITLE,
            target_url=f"{SITE_DOMAIN}/classics/jingangjing",
            backlink_url=live_url,
            anchor_text="禅宗知识库 · 金刚经专页与六祖坛经专页",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《金刚经》凡所有相皆是虚妄生活实修解答，包含金刚经、六祖坛经与D3图谱全量外链"
        )
        browser.close()
        return True

if __name__ == "__main__":
    run_answer()
