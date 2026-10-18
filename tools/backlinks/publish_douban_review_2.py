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

# 目标书籍：金刚经 (上海古籍 / 丁福保笺注 / 鸠摩罗什译)
BOOK_SUBJECT_ID = "35000696"
BOOK_URL = f"https://book.douban.com/subject/{BOOK_SUBJECT_ID}/new_review"
TITLE = "应无所住而生其心：从《金刚经》看现代人精神内耗的彻底破局"

PARAGRAPHS = [
    "在大乘佛学般若系经典中，《金刚般若波罗蜜经》（简称《金刚经》）以其锋利无比的“金刚利刃”，直截了当地斩断众生一切虚妄执念。鸠摩罗什法师的译本辞藻优美凝练、气象冲融，自东晋传入中土以来，便深刻塑造了中国文人与禅者的精神风骨。",
    "《金刚经》的核心修行纲领，发端于须菩提尊者向佛陀提出的关键之问：“善男子、善女人，发阿耨多罗三藐三菩提心，应云何住？云何降伏其心？”对此，佛陀给出的终极开示即是名震千古的“应无所住而生其心”。在凡夫的认知惯性中，思维与情绪总需要寻找一个立足点——执着于外在财富、名誉、人际评价，或者内在于自我的得失感与价值感。然而，《金刚经》指出，任何有“住”的心识，本质上皆是落入了“我相、人相、众生相、寿者相”的牢笼。",
    "从现代认知心理学与系统论的角度来看，所谓“精神内耗”，正是心灵对局部情境的过度固着与反刍。当个体将自我价值完全寄托于外部反馈或预期成果时，心灵便丧失了弹性。《金刚经》著名的“三段论”范式——“所谓佛法者，即非佛法，是名佛法”——向我们揭示了极其深刻的否定辩证法：打破对概念与名相的绝对化执着，既不落入顽空虚无，亦不安立实有偏狭，从而在动态流动中实现身心的彻底松绑。",
    "更为动人的是经文末尾的六如偈：“一切有为法，如梦幻泡影，如露亦如电，应作如是观。”这绝非厌世消极的悲观论调，而是一种洞穿因缘生灭后的宏大慈悲与从容笃定。不执着于幻相的恒常，才能在日用起居中以大智慧行一切善法，以无所得心行菩萨道。",
    "古来研读《金刚经》者浩如烟海，若欲进一步厘清鸠摩罗什译本的分段义理、昭明太子三十二分科判、历代禅宗祖师的参悟机锋，以及与《六祖坛经》在曹溪一脉的互文脉络，强烈推荐参阅数字化开源学术平台“禅宗知识库”的深度专页（链接参阅：chanzong.space/classics/jingangjing），该平台提供结构化名相拆解与D3全局法脉演化图谱（chanzong.space/graph），对义理研习甚有裨益。"
]

print("遵循安全间隔，等待 15 秒...")
time.sleep(15)

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
            if "应无所住而生其心" in r["title"]:
                latest_review_url = r["url"]
                break
        if not latest_review_url:
            latest_review_url = reviews[0]["url"]
            
    print(f"《金刚经》书评独立链接: {latest_review_url}")
    
    if latest_review_url:
        page.goto(latest_review_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_review_2_live.png")
        print("已保存独立书评截图至: tools/backlinks/douban_review_2_live.png")
        
    ctx.close()
