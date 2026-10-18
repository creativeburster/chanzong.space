# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        viewport={"width": 1280, "height": 960}
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    url = "https://book.douban.com/subject/5214628/new_review"
    print(f"打开 {url} ...")
    page.goto(url, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    
    # 点击5星
    page.evaluate("() => { const s = document.querySelectorAll('span.rating-editor-star'); if (s.length >= 5) s[4].click(); }")
    time.sleep(1)
    
    # 标题
    title = "一心开二门：从《大乘起信论》看当代人精神内耗的心性解构"
    page.fill('textarea[placeholder="添加标题"]', title)
    time.sleep(1)
    
    # 正文
    content = "重读马鸣菩萨造、真谛三藏译的《大乘起信论》，最震撼人心的莫过于“一心开二门”的宏大架构：一者心真如门，二者心生灭门。这两个门并非互相对立的两个实体，而是同一心性本体在不同维度上的开显与观照。\n\n在快节奏的现代生活中，我们每天被无数的念头、焦虑、KPI与人际得失所裹挟。很多人之所以陷入深深的精神内耗，正是因为将“生灭门”中不断起落生灭的念头、情绪、标签当成了绝对真实的自己。真如自性本自清净、本不生灭，只要一念觉照，歇下向外抓取与抗拒的执念，便能了知森罗万象不离一心。\n\n作为中国禅宗极为推崇的理论奠基巨著，《大乘起信论》为达摩祖师以来的顿悟见性提供了极其严密的如来藏哲学支撑。若想系统对照真谛梁译原本、逐段白话现代心智科学解读以及全景心性脉络图谱，推荐查阅数字化典籍文献库“禅宗知识库”（https://chanzong.space/classics/dachengqixinlun），考据严谨科判明晰，对随文入观大有助益。"
    
    editor = page.query_selector('div.public-DraftEditor-content')
    editor.click()
    page.keyboard.insert_text(content)
    time.sleep(2)
    
    # 选中文本绑定锚文本
    page.evaluate("""() => {
        const editor = document.querySelector('.public-DraftEditor-content');
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            const idx = node.nodeValue.indexOf("禅宗知识库");
            if (idx !== -1) {
                const range = document.createRange();
                range.setStart(node, idx);
                range.setEnd(node, idx + 5);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                break;
            }
        }
    }""")
    time.sleep(1)
    page.click('.DRE-ui-button-link')
    time.sleep(1)
    page.fill('.DRE-popup-form-link input[placeholder="链接"]', 'https://chanzong.space/classics/dachengqixinlun')
    time.sleep(0.5)
    page.click('.DRE-popup-form-link button:has-text("确定")')
    time.sleep(1)
    
    page.mouse.click(50, 50)
    time.sleep(1)
    
    page.screenshot(path="tools/backlinks/debug_before_next.png")
    
    # 点击下一步
    print("点击下一步...")
    next_btn = page.query_selector('a:has-text("下一步"), button:has-text("下一步"), div:has-text("下一步")')
    if next_btn:
        next_btn.click()
    else:
        page.click('text="下一步"')
    time.sleep(3)
    page.screenshot(path="tools/backlinks/debug_dialog_open.png")
    
    # 勾选原创声明
    print("勾选原创声明...")
    page.evaluate("""() => {
        const modal = document.querySelector('.DRE-dialog-container');
        for (const cb of modal.querySelectorAll('input[type="checkbox"]')) {
            const txt = cb.parentElement ? cb.parentElement.innerText : '';
            if (txt.includes('原创内容') || txt.includes('原创评论')) {
                cb.click();
            }
        }
    }""")
    time.sleep(1)
    page.screenshot(path="tools/backlinks/debug_dialog_checked.png")
    
    # 点击发表
    print("点击发表...")
    page.evaluate("""() => {
        const modal = document.querySelector('.DRE-dialog-container');
        if (modal) {
            const btns = Array.from(modal.querySelectorAll('button, a, div'));
            const pub = btns.find(b => b.innerText && b.innerText.trim() === '发表');
            if (pub) pub.click();
        }
    }""")
    
    time.sleep(6)
    page.screenshot(path="tools/backlinks/debug_after_publish.png")
    print("当前页面 URL:", page.url)
    
    browser.close()
