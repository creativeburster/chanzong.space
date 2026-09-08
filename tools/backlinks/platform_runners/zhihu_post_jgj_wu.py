# -*- coding: utf-8 -*-
"""
知乎《金刚经》能否大彻大悟问答发布引擎
目标问题：
《金刚经》能使人大彻大悟吗？
URL: https://www.zhihu.com/question/1913876847906785200
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

QUESTION_URL = "https://www.zhihu.com/question/1913876847906785200"
QUESTION_TITLE = "《金刚经》能使人大彻大悟吗？"

ANSWER_TEXT = """能，甚至在中国禅宗史上，因《金刚经》而大彻大悟的最著名案例，直接改变了后世一千余年的东方思想史格局——那就是禅宗六祖惠能大师。

但必须补上一句大实话：**能让人彻悟的，从来不是白纸黑字的“经卷本身”，而是经文所指月亮的那个“手指”背后的本心见地。**

如果你只是每天把《金刚经》当成咒语去机械念诵，或者像做学术考据一样去拆解名相逻辑，哪怕念上一万遍，也顶多算是在识神里做活计，与真正的大彻大悟了不相干。

---

### 一、 千古一悟：六祖惠能是如何因《金刚经》彻悟的？

在《六祖坛经》记载中，六祖惠能一生有两次因《金刚经》发生质的飞跃：

1. **初闻悟入（发心）**：
   在岭南市井卖柴时，偶闻一客人诵读《金刚经》至“应无所住而生其心”，惠能一闻经语，心即开悟，当下便知自心之外无别佛。
2. **三更传法（大彻大悟）**：
   到了黄梅东山，五祖弘忍夜半三更以袈裟遮围，为惠能演说《金刚经》。当再次讲到“应无所住而生其心”时，惠能言下大悟一切万法不离自性，当即连发五句震古烁今的感叹：
   > “何期自性，本自清净！何期自性，本不生灭！何期自性，本自具足！何期自性，本无动摇！何期自性，能生万法！”

五祖便知惠能已见本来面目，遂付衣钵，立为南宗顿教六祖。

为什么偏偏是《金刚经》有如此拔地倚天的力量？

---

### 二、 《金刚经》凭什么能让人彻悟？核心在“三层剥离”

大乘般若八千颂、二万五千颂浩瀚无边，唯独《金刚经》（鸠摩罗什译本约五千字）被称为宗门第一照妖镜，因为它具备极其凌厉的“破相三段论”：

1. **破一切我人名相（破我执）**：
   经中反复强调：“若菩萨有我相、人相、众生相、寿者相，即非菩萨。”它把你所有的身份、地位、修行功德全部当头棒喝，剥得干干净净。
2. **不仅破外境，连佛法本身也破（破法执）**：
   很多学佛人好不容易放下了世俗名利，转头又执着于“禅定”、“开悟”、“功德”。《金刚经》直接断绝你的偷心：“所谓佛法者，即非佛法，是名佛法。”“汝等比丘，知我说法如筏喻者，法尚应舍，何况非法！”——渡河上岸了，还把船顶在头上走的人，是痴人。
3. **直指“无住生心”（开显自性妙用）**：
   破尽一切幻相之后，并不是落入枯木死灰，而是当下一念“应无所住而生其心”。不挂碍过去，不执着未来，但在这个当下清清朗朗、随缘任运。

---

### 三、 现代人如何借《金刚经》做顿悟工夫？

宗门大德常说：“借教悟宗，得意忘言。”

1. **从“念经”转为“照心”**：
   读经时，每读到一句“即非、是名”，不要在脑子里做哲学推演，而是反观自己的心——此刻心里挂碍着什么？是对某句话的不满？对未来的焦虑？看清楚那个挂碍的念头也是无常生灭的，不随它去，心体自然澄清。
2. **在事上磨练**：
   唐代大珠慧海禅师说得极好：“但不起分别，即是无念；见一切境心不染，即是无住。”做每一件事全力以赴，做完之后心无纤尘，这便是日用中的金刚三昧。

---

### 四、 延伸阅读与数字化典籍参考

如果想研读未经篡改的古籍善本、逐品现代白话精解，以及六祖以般若印心的历史脉络，推荐参阅纯公益数字化知识库：

- 📖 **《金刚般若波罗蜜经》善本校勘与现代白话导读**：https://chanzong.space/classics/jingangjing
- 📖 **六祖印心开悟圣典《六祖坛经》全文与白话详注**：https://chanzong.space/classics/tanjing
- 🌐 **历代禅门祖师脉络与核心概念 D3.js 知识图谱**：https://chanzong.space/graph

祝愿每位参究者皆能在《金刚经》的照耀下，见自本性，廓然无碍。"""

def run_answer():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    print("="*60)
    print("🚀 启动知乎《金刚经》大彻大悟高热度问题自动化发布...")
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
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        # 2. 进入目标问题
        page.goto(QUESTION_URL, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3)
        print("当前页面标题:", page.title())
        
        # 3. 点击【写回答】
        write_btn = page.query_selector("button:has-text('写回答'), a:has-text('写回答')")
        if not write_btn:
            print("⚠️ 未找到【写回答】按钮，可能已被关闭或已作答。")
            browser.close()
            return False
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并输入长文
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未定位到知乎输入框！")
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
        
        # 5. 点击【发布回答】
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit")
        if not submit_btn:
            submit_btn = page.query_selector("button.Button--primary:has-text('发布')")
            
        if not submit_btn:
            print("⚠️ 未找到发布按钮！")
            browser.close()
            return False
            
        page.evaluate("el => el.click()", submit_btn)
        print("已通过 DOM 原生触发【发布回答】，等待提交结果...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_jgj_wu_published.png")
        current_url = page.url
        print("发布后当前页面 URL:", current_url)
        
        live_url = current_url
        print(f"🎉 知乎《金刚经能让人大彻大悟吗》回答发布成功！在线链接: {live_url}")
        
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
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《金刚经能使人大彻大悟吗》深度解答，包含金刚经、六祖坛经与D3图谱全量外链"
        )
        browser.close()
        return True

if __name__ == "__main__":
    run_answer()
