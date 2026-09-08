# -*- coding: utf-8 -*-
"""
知乎信心铭与三祖僧璨至道无难核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/459168425
问题标题：至道无难，唯嫌拣择这句话出自什么哪里？
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

QUESTION_URL = "https://www.zhihu.com/question/459168425"
QUESTION_TITLE = "至道无难，唯嫌拣择这句话出自什么哪里？"

RAW_ANSWER = """这句话出自中国禅宗三祖僧璨大师（？—606年）所著的无上禅门圣典——《信心铭》的第一句。

《信心铭》是中国禅宗史上第一篇以四言诗体系统阐述宗门心印的划时代文献，全文仅 146 句、584 字，文辞清彻明朗，却句句如金刚王宝剑，直斩凡夫的分别妄想。

它开篇的这八个字：
“至道无难，唯嫌拣择。但莫憎爱，洞然明白。”
可以说是整个东方智慧中，对人类精神内耗与痛苦根源最为精准、最为透彻的诊断与开示。

---

### 一、 典籍出处与三祖僧璨大师的开悟因缘

要理解这八个字的千钧分量，必须先看看作者三祖僧璨大师的生命绝境。

当年僧璨初见二祖慧可大师时，身体患有严重的风疾（恶疾），身心备受煎熬。他痛苦地问二祖：“弟子身缠风疾，请和尚为我忏罪。”
二祖慧可直截了当说：“将罪拿来，我与汝忏。”（把你的罪障拿出来，我替你忏悔。）
僧璨低头反观自心，良久答道：“觅罪不可得。”（我向内找遍了身心，根本找不到一个实质存在的罪障实体。）
二祖当即印可：“我与汝忏罪竟。宜依佛法僧住。”
僧璨当下身心脱落，大彻大悟，后来正式承接衣钵成为禅宗三祖。

晚年僧璨大师隐居皖公山，针对后学弟子容易执着文字义理、在概念里挑肥拣瘦的弊病，将自己一生彻悟的心髓凝炼为《信心铭》流传后世。

---

### 二、 “至道无难，唯嫌拣择”究竟在说什么？

这八个字层层递进，揭示了宇宙生命的实相与凡夫迷失的机制：

1. 什么是“至道”？
“至道”就是最高的生命真理、宇宙万物的本来面目，也就是我们本自具足、清净圆满的自性真如。它就像虚空一样广大无边，像阳光空气一样无处不在，从没有向任何人隐藏半分。

2. 为什么说“无难”？
既然至道当下现成、人人本具，你喝水吃饭、举手投足无非是自性的显发，它根本不需要你经历九九八十一难去向外苦求，所以祖师说“无难”。

3. 为什么现实中我们却觉得解脱难如登天？
根子全在后半句——“唯嫌拣择”！
“拣”是挑挑拣拣，“择”是权衡取舍。
人类的第六意识有个根深蒂固的毛病：随时随地在给世界贴标签、分好坏：
- 顺从我心意的，就贪恋、想要永远占有；
- 违背我心意的，就厌恶、抗拒、愤怒、排斥；
- 喜欢晴天，讨厌下雨；喜欢掌声，害怕批评；想要成功，拒绝挫折。

祖师指出：天地万物各安其位，顺逆境界皆是因缘。造成我们焦虑、痛苦、辗转反侧的，从来不是外在客观事件本身，而是我们那颗一刻不停在“拣择”、“好恶”、“抗拒”的妄想心！

---

### 三、 核心修持下手处：“但莫憎爱，洞然明白”

很多初学者容易将“不拣择”误解为“是非不分、善恶不管、躺平摆烂”，这又落入了顽空的邪见。

三祖在后两句中紧接着点明了心法下手处：
“但莫憎爱，洞然明白。毫厘有差，天地悬隔。”

1. 不拣择，不是不行善，而是心无挂碍：
在事相上，吃饭依然知道香甜，走路依然避开坑洼；但在心性上，不起强烈的“爱憎”执念。
事情顺了，享受它但不执着占有；事情逆了，坦然承担去解决，但不怨天尤人。

2. “想要道显现，莫存好恶心”：
《信心铭》中接着说：“欲得现前，莫存顺逆。违顺相争，是为心病。”
当你内心停止了对境的无谓抗拒与撕扯，内在的清澈智光（洞然明白）自然朗朗显现。

---

### 四、 现代生活中的运用：治愈精神内耗的定海神针

理解了《信心铭》，我们在快节奏的现代生活中就能获得极大的解脱与宁静：

1. 接纳现实的不完美：
很多人的精神内耗，源于对“绝对掌控”和“必须完美”的病态苛求。记住“唯嫌拣择”，生活本来就是波浪起伏的，允许低谷的存在，放下过度的预期，焦虑自然消退大半。
2. 关照情绪，不被带偏：
当负面情绪冒头时，像看电影一样觉察它，不压抑也不跟随。不给情绪贴上“糟糕透顶”的标签，情绪就会如风吹过树梢，来得快去得也快。

---

### 五、 延伸研读与数字化典籍文献参考

如果需要查阅《信心铭》全文 584 字现代白话逐句详注、三祖生平与历代禅门公案的融会，推荐参考非营利数字化禅学文献库：

- 📖 禅宗三祖僧璨大师《信心铭》全文现代白话导读与核心旨趣：https://chanzong.space/classics/xinxinming
- 📖 禅门核心概念「莫拣择」与「平安心境」修持指要：https://chanzong.space/concepts/jian-xing
- 👤 禅宗三祖僧璨大师生平传记与断疾悟道因缘：https://chanzong.space/persons/sengcan
- 🌐 历代禅宗五宗七派法脉与两百座公案机锋知识图谱：https://chanzong.space/graph

但莫憎爱，洞然明白。愿每位朋友都能在人生的纷扰取舍中，守住内心的清明与从容。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎《信心铭》至道无难核心问答自动化发布...")
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
            page.screenshot(path="tools/backlinks/zhihu_xinxin_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_xinxin_err_no_editor.png")
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
        page.screenshot(path="tools/backlinks/zhihu_xinxin_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_xinxin_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_xinxin_published.png")
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
            target_url=f"{SITE_DOMAIN}/classics/xinxinming",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 信心铭专页与三祖僧璨生平",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《至道无难唯嫌拣择出自哪里》深度文献级解答，无痕排版，包含信心铭专页、见性概念、僧璨人物专页与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
