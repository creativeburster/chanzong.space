# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            proxy={"server": "http://127.0.0.1:7897"}
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        print("Navigating to HN login...")
        page.goto("https://news.ycombinator.com/login", timeout=25000)
        time.sleep(2)
        
        # Fill create account form (second form)
        username = f"chanzong_{int(time.time()) % 10000}"
        password = f"ZenPass_{int(time.time())}!2026"
        
        forms = page.query_selector_all("form")
        if len(forms) >= 2:
            print("Creating account:", username)
            form = forms[1]
            form.query_selector("input[name='acct']").fill(username)
            form.query_selector("input[name='pw']").fill(password)
            form.query_selector("input[type='submit']").click()
            time.sleep(3)
            print("After register URL:", page.url)
            
            # Now navigate to submit
            page.goto("https://news.ycombinator.com/submit", timeout=25000)
            time.sleep(2)
            print("Submit page URL:", page.url)
            
            title_input = page.query_selector("input[name='title']")
            url_input = page.query_selector("input[name='url']")
            
            if title_input and url_input:
                title = "ChanZong: Open Knowledge Graph for 130+ Zen Classics (Next.js & D3.js)"
                title_input.fill(title)
                url_input.fill("https://chanzong.space/graph")
                
                submit_btn = page.query_selector("input[type='submit']")
                submit_btn.click()
                time.sleep(5)
                print("After submit URL:", page.url)
                
                # Check user submitted items
                page.goto(f"https://news.ycombinator.com/submitted?id={username}")
                time.sleep(2)
                item_elem = page.query_selector("tr.athing")
                if item_elem:
                    item_id = item_elem.get_attribute("id")
                    live_url = f"https://news.ycombinator.com/item?id={item_id}"
                    print("🎉🎉 Hacker News 成功发布！")
                    print("👉 Live URL:", live_url)
                    
                    # Add comment
                    page.goto(live_url)
                    time.sleep(2)
                    comment_area = page.query_selector("textarea[name='text']")
                    if comment_area:
                        comment_text = (
                            "Hi everyone,\n\n"
                            "We built ChanZong Knowledge Base (https://chanzong.space) as an open-access digital humanities platform. "
                            "It indexes 130 canonical Zen Buddhist scriptures, 500+ philosophical concepts, and hundreds of master lineages.\n\n"
                            "Key architecture highlights:\n"
                            "- D3.js v7 multi-stage physics engine with auto-equilibrium dampening to eliminate jitter in dense concept topologies.\n"
                            "- Next.js 14 App Router dual-track static site generation (Simplified Chinese at /classics and Traditional Chinese at /zh-tw/classics) via opencc-js.\n"
                            "- Zero-dangling-reference taxonomy schema linking scriptures, patriarch biographies, and koan dialogues.\n\n"
                            "Check out the interactive graph here: https://chanzong.space/graph\n"
                            "Full scriptures: https://chanzong.space/classics\n\n"
                            "Feedback and suggestions are warmly welcome!"
                        )
                        comment_area.fill(comment_text)
                        add_comment_btn = page.query_selector("input[value='add comment']")
                        if add_comment_btn:
                            add_comment_btn.click()
                            time.sleep(3)
                            print("✅ 已在 HN 帖子下追加长篇技术架构解说与完整官方链接！")
                            
                    rec_id = add_backlink(
                        platform="Hacker News (Y Combinator DA 91)",
                        region="海外英文/全球",
                        category="极客社区与技术精选",
                        post_title=title,
                        target_url="https://chanzong.space/graph",
                        backlink_url=live_url,
                        anchor_text="ChanZong: Open Knowledge Graph for 130+ Zen Classics",
                        link_type="Dofollow",
                        status="Live",
                        notes="Hacker News 全球顶级极客社区发布，包含 D3.js 拓扑引擎与 Next.js 14 双轨静态架构详细解说"
                    )
                    print(f"✅ 外链台账已成功入库: {rec_id}")
                    return live_url
                else:
                    print("未能抓取到提交条目，截图排查")
                    page.screenshot(path="scratch/hn_submit_fail.png")
            else:
                print("未找到输入框，截图排查")
                page.screenshot(path="scratch/hn_submit_fail.png")
        browser.close()

if __name__ == "__main__":
    run()
