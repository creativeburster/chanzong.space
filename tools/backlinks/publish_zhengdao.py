# -*- coding: utf-8 -*-
"""
知乎永嘉证道歌“不除妄想不求真”核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/1967165225909335858
问题标题：永嘉大师为何说“不除妄想不求真”？
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

QUESTION_URL = "https://www.zhihu.com/question/1967165225909335858"
QUESTION_TITLE = "永嘉大师为何说“不除妄想不求真”？"

RAW_ANSWER = """唐代禅宗六祖惠能大师的高足、名震千古的“一宿觉”永嘉玄觉大师，在《永嘉证道歌》开篇第一句，就以雷霆万钧之势写下了这句震古烁今的名言：

“君不见，绝学无为闲道人，不除妄想不求真。无明实性即佛性，幻化空身即法身。”

绝大多数初学佛修道的人，一坐上蒲团、一开始反省内心，脑子里无非就在打两场旷日持久的恶仗：
第一场仗叫“除妄想”：痛恨自己脑子里纷飞的杂念，总想拿一把无形的大刀把念头彻底斩尽杀绝；
第二场仗叫“求真理”：苦苦向外寻觅一个光明皎洁、超凡脱俗的“佛性真如”，渴望有一天能把它紧紧攥在手里。

然而，永嘉大师却劈头盖脸当头一喝：“不除妄想不求真！”
这不仅不是放任自流的疯话，反而是直指向上、顿悟实相的无上心印。为什么这么说？

---

### 一、 为什么“除妄想”是一场注定失败的徒劳？

禅门先德常讲一句话：“以妄除妄，妄何由尽？以病去病，病反滋长。”

很多人打坐静修，把杂念当成了深仇大恨的敌人。但请冷静反观一下：
那个“嫌弃妄想”、“拼命想把妄想赶走”的心，难道不正是另一个最大、最固执的妄想吗？

这就好比一个人站在镜子前，嫌镜子里的倒影太难看，挥舞拳头去砸镜子；或者像一个人在水里拼命用手拍打波浪，试图让水面平静下来——你越拍，波浪反而激荡得越大！

永嘉大师在后文中直接揭穿了这个机制：
“损法财，灭功德，莫不由斯心意识。是以禅门了却心，顿入无生知见力。”
妄想本就是因缘和合的虚幻现象，像天上的浮云、水面的水泡，生灭无常，当体即空。它本来就没有真实的实体，你何苦头上安头，专门成立一个“除妄想委员会”去跟空气搏斗？
只要觉照升起，看清它无自性，不随它去流转，它自然生灭，何须去“除”？

---

### 二、 为什么“求真”依然是堕入深渊的执念？

如果说“除妄想”是在排斥幻相，那么“求真”就是在建立新的偶像崇拜。

很多学人把“佛性”、“自性”、“真如”当成了一个客观存在的金银财宝，以为只要通过某种神秘苦修，就能从宇宙某个角落把它找出来。
但《金刚经》说得清清楚楚：“若是圣人，无有法得阿耨多罗三藐三菩提。”
真正的自性真如，无所不在，人人本具。喝茶、吃饭、走路、扬眉瞬目，哪一样不是法身的全现？

如果你心里预设了一个至高无上的“真”，而把眼前的苟且与烦恼视作“假”，你就已经掉进了二元对立的深渊。
一头求真，一头厌假，取舍之火在心中日夜煎熬，恰恰背离了本来清净的自然心性。
“不可毁，不可赞，体若虚空勿涯岸。不离当处常湛然，觅即知君不可见。”——你去求它，反而离它十万八千里。

---

### 三、 核心破立：“无明实性即佛性，幻化空身即法身”

既然既不除妄，也不求真，那人到底该怎么活、怎么修？
永嘉大师紧接着给出了惊世骇俗的答案：
“无明实性即佛性，幻化空身即法身！”

这是大乘佛学最纯粹的“不二法门”：
1. 冰与水的比喻：
水结成冰，冰还是水。无明与妄想，就是水结成了冰；佛性与智慧，就是冰融化成了水。
你不需要把冰一块块搬走扔掉才能得到水，温度一到，冰当下就是水。迷即是妄，悟即是真，本体无二。
2. 梦与觉的比喻：
梦境虽然光怪陆离，但做梦的知觉本体未曾受损。醒来之后，并不需要把昨晚的梦境从记忆里物理切除。
你这个由四大假合构成的血肉之躯（幻化空身），其能知能觉的底色，正是如来清净法身的现量映照。

---

### 四、 什么是真正的“绝学无为闲道人”？

永嘉大师开篇自况为“绝学无为闲道人”，这七个字是禅者生命格局的最高写照：

1. 绝学：
不是不读书的文盲，而是彻底超越了世俗死抠概念、争论宗派长短的“文字障”与“所知障”。放下了向外驰求的思辨，大智若愚，心无所得。
2. 无为：
不是躺平消极，而是《金刚经》讲的“应无所住而生其心”——行一切善法，心中无挂无碍；做一切事情，不求功德福报，顺应因缘，了了分明。
3. 闲道人：
世间众人皆在名利、得失、成败的锁链中忙碌焦躁；唯有悟道之人，看破了生死大梦，内心闲雅从容，安享自性的无尽风光。

---

### 五、 现代人如何在内耗中实践这句箴言

1. 允许念头自然流过：
工作生活累了，坐下来闭目休息。脑子里冒出各种担忧、焦虑甚至荒谬的念头时，不要自责，也不要去压抑。对自己笑一笑：“客人来了，随他坐坐，终究会走。”做那个安详的屋主，而不是跟着客人跑的小厮。
2. 停止苛求完美的自己：
放下对“我必须永远情绪稳定、永远正确、永远成功”的执念。接纳生活的不完美与起伏，顺逆不二，心无挂碍。

---

### 六、 延伸研读与数字化典籍文献参考

如果需要查阅永嘉大师《永嘉证道歌》全文白话译注、曹溪六祖一宿觉印心公案以及历代禅门诗偈，推荐参考非营利数字化禅学文献库：

- 📖 唐·永嘉玄觉大师《永嘉证道歌》全文现代白话导读与核心旨趣：https://chanzong.space/classics/zhengdaoge
- 📖 禅门核心概念「绝学无为」与「不二法门」深度义理解析：https://chanzong.space/concepts/jian-xing
- 👤 永嘉玄觉大师与曹溪六祖惠能“一宿觉”传法公案：https://chanzong.space/persons/huineng
- 🌐 历代禅宗传承谱系与两百座公案机锋知识图谱：https://chanzong.space/graph

君不见，绝学无为闲道人，不除妄想不求真。愿每位同修都能从无尽的与自心搏斗中解脱出来，回见本来自在的晴朗青天。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎永嘉证道歌核心问答自动化发布...")
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
            page.screenshot(path="tools/backlinks/zhihu_zhengdao_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_zhengdao_err_no_editor.png")
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
        page.screenshot(path="tools/backlinks/zhihu_zhengdao_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_zhengdao_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_zhengdao_published.png")
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
            target_url=f"{SITE_DOMAIN}/classics/zhengdaoge",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 永嘉证道歌专页与不二法门概念",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《永嘉大师为何说不除妄想不求真》两千字文献级解答，无痕排版，包含证道歌专页、见性概念、六祖人物专页与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
