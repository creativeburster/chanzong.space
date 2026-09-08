# -*- coding: utf-8 -*-
"""
知乎已发布回答全量清洗与重新编辑工具 (直连 Answer URL)
精确访问 3 个 answer 详情页，点击【编辑回答】或【修改】，替换为无任何 ###、** 等 markdown 标记的自然纯中文学术排版。
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "zhihu_cookie.json")

from clean_for_zhihu import clean_markdown_for_zhihu
from platform_runners.zhihu_answer_bot import ANSWER_TEXT as TEXT_1
from platform_runners.zhihu_post_jingangjing import ANSWER_TEXT as TEXT_2
from platform_runners.zhihu_post_jgj_wu import ANSWER_TEXT as TEXT_3

ANSWERS_TO_UPDATE = [
    {
        "name": "回答1：六祖坛经与心经",
        "url": "https://www.zhihu.com/question/2036422757978723800/answer/2080588671347061388",
        "clean_text": clean_markdown_for_zhihu(TEXT_1)
    },
    {
        "name": "回答2：凡所有相皆是虚妄",
        "url": "https://www.zhihu.com/question/1928206401152451835/answer/2080590075331613854",
        "clean_text": clean_markdown_for_zhihu(TEXT_2)
    },
    {
        "name": "回答3：金刚经能使人大彻大悟吗",
        "url": "https://www.zhihu.com/question/1913876847906785200/answer/2080590300813252077",
        "clean_text": clean_markdown_for_zhihu(TEXT_3)
    }
]

def update_all_answers():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookie_dict = json.load(f)
        
    cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        context.add_cookies(cookies)
        page = context.new_page()
        
        # 首页热身
        print("访问知乎首页建立合法会话...")
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        for idx, item in enumerate(ANSWERS_TO_UPDATE):
            print("="*60)
            print(f"🔄 正在优化并更新 [{idx+1}/3] {item['name']}...")
            print(f"👉 链接: {item['url']}")
            print("="*60)
            
            page.goto(item["url"], wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)
            
            # 查找【编辑回答】或【修改】按钮
            edit_btn = page.query_selector("button:has-text('编辑回答'), a:has-text('编辑回答'), button:has-text('修改'), a:has-text('修改')")
            if not edit_btn:
                print(f"⚠️ 在详情页未找到编辑按钮，尝试从页面查找修改链接...")
                # 滚动一下页面触发加载
                page.evaluate("window.scrollBy(0, 300)")
                time.sleep(1)
                edit_btn = page.query_selector("button:has-text('修改'), a:has-text('修改')")
                
            if not edit_btn:
                print(f"⚠️ 未找到编辑按钮，已截图：tools/backlinks/err_edit_{idx+1}.png")
                page.screenshot(path=f"tools/backlinks/err_edit_{idx+1}.png")
                continue
                
            print("找到编辑按钮，正在进入编辑模式...")
            page.evaluate("el => el.click()", edit_btn)
            time.sleep(3)
            
            # 定位编辑器
            editor = page.query_selector(".public-DraftEditor-content, div.DraftEditor-editorContainer, div[contenteditable='true']")
            if not editor:
                print("⚠️ 未定位到编辑器！")
                page.screenshot(path=f"tools/backlinks/err_no_editor_{idx+1}.png")
                continue
                
            editor.click()
            time.sleep(1)
            
            # 全选并清空旧文本
            page.keyboard.press("Control+A")
            time.sleep(0.5)
            page.keyboard.press("Backspace")
            time.sleep(1)
            
            # 填入清洗后的无痕自然排版文本
            paragraphs = item["clean_text"].split("\n\n")
            for para in paragraphs:
                para_clean = para.strip()
                if not para_clean:
                    continue
                page.keyboard.insert_text(para_clean)
                page.keyboard.press("Enter")
                page.keyboard.press("Enter")
                time.sleep(0.2)
                
            print("✅ 清洗排版注入完成，等待保存草稿...")
            time.sleep(3)
            
            # 点击【提交修改】或【发布回答】保存
            submit_btn = page.query_selector("button:has-text('提交修改'), button:has-text('发布回答'), button.AnswerForm-submit, button.Button--primary:has-text('发布')")
            if submit_btn:
                page.evaluate("el => el.click()", submit_btn)
                print("已触发【提交修改】，保存更新...")
                time.sleep(6)
                page.screenshot(path=f"tools/backlinks/fixed_answer_{idx+1}.png")
                print(f"🎉 [{idx+1}/3] {item['name']} 优化更新成功！已彻底消除任何 Markdown 裸露符号！")
            else:
                print("⚠️ 未找到提交/发布按钮！")
                page.screenshot(path=f"tools/backlinks/err_no_submit_{idx+1}.png")
                
            time.sleep(3)
            
        browser.close()
        print("\n🎉 全量知乎已发问答排版清洗与无痕更新完毕！")

if __name__ == "__main__":
    update_all_answers()
