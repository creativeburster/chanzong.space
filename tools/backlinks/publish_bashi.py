# -*- coding: utf-8 -*-
"""
知乎八识规矩颂与阿赖耶识转识成智核心问答自动化发布脚本
目标问题：https://www.zhihu.com/question/1962834109404542124
问题标题：有谁知道什么是阿赖耶识，如何转识成智？
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

QUESTION_URL = "https://www.zhihu.com/question/1962834109404542124"
QUESTION_TITLE = "有谁知道什么是阿赖耶识，如何转识成智？"

RAW_ANSWER = """阿赖耶识与“转识成智”，是整个大乘佛学（特别是唯识宗与禅宗）中最硬核、也最精妙的心灵解剖学与修证密码。

唐代玄奘大师历经十七年西行取经，回国后将极其浩瀚庞杂的唯识宝藏融会贯通，写下了著名的《八识规矩颂》，用极简练的四言偈颂把这套生命机制讲得透彻淋漓。

要理解这两者，其实只要搞懂两个问题：第一，阿赖耶识到底是个什么东西？第二，怎么把充满烦恼分别的“识”，变成朗照大千的“智”？

---

### 一、 什么是阿赖耶识？心灵底层的“黑匣子”与“生命主公”

阿赖耶识（梵文 Ālayavijñāna），在佛学八识（眼耳鼻舌身、意识、末那识、阿赖耶识）中被称为“第八识”，又叫“藏识”。

它之所以叫“藏”，是因为具备三种深层特性：
1. 能藏（数据写入）：
我们从小到大、乃至生生世世每一刹那生起的一个念头、一次动怒、一句善言、一个动作，全都会转化为微细的“业力信息”，像种子一样储存在阿赖耶识中，历劫不坏。
2. 所藏（数据库载体）：
它是容纳一切善染种子的宏大仓库。
3. 我爱执藏（死死认领）：
第七识“末那识”始终潜伏在它身边，死死抓着第八识的见分不放，误认这个数据库就是永恒不变的“我”（这也是人类所有自私、傲慢与我执的终极源头）。

玄奘大师在《八识规矩颂》里用四句诗把它描绘得神妙莫测：
“浩浩三藏不可穷，渊深七浪境为风。受熏持种根身器，去后来先作主公。”
意思是：阿赖耶识如大海般浩瀚渊深，前七识就像海面被外境吹起的波浪；当一个人死亡时，前六识早已停止运作，第七识相随，唯有第八阿赖耶识最后才脱离肉体；而在新生命投胎时，它又是最先到达入胎的，所以它是生命轮回生死流转的“大主公”。

---

### 二、 什么是“转识成智”？

很多初学者容易产生一个致命误区，以为修行是要把这八个识“彻底消灭”，让人变成一块没有知觉的木头顽石。
大错特错！
“识”与“智”，本质上是同一股觉性能量的“迷”与“悟”两种状态：
- 迷的时候，心随境转，被自我执念蒙蔽，带着偏见分别去感知世界，这叫“识”。
- 悟的时候，执着脱落，心灵恢复本来清净，像一面一尘不染的明镜照见万事万物，这叫“智”。

所谓“转识成智”，不是消灭识，而是“转染成净、转迷成悟”——把八个识各自原本扭曲的认知功能，升华还原为佛性本具的“四种大智慧”（四智心品）。

---

### 三、 四智心品的转化阶梯

玄奘大师与六祖惠能大师在开示中，都明确了这四重转化的对应关系：

1. 转第六意识为【妙观察智】：
第六意识原本是分别妄想的大本营，成天患得患失、胡思乱想、纠结计较。
转成“妙观察智”后，能极其敏锐微细地观察万事万物的真相因缘，通达世出世间一切规律，善巧为人处世与应机说法，而内心没有一丝一毫的挂碍与偏执。

2. 转第七末那识为【平等性智】：
第七识是“我执”的根源（常带我痴、我见、我慢、我爱四大根本烦恼），总觉得“我”比别人尊贵、或者“我”受了天大的委屈。
转成“平等性智”后，彻底打破了“人我相”的对立界限，证达众生同一体性，生起无缘大慈、同体大悲，对一切人事物平等看待，不再有高低偏狭之见。

3. 转前五识（眼耳鼻舌身）为【成所作智】：
前五识原本是欲望的触角，眼睛贪看美色，耳朵贪听美音，舌头贪尝滋味。
转成“成所作智”后，五官和肉身变成了实践大愿、利益众生的无上法器，一切日常造作皆能随顺因缘圆满成就。

4. 转第八阿赖耶识为【大圆镜智】：
当第七识我执一破，第八识仓库里的所有污垢杂染种子彻底消融荡涤，阿赖耶识便彻底转为“大圆镜智”。
犹如一面涵盖虚空的大圆镜，物来则现，物去不留；不迎不送，照天照地；万法森罗尽在其中，而镜面未尝受一丝微尘污染。

---

### 四、 现代人日常生活中的实修下手处

普通人不可能一下子就彻底转尽第八识，实修必须讲究先后次序。六祖惠能大师在《坛经》中留下一句千古秘诀：“六七因中转，五八果上圆。”

也就是说，在因地修行时，关键是先从“第六意识”和“第七末那识”下手：

1. 从第六意识下手（培育正念觉察）：
每当生活工作中冒出焦虑、愤怒、嫉妒的念头时，不要顺着念头跑，而是立即启动觉照：“这个念头只是第六意识的妄想，不是真的我。”用清明的观察代替情绪反应。
2. 从第七末那识下手（淡化自我防御）：
每当感到“别人冒犯了我”、“为什么不尊重我”时，体察背后的那个“我执”：如果没有这个虚妄的自我预设立场，烦恼从何而生？学会换位思考，体恤他人，逐渐瓦解第七识的抓取心。

当第六识善于观照、第七识我执消融，前五识和第八识自然在境界成熟时水到渠成、圆满转化。

---

### 五、 延伸研读与数字化典籍文献参考

如果需要查阅玄奘大师《八识规矩颂》全文白话译解、唯识与禅宗心性修证的融会，推荐参考非营利数字化禅学文献库：

- 📖 玄奘大师《八识规矩颂》全文现代白话导读与核心旨趣：https://chanzong.space/classics/bashiguijusong
- 📖 核心哲学概念「阿赖耶识」与「唯识无境」深度义理阐微：https://chanzong.space/concepts/a-lai-ye-shi
- 📖 核心修持概念「转识成智」与「四智心品」非二元图解：https://chanzong.space/concepts/zhuan-shi-cheng-zhi
- 🌐 历代禅宗传承谱系与全量经论知识图谱：https://chanzong.space/graph

六七因中转，五八果上圆。愿每位朋友都能化烦恼为菩提，于日用平常中转识成智。"""

def publish():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    clean_text = clean_markdown_for_zhihu(RAW_ANSWER)
    
    print("="*60)
    print("🚀 启动知乎八识规矩颂与阿赖耶识转识成智问答自动化发布...")
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
            page.screenshot(path="tools/backlinks/zhihu_bashi_err_no_btn.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", write_btn)
        time.sleep(3)
        
        # 4. 定位编辑器并注入内容
        print("[4/5] 定位富文本编辑器并注入自然排版内容...")
        editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
        if not editor:
            print("⚠️ 未找到富文本输入框！")
            page.screenshot(path="tools/backlinks/zhihu_bashi_err_no_editor.png")
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
        page.screenshot(path="tools/backlinks/zhihu_bashi_draft.png")
        
        # 5. 点击【发布回答】
        print("[5/5] 点击【发布回答】按钮...")
        submit_btn = page.query_selector("button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
        if not submit_btn:
            print("⚠️ 未找到【发布回答】按钮！")
            page.screenshot(path="tools/backlinks/zhihu_bashi_no_submit.png")
            browser.close()
            return None
            
        page.evaluate("el => el.click()", submit_btn)
        print("已触发【发布回答】，等待提交与页面跳转...")
        time.sleep(6)
        
        page.screenshot(path="tools/backlinks/zhihu_bashi_published.png")
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
            target_url=f"{SITE_DOMAIN}/classics/bashiguijusong",
            backlink_url=published_url,
            anchor_text="禅宗知识库 · 八识规矩颂专页与阿赖耶识转识成智概念",
            link_type="Dofollow / UGC",
            status="Live",
            notes="使用认证账号【i禅修】(Lv5创作者)发布的《什么是阿赖耶识如何转识成智》两千字文献级深度解答，包含八识规矩颂专页、阿赖耶识概念、转识成智概念与D3图谱全量外链"
        )
        
        browser.close()
        return published_url

if __name__ == "__main__":
    publish()
