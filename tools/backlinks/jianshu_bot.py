# -*- coding: utf-8 -*-
"""
简书 (Jianshu DA 86+) 自动化发布技术与数字人文深度长文专栏
挂载 chanzong.space 权威 Dofollow 外部链接与 D3 知识图谱链接
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
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "jianshu_cookie.json")
ARTICLE_PATH = os.path.join(CUR_DIR, "articles", "digital_humanities_zen_graph.md")
sys.path.append(CUR_DIR)
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

def check_jianshu_cookie():
    if not os.path.exists(COOKIE_PATH):
        return False, "未找到 jianshu_cookie.json"
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not data:
        return False, "Cookie 为空"
    return True, "Cookie 读取成功"

def format_cookies():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    cookies = []
    if isinstance(data, dict):
        for k, v in data.items():
            val = str(v).strip('"')
            cookies.append({"name": k, "value": val, "domain": ".jianshu.com", "path": "/"})
    elif isinstance(data, list):
        cookies = data
    return cookies

def publish_jianshu_article():
    ok, msg = check_jianshu_cookie()
    if not ok:
        print(f"❌ 简书 Cookie 检查未通过: {msg}")
        return False

    with open(ARTICLE_PATH, "r", encoding="utf-8") as f:
        raw_md = f.read()

    lines = raw_md.splitlines()
    title = lines[0].replace("# ", "").strip()
    body_md = "\n".join(lines[1:]).strip()

    cookies = format_cookies()
    print("="*60)
    print("🚀 启动简书 (Jianshu DA 86+) 自动化发文引擎...")
    print(f"👉 专栏标题: 《{title}》")
    print(f"👉 挂载域名: {SITE_DOMAIN}")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()

        print("[1/5] 打开简书创作者写作台: https://www.jianshu.com/writer...")
        page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
        time.sleep(4)

        page.screenshot(path="tools/backlinks/jianshu_writer_init.png")

        # 检查是否处于登录状态
        cur_url = page.url
        if "sign_in" in cur_url or "login" in cur_url:
            print("❌ 简书 Cookie 无效或已过期，页面跳转到了登录页！")
            browser.close()
            return False

        print("[2/5] 点击【新建文章】...")
        new_btn = page.query_selector("a[class*='new-note-link'], i[class*='fa-plus'], .fa-plus-circle")
        if not new_btn:
            new_btn = page.evaluate_handle("""() => {
                const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('新建文章'));
                return el;
            }""")
        if new_btn:
            new_btn.click()
            time.sleep(2)
        else:
            print("⚠️ 未找到明确的新建文章按钮，检查现有文章输入框...")

        # 填写标题
        print("[3/5] 填写文章标题...")
        title_input = page.query_selector("input.title, input[class*='title'], input[placeholder*='无标题']")
        if title_input:
            title_input.click()
            title_input.fill(title)
            print(f"已填入标题: {title}")
            time.sleep(1)

        # 填写正文
        print("[4/5] 注入 Markdown 格式正文...")
        editor = page.query_selector("#kalamu-doc, textarea.content, div.CodeMirror-code, [contenteditable='true']")
        if editor:
            editor.click()
            # 简书使用的是标准 markdown 或富文本，我们逐段或直接注入
            for p_line in body_md.split("\n"):
                if not p_line.strip():
                    page.keyboard.press("Enter")
                    continue
                page.keyboard.insert_text(p_line)
                page.keyboard.press("Enter")
                time.sleep(0.02)
            print("已成功写入正文！等待简书自动保存草稿...")
            time.sleep(3)

        page.screenshot(path="tools/backlinks/jianshu_article_ready.png")

        # 5. 点击发布文章
        print("[5/5] 点击【发布文章】...")
        publish_btn = page.query_selector("a:has-text('发布文章'), button:has-text('发布文章'), .publish-btn")
        if not publish_btn:
            publish_btn = page.evaluate_handle("""() => {
                return Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === '发布文章');
            }""")
        
        if publish_btn:
            publish_btn.click()
            print("已点击发布文章！等待生成永久短链...")
            time.sleep(5)
            page.screenshot(path="tools/backlinks/jianshu_published.png")

            # 寻找发布的文章链接
            live_link = page.evaluate("""() => {
                const a = document.querySelector('a[href*="/p/"]');
                return a ? a.href : null;
            }""")
            if not live_link:
                # 尝试从预览或当前状态获取
                live_link = page.url

            print(f"🎉 简书文章发布成功！在线地址: {live_link}")
            
            # 记录外链 (严格本地保存)
            add_backlink(
                platform="简书 (Jianshu DA 86+)",
                region="国内",
                category="技术与数字人文专栏",
                post_title=title,
                target_url=SITE_DOMAIN,
                backlink_url=live_link,
                anchor_text="禅宗知识库 (chanzong.space) 全球图谱与典籍档案",
                link_type="Dofollow",
                status="Live",
                notes="简书官方发布深度长文《开源数字人文：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱》，挂载主站与图谱链接"
            )
            browser.close()
            return True
        else:
            print("❌ 未找到【发布文章】按钮！")
            page.screenshot(path="tools/backlinks/jianshu_err_no_btn.png")
            browser.close()
            return False

if __name__ == "__main__":
    publish_jianshu_article()
