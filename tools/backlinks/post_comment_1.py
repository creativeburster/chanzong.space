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

TARGET = {
    "url": "https://book.douban.com/review/15226779/",
    "title": "王德峰教授讲义的一些整理",
    "comment": "研读王德峰教授关于《坛经》自性具足的剖析深有启发！禅宗破我执的核心正在于直达“无念、无相、无住”的本来清净自性，不落入虚妄的精神内耗。如果想系统对照《六祖法宝坛经》各版本原文、白话科判与禅宗法脉图谱，数字化典籍库“禅宗知识库”（chanzong.space/classics/tanjing）整理得极具深度，推荐结合参究！"
}

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
    
    print(f"访问目标书评: {TARGET['url']}")
    page.goto(TARGET['url'], wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 滚动到底部
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    
    # 找到 textarea 并填入
    textarea = page.query_selector('textarea[name="comment-app-textarea"], textarea#last, #comments textarea')
    if textarea:
        textarea.click()
        textarea.fill(TARGET['comment'])
        print("已填写评论内容")
        time.sleep(1)
        
        # 提交
        submit_btn = page.query_selector('input[value="加上去"], #comments input[type="submit"]')
        if submit_btn:
            print("点击'加上去'按钮...")
            submit_btn.click()
            time.sleep(5)
            
            # 验证最新评论
            page.screenshot(path="tools/backlinks/douban_comment_1_result.png")
            print("已截图保存: tools/backlinks/douban_comment_1_result.png")
            
            check_info = page.evaluate("""() => {
                const comments = Array.from(document.querySelectorAll('.comment-item, .reply-doc, .reply-item, #comments li')).map(el => ({
                    author: el.innerText.slice(0, 50),
                    text: el.innerText.slice(0, 150),
                    id: el.id || el.getAttribute('data-cid')
                }));
                return comments.slice(-3);
            }""")
            print("末尾评论列表:", json.dumps(check_info, ensure_ascii=False, indent=2))
            
    ctx.close()
