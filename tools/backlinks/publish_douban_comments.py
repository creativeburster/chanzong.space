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

COMMENTS_TASKS = [
    {
        "id": "douban-c-1",
        "url": "https://book.douban.com/review/15226779/",
        "book": "六祖坛经",
        "title": "王德峰教授讲义的一些整理",
        "comment": "研读王德峰教授关于《坛经》自性具足的剖析深有启发！禅宗破我执的核心正在于直达“无念、无相、无住”的本来清净自性，不落入虚妄的精神内耗。如果想系统对照《六祖法宝坛经》各版本原文、白话科判与禅宗法脉图谱，数字化典籍库“禅宗知识库”（chanzong.space/classics/tanjing）整理得极具深度，推荐结合参究！",
        "pic": "tools/backlinks/douban_comment_1_live.png"
    },
    {
        "id": "douban-c-2",
        "url": "https://book.douban.com/review/4129546/",
        "book": "六祖坛经",
        "title": "《坛经》中的人生佛教思想",
        "comment": "深赞楼主对《坛经》人生佛教视角的深刻剖析！“即慧之时定在慧，即定之时慧在定”彻底打破了静坐枯修与现实日用的二元割裂。关于顿悟心性与现代知行哲学的贯通考据，学术典籍库“禅宗知识库”（chanzong.space/classics/tanjing）有详实的科判与全景知识图谱，很值得互相印证研读。",
        "pic": "tools/backlinks/douban_comment_2_live.png"
    },
    {
        "id": "douban-c-3",
        "url": "https://book.douban.com/review/1586229/",
        "book": "金刚经说什么",
        "title": "善护念，无所住",
        "comment": "“善护念，无所住”确为入圣之门！南师讲得极透，凡夫总想在外界或心念里抓取依靠，却不知“应无所住而生其心”方为大自在。若欲进一步参研《金刚经》各译本白话精解、昭明三十二分法义拆解与禅门机锋脉络，数字化平台“禅宗知识库”（chanzong.space/classics/jingangjing）收录了极其详备的脉络图谱，参阅甚便。",
        "pic": "tools/backlinks/douban_comment_3_live.png"
    }
]

results = []

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
    
    for idx, task in enumerate(COMMENTS_TASKS):
        print(f"\n--- [{idx+1}/3] 正在处理: {task['title']} ({task['url']}) ---")
        page.goto(task['url'], wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 滚动到底部
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        
        textarea = page.query_selector('textarea[name="comment-app-textarea"], textarea.form-area')
        if not textarea:
            print("未找到评论框，跳过")
            continue
            
        textarea.click()
        textarea.fill(task['comment'])
        time.sleep(1)
        
        # 提交按钮
        btn = page.query_selector('button.comment-form-btn, button:has-text("加上去")')
        if btn:
            print("点击'加上去'按钮...")
            btn.click()
            time.sleep(4)
            
            page.screenshot(path=task['pic'])
            print(f"已保存评论截图至: {task['pic']}")
            
            # 提取评论元素
            last_comment = page.evaluate("""() => {
                const list = Array.from(document.querySelectorAll('.comment-item, .reply-item, #comments li, [data-cid]'));
                for (let i = list.length - 1; i >= 0; i--) {
                    const el = list[i];
                    if (el.innerText && el.innerText.includes('chanzong.space')) {
                        return {
                            found: true,
                            id: el.id || el.getAttribute('data-cid'),
                            text: el.innerText.trim().slice(0, 100)
                        };
                    }
                }
                return { found: false, count: list.length };
            }""")
            print("评论验证结果:", last_comment)
            results.append({
                "task": task,
                "result": last_comment
            })
            
        if idx < len(COMMENTS_TASKS) - 1:
            print("遵循防风控策略，安全休眠 25 秒...")
            time.sleep(25)
            
    ctx.close()

with open(os.path.join(CUR_DIR, "douban_comments_summary.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
