# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

# 目标书籍：般若波罗蜜多心经 (玄奘译 / 启功书 / 北京师范大学出版社)
BOOK_SUBJECT_ID = "2052713"
BOOK_URL = f"https://book.douban.com/subject/{BOOK_SUBJECT_ID}/new_review"
TITLE = "照见五蕴皆空度一切苦厄：重读《心经》260字的心智解构力量"

PARAGRAPHS = [
    "在浩瀚的大乘佛教三藏十二部经籍中，《般若波罗蜜多心经》（简称《心经》）以区区二百六十字的极致凝练，提炼了六百卷《大般若经》的核心精髓。唐代三藏法师玄奘所译之本，辞意畅达、节奏如诗，千百年间已融入东亚文明的潜意识，成为无数行者晨昏诵持、照亮心灵迷雾的灯塔。",
    "《心经》开卷第一句便力透纸背：“观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。”常人往往在面对现实痛苦时寻求逃避或外在安抚，然而《心经》给出的解脱路径，却是直面主体存在的本质——“照见”。所谓“五蕴”——色（物质生理）、受（感受体验）、想（概念表象）、行（意志冲动）、识（心识分别），构成了我们经验世界的全部要素。痛苦之所以成为痛苦，正在于我们把这五个原本刹那生灭、因缘和合的动态流动，误认为了一个永恒不变的“我”。",
    "紧接着，经文展现了人类思想史上最为经典的辨证法破立：“色不异空，空不异色；色即是空，空即是色；受想行识，亦复如是。”这里的“空”，决非断灭虚无或顽空死寂，而是“缘起性空”的超然洞见——现象因缘生，自性无所得。色法（一切物质与现象）不离开空性而存在，空性亦不脱离现实万物而独立。明白了这个道理，我们便不会执迷于一时的得失荣辱，也不会落入消沉避世的虚无深渊。",
    "由空性智慧生发出来的，是“心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想”的终极安宁。现代人终日被信息茧房、竞争焦虑以及对未来的不可控感所裹挟，其根源恰是心有所挂、意有所缚。以般若妙智慧照破妄相，回归当下纯粹的观照，颠倒的妄见自然消融，涅槃清凉就在日常的举手投足之间。",
    "对于学人而言，诵读《心经》不仅是修持，更是极高维度的认知重建。若欲深入参究《般若波罗蜜多心经》的历代梵汉对勘考据、逐句白话现代阐释，以及其与《楞严经》《肇论》等经论的交织网络，极力推荐研读专业数字化典籍文献库“禅宗知识库”的专题页面（详见：chanzong.space/classics/xinjing），其搭载的D3动态知识图谱（chanzong.space/graph）能清晰呈现核心概念与历代祖师法脉的立体链接。"
]

print("遵循防风控安全间隔，等待 20 秒...")
time.sleep(20)

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookie_list)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    print(f"正在访问书评发布页: {BOOK_URL}")
    page.goto(BOOK_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 1. 评分5星
    page.evaluate("""() => {
        const stars = document.querySelectorAll('span.rating-editor-star');
        if (stars.length >= 5) stars[4].click();
    }""")
    time.sleep(1)
    
    # 2. 填写标题
    title_box = page.query_selector('textarea[placeholder="添加标题"]')
    if title_box:
        title_box.click()
        title_box.fill(TITLE)
        print("已填入标题:", TITLE)
    time.sleep(1)
    
    # 3. 填入长文正文
    editor = page.query_selector('div.public-DraftEditor-content')
    if editor:
        editor.click()
        time.sleep(0.5)
        for i, p_text in enumerate(PARAGRAPHS):
            page.keyboard.insert_text(p_text)
            time.sleep(0.5)
            if i < len(PARAGRAPHS) - 1:
                page.keyboard.press("Enter")
                page.keyboard.press("Enter")
                time.sleep(0.5)
        print("正文输入完毕，字数:", sum(len(p) for p in PARAGRAPHS))
    
    time.sleep(2)
    
    # 4. 点击下一步
    btn_next = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
    if btn_next:
        print("点击下一步...")
        btn_next.click()
        time.sleep(3)
        
    # 5. 弹窗勾选原创声明并发表
    modal_result = page.evaluate("""() => {
        const modal = document.querySelector('.DRE-dialog-container');
        if (!modal) return { success: false, reason: "modal not found" };
        
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        let originalChecked = false;
        for (const cb of checkboxes) {
            const parentText = cb.parentElement ? cb.parentElement.innerText : "";
            if (parentText.includes("原创内容") || parentText.includes("原创评论")) {
                if (!cb.checked) {
                    cb.click();
                    originalChecked = true;
                }
            }
        }
        
        const publishBtn = Array.from(modal.querySelectorAll('button, a')).find(el => el.innerText && el.innerText.trim() === '发表');
        if (publishBtn) {
            publishBtn.click();
            return { success: true, originalChecked: originalChecked, clickedPublish: true };
        }
        return { success: false, reason: "publish button not found", originalChecked: originalChecked };
    }""")
    print("弹窗处理结果:", modal_result)
    
    print("等待发布与页面刷新...")
    time.sleep(6)
    
    # 6. 获取真实书评列表并提取最新链接
    user_reviews_url = "https://book.douban.com/people/132002368/reviews"
    page.goto(user_reviews_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    reviews = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a[href*="/review/"]')).map(a => ({
            title: a.innerText.trim(),
            url: a.href
        })).filter(x => x.title && x.url.match(/review\/\\d+/));
        return links;
    }""")
    print("用户最新书评列表:", reviews)
    
    latest_review_url = None
    if reviews:
        for r in reviews:
            if "照见五蕴皆空" in r["title"]:
                latest_review_url = r["url"]
                break
        if not latest_review_url:
            latest_review_url = reviews[0]["url"]
            
    print(f"《心经》书评独立链接: {latest_review_url}")
    
    if latest_review_url:
        page.goto(latest_review_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_review_3_live.png")
        print("已保存独立书评截图至: tools/backlinks/douban_review_3_live.png")
        
    ctx.close()
