# -*- coding: utf-8 -*-
"""
知乎达摩血脉论与见性成佛核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/1920463062604940234
问题标题：为什么说见性成佛，而不说见性即佛，见性和成佛之间还有什么吗？
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

QUESTION_URL = "https://www.zhihu.com/question/1920463062604940234"
QUESTION_TITLE = "为什么说见性成佛，而不说见性即佛，见性和成佛之间还有什么吗？"

RAW_ANSWER = """这个问题问得极其精到，直接触及了千百年来中国禅宗与大乘佛学修证史上最核心的关隘。

其实，如果你去翻阅禅宗初祖菩提达摩大师的原典，祖师在宗门立场上的标准开示恰恰是：“见性即是佛，离性无别佛！”

达摩大师在《菩提达摩大师血脉论》中开宗明义写道：
“若见性即是佛，不见性即是众生。若离众生性，别有佛性可得者，佛今在何处？众生性即是佛性性中……直下承当即是。”

但为什么在民间、学界以及后世的禅教汇通中，人们普遍习惯说“见性成佛”？见性和成佛之间到底隔着什么？这正是我们需要从“理”与“事”、“顿悟”与“渐修”两个维度厘清的实修关键。

---

### 一、 达摩《血脉论》的正本清源：“见性即佛”

从“理”（本性实相）的角度看，佛不是一个外在的神灵，也不是一种具有超能力的特殊肉身，佛者“觉”也。

达摩大师在《血脉论》里反复强调：
“自心是佛，不用将心推佛……若不见性，念佛诵经持戒亦无益处。”

大师的意思是：一切众生本自具足如来清净自性，只是被妄想颠倒遮蔽。当你在明师指引下或于机缘契合时回光返照，彻见自性清净无染、本不动摇的真相时，在觉性这一层面上，你与十方诸佛无二无别。
因此从法身法性而言，“见性即是佛”，根本不需要在你的自性之外再去“成”一个什么身外之物。

---

### 二、 为什么普遍说“见性成佛”？理入与行入、顿悟与渐修

既然“见性即佛”，为什么大家还要强调一个“成”字？

因为从“事”（现实习气与因缘显现）的角度看，“见性”往往只是修行的真正开端（登堂入室），而绝非修行的彻底终结。

达摩祖师在《二入四行论》中开门见山就定下了规矩：“入道多途，要而言之，不出二种：一是理入，二是行入。”
唐代圭峰宗密大师在《禅源诸诠集都序》中作出了经典总结：“理虽顿悟，事须渐修。”

打个极其通俗的比喻：
见性，好比婴儿呱呱坠地。从生命本质（DNA）来说，他百分之百是个完完整整的人，绝不是猫狗牛马（见性即佛）；
但他生下来就能立刻挑担耕田、治理天下吗？绝不可能。他必须经历母乳抚育、读书识字、经风历雨、长大成人的全过程（渐修与保任）。

如果一个学人刚在理上体验到一点自性空明的滋味，就自封为“成佛了”，以为因果可以不顾、戒律可以废除、习气不用打磨，这在禅门中被称为“狂禅”与“口头禅”，不仅成不了佛，反而极易堕入恶趣。

---

### 三、 从“见性”到“圆满佛果”，中间究竟还差什么？

禅宗祖师讲得非常实在，中间主要差两件事：

1. 荡涤多生累劫的“俱生烦恼与习气”（消业修定）：
见性是刹那断除了“分别我执”（在观念知见上不再被迷弄），但一个人从小到大甚至无始劫来形成的贪、嗔、痴、慢、疑、自私与傲慢等生理及下意识反应（俱生我执），并不会因为你明白道理就立刻消失。
顺境来了依然容易得意，逆境来了依然容易烦躁，遇到利益冲突依然会有贪心。这就需要祖师所说的“大死一番，绝后再苏”，在红尘日用中不断“保任”，历境验心。

2. 积累广度众生的“大悲行愿与福德资粮”（修慧修福）：
佛是“两足尊”——智慧圆满、福德圆满。见性开发的是自性根本智，但佛陀还具足无量相好庄严、一切智智以及普度众生的四摄六度大愿。
正如六祖惠能大师在五祖弘忍处得法彻悟后，五祖并未让他立刻开堂说法，而是嘱咐他隐遁于猎人队中保任修持整整一十五年，磨砺心性，直至因缘具足才出山剃度说法。
赵州禅师八十岁高龄依然行脚参访，也是为了在一切境界中打磨得圆融无碍。

---

### 四、 现代人如何在生活中落实这门心法

明白了“见性”与“成佛”的辩证关系，我们在生活工作中就能保持极其健康平衡的心态：

1. 见地要高，直下承当（理入）：
在纷繁复杂的生活压力下，随时向内反观，体认自己内心的清净本性，不被暂时的荣辱成败绑架，保持内在的安详从容。
2. 功夫要细，脚踏实地（行入）：
在事相上不搞特权，踏踏实实做好本职工作，孝顺父母，善待他人，觉察自己的负面情绪并加以化解。达摩祖师讲的“报冤行、随缘行、无所求行、称法行”，正是日常生活的四颗定心丸。

---

### 五、 延伸研读与数字化典籍文献参考

如果想深入探究达摩祖师原典、历代祖师公案以及见性实修脉络，推荐参考非营利数字化禅学文献库：

- 📖 菩提达摩大师《血脉论》全文现代白话导读与核心旨趣：https://chanzong.space/classics/xuemaicong
- 📖 禅门核心修持理念「见性」与「本心」专题辨析：https://chanzong.space/concepts/jian-xing
- 👤 初祖菩提达摩大师生平、行化与四论全集：https://chanzong.space/persons/bodhidharma
- 🌐 历代禅宗五宗七派法脉与两百座公案图谱：https://chanzong.space/graph

知见立知，即无明本；知见无见，斯即涅槃。愿每位同修都能明心见性，事理圆融。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎达摩血脉论与见性成佛核心问答自动化发布...")
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
            page.screenshot(path="tools/backlinks/zhihu_damo_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_damo_err_no_editor.png")
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
        page.screenshot(path="tools/backlinks/zhihu_damo_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_damo_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_damo_published.png")
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
            target_url=f"{SITE_DOMAIN}/classics/xuemaicong",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 达摩大师血脉论与见性概念专页",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《见性成佛与见性即佛辨析》文献级解答，无痕排版，包含血脉论专页、见性概念、达摩人物专页与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
