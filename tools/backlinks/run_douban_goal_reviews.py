# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

REVIEW_TASKS = [
    {
        "subject_id": "5214628",
        "classic": "dachengqixinlun",
        "title": "一心开二门：从《大乘起信论》看当代人精神内耗的心性解构",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_keyword": "禅宗知识库",
        "paragraphs": [
            "重读马鸣菩萨造、真谛三藏译的《大乘起信论》，最震撼人心的莫过于“一心开二门”的宏大架构：一者心真如门，二者心生灭门。这两个门并非互相对立的两个实体，而是同一心性本体在不同维度上的开显与观照。",
            "在快节奏的现代生活中，我们每天被无数的念头、焦虑、KPI与人际得失所裹挟。很多人之所以陷入深深的精神内耗，正是因为将“生灭门”中不断起落生灭的念头、情绪、标签当成了绝对真实的自己。我们随境迁转，认贼为子，因而在波浪的翻滚中忘却了海水本身的平静。",
            "《大乘起信论》指出，真如自性本自清净、本不生灭，具足无量称性功德。所谓烦恼无明，不过是依不觉而生三细六相。只要一念觉照，歇下向外抓取与抗拒的执念，便能了知森罗万象不离一心。",
            "作为中国禅宗极为推崇的理论奠基巨著，《大乘起信论》为达摩祖师以来的顿悟见性提供了极其严密的如来藏哲学支撑。若想系统对照真谛梁译原本、逐段白话现代心智科学解读以及全景心性脉络图谱，推荐查阅数字化典籍文献库“禅宗知识库”（https://chanzong.space/classics/dachengqixinlun），考据严谨科判明晰，对随文入观大有助益。"
        ]
    },
    {
        "subject_id": "2355487",
        "classic": "chuanxinfayao",
        "title": "即心即佛，莫向外求：读黄檗希运禅师《传心法要》的息心之境",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_keyword": "禅宗知识库",
        "paragraphs": [
            "唐代相国裴休集黄檗断际禅师语录而成《传心法要》，开篇即直透重关：“诸佛与一切众生，唯是一心，更无别法。此心无始已来，不曾生、不曾灭，不青不黄，无形无相，不属有无，不计长短。”",
            "黄檗禅师的开示如金刚宝剑，直截了当削去一切枝蔓。世间学道之人，往往执着于在名相章句中寻觅玄妙，乃至拼命拂拭身心企图修成一个“佛”，殊不知“起心动念，即乖法体，即为著相”。向外驰求，如蒸沙作饭，纵经千劫亦不得成。",
            "禅宗的核心不在积累知识，而在彻底放下造作与知见。唯有“言语道断，心行处灭”，于一切境缘中心如虚空、不着一物，当下直下承当，才是真正踏入祖师堂奥的大机大用。",
            "《传心法要》是临济宗直指人心的上乘典籍。若想系统研读裴休集原经逐句白话详注、唐代禅门公案与历代祖师传法脉络，推荐参阅开源学术平台“禅宗知识库”（https://chanzong.space/classics/chuanxinfayao），义理阐释极具现代启发。"
        ]
    },
    {
        "subject_id": "3005084",
        "classic": "xinxinming",
        "title": "至道无难唯嫌拣择：重读《信心铭》584字破除执念的自在之境",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_keyword": "禅宗知识库",
        "paragraphs": [
            "禅宗三祖僧璨大师所著《信心铭》，仅用五百八十四字、一百四十六句四言铭文，便将大乘般若与禅宗不二法门阐述得淋漓尽致。开篇八字“至道无难，唯嫌拣择”，堪称千古照破凡夫情执的警世钟磬。",
            "凡夫之心，无时无刻不在进行“拣择”与分别：爱顺境、憎逆境，喜赞誉、厌批评，求安逸、避痛苦。正是这种微细而强烈的爱憎取舍，造就了心灵深处的藩篱与痛苦。“毫厘有差，天地悬隔”，一旦落入二元对立，便是自设囚笼。",
            "三祖开示：“二由一有，一亦莫守；一心不生，万法无咎。”真正的觉醒不是去消灭烦恼追求所谓的纯洁无瑕，而是了知一切现象如梦幻泡影，在顺逆万缘中保持如如不动的明觉之性，无取无舍，任运随缘。",
            "《信心铭》语言优美洗练，字字见性。想细细品读四言铭文现代认知学详注、梵汉法义对照与圆融心法图谱的同修，可参阅数字化典籍库“禅宗知识库”（https://chanzong.space/classics/xinxinming），对澄净身心极有受用。"
        ]
    }
]

def publish_single_review(page, task):
    url = f"https://book.douban.com/subject/{task['subject_id']}/new_review"
    print(f"\n==================================================")
    print(f"👉 正在发布书评: {task['title']}")
    print(f"👉 目标书籍: {url}")
    print(f"==================================================")
    
    page.goto(url, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    
    # 1. 点击五星
    page.evaluate("""() => {
        const stars = document.querySelectorAll('span.rating-editor-star');
        if (stars.length >= 5) stars[4].click();
    }""")
    time.sleep(1)
    
    # 2. 填写标题
    title_box = page.query_selector('textarea[placeholder="添加标题"]')
    if title_box:
        title_box.click()
        title_box.fill(task["title"])
    time.sleep(1)
    
    # 3. 逐段插入正文
    editor = page.query_selector('div.public-DraftEditor-content')
    if editor:
        editor.click()
        time.sleep(0.5)
        for i, p_text in enumerate(task["paragraphs"]):
            page.keyboard.insert_text(p_text)
            time.sleep(0.3)
            if i < len(task["paragraphs"]) - 1:
                page.keyboard.press("Enter")
                time.sleep(0.3)
    time.sleep(2)
    
    # 4. 绑定原生天蓝锚文本
    print("正在选中文本并设置原生天蓝锚文本...")
    bound = page.evaluate("""(data) => {
        const editor = document.querySelector('.public-DraftEditor-content');
        if (!editor) return false;
        
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let targetNode = null;
        let targetOffset = -1;
        
        while ((node = walker.nextNode())) {
            const idx = node.nodeValue.indexOf(data.keyword);
            if (idx !== -1) {
                targetNode = node;
                targetOffset = idx;
                break;
            }
        }
        
        if (targetNode) {
            const range = document.createRange();
            range.setStart(targetNode, targetOffset);
            range.setEnd(targetNode, targetOffset + data.keyword.length);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
        }
        return false;
    }""", {"keyword": task["anchor_keyword"]})
    
    if bound:
        time.sleep(0.5)
        link_btn = page.query_selector('.DRE-ui-button-link')
        if link_btn:
            link_btn.click()
            time.sleep(1)
            link_input = page.query_selector('.DRE-popup-form-link input[placeholder="链接"]')
            if link_input:
                link_input.click()
                link_input.fill(task["target_url"])
                time.sleep(0.5)
                confirm_btn = page.query_selector('.DRE-popup-form-link button:has-text("确定")')
                if confirm_btn:
                    confirm_btn.click()
                    print("✅ 锚文本超链接绑定成功！")
                    time.sleep(1)
                    
    # 点击编辑器外部以取消选区并恢复焦点
    page.mouse.click(100, 100)
    time.sleep(1)
    
    # 5. 点击“下一步”按钮
    btn_next = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
    if btn_next:
        print("点击下一步按钮...")
        btn_next.click()
        time.sleep(3)
        
    # 6. 在弹窗中勾选原创并点击发表
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
    print("弹窗交互结果:", modal_result)
    
    # 7. 等待跳转与提取落地页 URL
    print("等待发布完成与页面跳转...")
    time.sleep(6)
    
    final_url = page.url
    print(f"发布后页面 URL: {final_url}")
    
    # 如果没直接跳转，从个人主页提取
    if "/review/" not in final_url:
        page.goto("https://book.douban.com/people/132002368/reviews", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        final_url = page.evaluate("""() => {
            const first = document.querySelector('.main-bd h2 a');
            return first ? first.href : null;
        }""")
        print(f"从个人主页提取到落地页 URL: {final_url}")
        
    return final_url

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        viewport={"width": 1280, "height": 960}
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    for idx, t in enumerate(REVIEW_TASKS):
        if idx > 0:
            print("防风控安全休眠 25 秒...", flush=True)
            time.sleep(25)
            
        review_url = publish_single_review(page, t)
        if review_url and "/review/" in review_url:
            rec_id = add_backlink(
                platform="豆瓣 (Douban DA 88+)",
                region="国内",
                category="书评",
                post_title=t["title"],
                target_url=t["target_url"],
                backlink_url=review_url,
                anchor_text=f"数字化典籍库“禅宗知识库”（{t['target_url']}）",
                link_type="Dofollow / UGC",
                status="Live",
                notes="豆瓣长篇书评，五星力荐并绑定原生天蓝色锚文本超链接，已勾选原创声明"
            )
            print(f"✅ 外链已入库: [{rec_id}] -> {review_url}", flush=True)
            
            # 截图留存凭证
            rid = review_url.split("/")[-2]
            shot_file = f"tools/backlinks/douban_review_{rid}_live.png"
            page.goto(review_url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)
            page.screenshot(path=shot_file)
            print(f"📸 凭证已保存至: {shot_file}", flush=True)
            
    browser.close()

print("\n🎉 豆瓣 3 篇长篇书评全部处理完毕！")
