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
    
    target_url = "https://book.douban.com/subject/3007708/new_review"
    page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 检查下一步按钮初始状态
    btn_info_before = page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button, a, div')).find(el => el.innerText && el.innerText.trim() === '下一步');
        return btn ? {
            tagName: btn.tagName,
            className: btn.className,
            disabled: btn.disabled,
            outerHTML: btn.outerHTML
        } : null;
    }""")
    print("初始下一步按钮:", btn_info_before)
    
    # 点击5星
    page.evaluate("""() => {
        const stars = document.querySelectorAll('span.rating-editor-star');
        if (stars.length >= 5) stars[4].click();
    }""")
    time.sleep(0.5)
    
    # 标题输入
    title_box = page.query_selector('textarea[placeholder="添加标题"]')
    if title_box:
        title_box.click()
        title_box.fill("直指人心见性成佛：重读《六祖坛经》的现代心性观照")
        time.sleep(0.5)
    
    # 正文输入较长内容
    editor = page.query_selector('div.public-DraftEditor-content')
    if editor:
        editor.click()
        time.sleep(0.5)
        text_content = """《六祖坛经》作为中国禅宗的核心奠基之作，其最震撼人心之处在于直指本心、顿悟自性。惠能大师以“菩提本无树，明镜亦非台；本来无一物，何处惹尘埃”的明心见性偈，彻底打破了渐修与顿悟的形式藩篱。

在现代心理学与心智哲学的视域下，《六祖坛经》展现出极高的知行超越性。所谓“不思善，不思恶”，并非消极避世，而是让意识超越二元对立的认知偏执，安住于本自具足的清净觉照之中。

禅宗不立文字，非废除文字，而是借言显道。《坛经》开示“外离相即禅，内不乱即定”，将定慧融为一体，犹如灯光与烛火，灯即光之体，光即灯之用。"""
        # 利用 insert_text 插入
        page.keyboard.insert_text(text_content)
        time.sleep(1)
        page.keyboard.press("Space")
    
    time.sleep(2)
    
    btn_info_after = page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button, a, div')).find(el => el.innerText && el.innerText.trim() === '下一步');
        return btn ? {
            tagName: btn.tagName,
            className: btn.className,
            disabled: btn.disabled,
            outerHTML: btn.outerHTML
        } : null;
    }""")
    print("输入长文后下一步按钮:", btn_info_after)
    
    page.screenshot(path="tools/backlinks/douban_long_text_ready.png")
    
    # 点击下一步
    btn_el = page.query_selector('button:has-text("下一步"), a:has-text("下一步")')
    if btn_el:
        print("点击下一步...")
        btn_el.click()
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_clicked_next.png")
    
    # 查看页面是否有弹窗或新元素
    dialog_check = page.evaluate("""() => {
        const allVisible = Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style && parseInt(style.zIndex || 0) > 10 && style.display !== 'none' && el.offsetWidth > 100 && el.offsetHeight > 50;
        }).map(el => ({
            tag: el.tagName,
            className: el.className,
            text: el.innerText ? el.innerText.trim().slice(0, 150) : ""
        }));
        return {
            url: window.location.href,
            elements: allVisible.slice(0, 10)
        };
    }""")
    print("弹窗或变化检测:", json.dumps(dialog_check, ensure_ascii=False, indent=2))
    
    ctx.close()
