# -*- coding: utf-8 -*-
import os, sys, time
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

# 尝试搜索或直接访问《六祖坛经》
SEARCH_URL = "https://book.douban.com/subject_search?search_text=%E5%85%AD%E7%A5%96%E5%9D%9B%E7%BB%8F&cat=1001"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    print("正在访问豆瓣搜索《六祖坛经》...")
    page.goto(SEARCH_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    print("当前标题:", page.title())
    print("当前URL:", page.url)
    page.screenshot(path="tools/backlinks/douban_search_tanjing.png")
    
    items = page.evaluate("""() => {
        const results = [];
        const links = document.querySelectorAll('.item-root a.title-text, .sc-bZQynM a, a[href*="/subject/"]');
        for (const a of links) {
            const href = a.href;
            const text = a.innerText.trim();
            if (href && href.includes('/subject/') && text && text.length > 1) {
                results.push({ title: text, url: href });
            }
        }
        return results.slice(0, 10);
    }""")
    print("找到的书籍条目:", items)
    
    if items:
        target_book = items[0]["url"]
        print(f"正在访问第一个书籍页面: {target_book}")
        page.goto(target_book, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        page.screenshot(path="tools/backlinks/douban_book_detail.png")
        
        review_info = page.evaluate("""() => {
            const newReviewLink = document.querySelector('a[href*="/new_review"], a[href*="/reviews/new"], a.lnk-review');
            const markButtons = Array.from(document.querySelectorAll('a, button')).map(el => ({
                text: el.innerText.trim(),
                href: el.href || null,
                id: el.id,
                className: el.className
            })).filter(item => item.text.includes('写书评') || item.text.includes('读过') || item.text.includes('在读'));
            return {
                newReviewLink: newReviewLink ? newReviewLink.href : null,
                markButtons: markButtons.slice(0, 10)
            };
        }""")
        print("书评与标记入口信息:", review_info)
        
        if review_info["newReviewLink"]:
            print(f"正在进入写书评页面: {review_info['newReviewLink']}")
            page.goto(review_info["newReviewLink"], wait_until="domcontentloaded", timeout=30000)
            time.sleep(3)
            page.screenshot(path="tools/backlinks/douban_review_editor.png")
            print("写书评页面标题:", page.title())
            print("写书评页面URL:", page.url)
            
            editor_elements = page.evaluate("""() => {
                const titleInput = document.querySelector('input[name="title"], #review_title, input[type="text"]');
                const contentInput = document.querySelector('textarea, div[contenteditable="true"]');
                const rating = document.querySelectorAll('span.rating, input[name="rating"]');
                const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], .btn-submit, #review_submit');
                return {
                    titleInput: titleInput ? { name: titleInput.name, id: titleInput.id, placeholder: titleInput.placeholder } : null,
                    contentInput: contentInput ? { tagName: contentInput.tagName, name: contentInput.name, id: contentInput.id } : null,
                    hasRating: rating.length > 0,
                    submitBtn: submitBtn ? { text: submitBtn.innerText || submitBtn.value, id: submitBtn.id } : null
                };
            }""")
            print("编辑器结构探测:", editor_elements)
            
    ctx.close()
