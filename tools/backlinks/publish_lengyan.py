# -*- coding: utf-8 -*-
"""
知乎楞严经核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/1936384195430687530
问题标题：《楞严经》的核心是什么？
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

QUESTION_URL = "https://www.zhihu.com/question/1936384195430687530"
QUESTION_TITLE = "《楞严经》的核心是什么？"

RAW_ANSWER = """古人总结佛门经典常说：“开悟的楞严，成佛的法华。”

《楞严经》（全称《大佛顶如来密因修证了义诸菩萨万行首楞严经》）全书共十卷，文字极尽典雅瑰丽，义理极尽幽微圆融。但正因为名相繁复、辨析深细，很多人读得云里雾里，越看越迷糊。

其实如果抽丝剥茧，整部十卷《楞严经》的骨架极其清晰，就是紧紧围绕修行人必须跨越的三大关隘展开的：
第一、破妄显真：认清哪个是生死轮回的“妄心”，哪个是本自清净的“真心”（七处征心、十番显见）；
第二、修证下手：怎样从纷乱的感官杂念中彻底解脱（二十五圆通、反闻闻自性）；
第三、降魔护航：修行路上遇到神秘境界与心魔如何不走偏（五十阴魔、歇即菩提）。

---

### 一、 破妄显真：七处征心与十番显见

《楞严经》的缘起极具戏剧性：佛陀弟子阿难乞食时遭遇摩登伽女的娑毗迦罗先梵天咒，险些破戒。佛陀敕文殊菩萨持神咒将阿难救回。阿难痛哭流涕，向佛陀请教如何修持大定。

佛陀没有直接讲大道理，而是问阿难：“你最初见我，因何发心出家？用什么心看见了我？”
阿难回答是用眼睛看、用心想。佛陀随即问出了全经第一个根本问题：“你的心在什么地方？”

1. 七处征心：
阿难一连回答了七个可能的位置：心在身内、心在身外、心潜伏在眼根里、心在幽暗处、心随所合处而生、心在根尘中间、心在无所著处。
结果被佛陀层层辨析，全盘否定。佛陀并不是说“人没有心”，而是严厉指出：阿难你所认定的那个能思量、会计较、随外界刺激忽起忽落的“意识心”，根本只是因缘生灭的幻影，并非真实的自性！

2. 十番显见：
破除了妄想之后，佛陀用十个维度为阿难开显不生不灭的“见性”。
其中最精彩的是波斯匿王叹老的公案：佛问六十二岁的波斯匿王：“你三岁时看恒河水，十三岁看恒河水，如今六十二岁，身体发白面皱，你那个能看见恒河的‘见性’，变老了吗？”
波斯匿王答：“没有变老。”
佛陀直截了当地点破：“变者受灭，彼不变者，元无生灭。云何于中，受汝生死？”
——你的身体和念头会衰老生灭，但能知能觉的本体本自不生不灭。认贼作父、认妄为真，正是众生轮回受苦的根本原因。

---

### 二、 实修法门：二十五圆通与反闻闻自性

认清了本体之后，如何在现实中实修？
经中二十五位大菩萨与阿罗汉依次出场，汇报各自从声、色、香、味、触、法（六尘），眼、耳、鼻、舌、身、意（六根），以及地水火风空见识（七大）契入圆通的经验。

最后佛陀敕文殊菩萨评判优劣，文殊菩萨力推观世音菩萨的“耳根圆通法门”：
“此方真教体，清净在音闻；欲取三摩提，实以闻中入。”

什么叫“反闻闻自性”？
普通人的耳朵永远在向外追逐声音（声来则听，声灭则无），注意力完全被外境牵着走，这就叫“入流亡所”的反面。
观音菩萨的法门是：把听声音的注意力收回来，不去计较声音是什么，而是去觉察“那个能听到一切声音的觉性本身”。
“初于闻中，入流亡所。所入既寂，动静二相，了然不生。”——当你的觉照力不再被外境动静所惑，层层脱落，直至能听与所听双亡，寂灭现前，豁然顿悟。

---

### 三、 避坑指南：五十阴魔与狂心若歇

修定用功到了深处，身心必然会产生种种奇异反应，这就是第九卷和第十卷佛陀苦口婆心剖析的“五十阴魔”（色受想行识五蕴，各有十种偏执幻境）：
比如突然身体能出入无碍、能看见远方事物、心里生出无边悲悯甚至狂妄自大，以为自己已经得大神通、成佛作祖。

佛陀给出了千古不破的判别试金石：
“不作圣心，名善境界；若作圣解，即受群邪。”
——遇到任何超常境界，只要不起贪爱执着，明白不过是身心气脉的自然转化，便是好境界；若自命不凡、宣扬神异，立刻招致魔扰。

而整部《楞严经》最斩钉截铁、振聋发聩的顿悟心印，正是那八个大字：
“狂心若歇，歇即菩提。胜净明心，不从人得。”
何必向外苦苦追寻一个神秘的佛性？只要歇下那个攀缘、分别、计较、焦虑的狂妄之心，本自具足的清净自性当下朗然显现。

---

### 四、 现代生活中的受用

1. 摆脱情绪内耗：
时刻提醒自己，生活中的焦虑、愤怒、挫败感，只是“客尘”（像客人一样来来去去），而你的本觉真心是“虚空”（任凭风云变幻，虚空未曾动摇）。
2. 在喧嚣中修持耳根定力：
走在车水马龙的街道上，或者身处嘈杂的办公室，不要排斥噪音，也不要在内心对声音评头论足，试着体会“声生声灭，而能听的心未尝生灭”，这就是随时随地的楞严大定。

---

### 五、 延伸研读与数字化典籍文献参考

如果需要查阅《楞严经》全十卷白话导读、逐段科判梳理以及与禅门机锋公案的融会，推荐参考非营利数字化禅学文献库：

- 📖 《大佛顶首楞严经》全文十卷现代白话导读与核心旨趣：https://chanzong.space/classics/lengyanjing
- 📖 禅门核心哲学公案「七处征心」与「十番显见」深度图解：https://chanzong.space/concepts/qi-chu-zheng-xin
- 🌐 历代禅宗传承谱系与全量经典知识图谱：https://chanzong.space/graph

狂心歇处即菩提，愿每位有缘朋友都能在日用纷扰中识得自心主人翁。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎《楞严经》核心问答自动化发布...")
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
            page.screenshot(path="tools/backlinks/zhihu_lengyan_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_lengyan_err_no_editor.png")
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
        page.screenshot(path="tools/backlinks/zhihu_lengyan_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_lengyan_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_lengyan_published.png")
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
            target_url=f"{SITE_DOMAIN}/classics/lengyanjing",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 大佛顶首楞严经专页与七处征心概念",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《楞严经的核心是什么》两千字文献级深度解答，包含楞严经十卷专页、七处征心概念与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
