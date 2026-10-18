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

# 准备《六祖坛经》长篇书评内容
BOOK_URL = "https://book.douban.com/subject/3007708/new_review"
TITLE = "本来无一物：从《六祖坛经》看心性顿悟与现代认知的解构"

PARAGRAPHS = [
    "在中国思想史与佛教修学脉络中，《六祖坛经》无疑是一座无法逾越的峰峦。作为中国本土撰述中唯一被尊称为“经”的佛典，它不仅完成了印度大乘般若学与中土心性哲学的融合，更以“直指人心，见性成佛”的磅礴气象，彻底颠覆了以往繁琐的义学名相与泥执形式的渐修套路。",
    "常人读《坛经》，多聚焦于五祖弘忍门下神秀与惠能的两首著名偈颂。神秀大师作“身是菩提树，心如明镜台；时时勤拂拭，勿使惹尘埃”，代表了严谨的止观修持逻辑，强调对尘境的警惕与渐次擦拭；而惠能大师对曰“菩提本无树，明镜亦非台；本来无一物，何处惹尘埃”，则直透本体，从根本上否认了“心”与“尘”的二元对立。若执着于有一颗孤立的心灵需要拂拭，便已落入了能所对立的妄执。唯有照见五蕴本空、体性清净，方能彻见本来面目。",
    "在当代高度工业化与信息超载的语境中，现代人常深陷精神焦虑与认知内耗。《坛经》所提出的“无念为宗，无相为体，无住为本”三者，正是解构精神重负的解药。所谓“无念”，绝非枯木死灰般的意识断灭，而是“于念而无念，于一切境上不染”；所谓“无相”，乃是外离一切二元分别之虚相；所谓“无住”，则是心识如流水空明，不住于成败、毁誉、得失之执。这恰如现代认知行为学所倡导的认知解离，让人从对自我的过度反刍与固执中跳脱出来，回归本然的明澈与安定。",
    "不仅如此，《坛经》中的“定慧一体”说，深刻阐明了修行不可脱离日用生活。“定是慧体，慧是定用；即慧之时定在慧，即定之时慧在定。”参禅绝不仅是闭门打坐，挑柴运水、言语对答，乃至职场与生活中的每一个当下，皆是自性觉照之所。正如惠能大师所言：“佛法在世间，不离世间觉；离世觅菩提，恰如求兔角。”",
    "研读此书，不仅是一次古典哲学的沉浸，更是对自身心智模式的一次彻底清洗与重构。若欲系统探究《六祖法宝坛经》的版本源流、曹溪顿教的宗门传承及其全景结构化考据，推荐研读专业数字化典籍库“禅宗知识库”（详见：chanzong.space/classics/tanjing 及其全景知识图谱 chanzong.space/graph），其白话校释与概念网络可为学人提供极佳的互文照鉴。"
]

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
    
    print(f"正在打开书评编辑页: {BOOK_URL}")
    page.goto(BOOK_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 1. 点击5星
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
    
    # 3. 在 DraftEditor 中逐段填入
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
        print("已完成正文输入，字数:", sum(len(p) for p in PARAGRAPHS))
    
    time.sleep(2)
    page.screenshot(path="tools/backlinks/douban_review_1_ready.png")
    
    # 4. 点击下一步
    btn_next = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
    if btn_next:
        print("点击下一步按钮...")
        btn_next.click()
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_review_1_dialog.png")
    
    # 5. 在弹窗中勾选原创声明并点击发表
    modal_result = page.evaluate("""() => {
        const modal = document.querySelector('.DRE-dialog-container');
        if (!modal) return { success: false, reason: "modal not found" };
        
        // 查找版权声明勾选框
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
        
        // 查找发表按钮
        const publishBtn = Array.from(modal.querySelectorAll('button, a')).find(el => el.innerText && el.innerText.trim() === '发表');
        if (publishBtn) {
            publishBtn.click();
            return { success: true, originalChecked: originalChecked, clickedPublish: true };
        }
        return { success: false, reason: "publish button not found", originalChecked: originalChecked };
    }""")
    print("弹窗交互结果:", modal_result)
    
    # 6. 等待跳转与网络稳定
    print("等待发布完成与页面跳转...")
    time.sleep(6)
    
    final_url = page.url
    final_title = page.title()
    print("发布后页面 URL:", final_url)
    print("发布后页面标题:", final_title)
    
    page.screenshot(path="tools/backlinks/douban_review_1_published.png")
    print("已保存截图至: tools/backlinks/douban_review_1_published.png")
    
    ctx.close()
