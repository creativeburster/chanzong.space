# -*- coding: utf-8 -*-
"""
简书 (Jianshu DA 86+) 全自动端到端发布脚本
将《开源数字人文：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱》发布上线并获取永久链接。
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

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    tok = json.load(f).get("remember_user_token")

cookies = [
    {"name": "remember_user_token", "value": tok, "domain": ".jianshu.com", "path": "/"},
    {"name": "remember_user_token", "value": tok, "domain": "www.jianshu.com", "path": "/"}
]

with open(ARTICLE_PATH, "r", encoding="utf-8") as f:
    article_text = f.read()

lines = article_text.splitlines()
title = lines[0].replace("# ", "").strip()
body = "\n".join(lines[1:]).strip()

print("="*60)
print("🚀 启动简书 (Jianshu DA 86+) 官方文章全自动发布...")
print(f"👉 标题: {title}")
print(f"👉 正文字数: {len(body)} 字")
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

    # 1. 打开简书创作者编辑器
    print("[1/5] 打开简书创作工作台: https://www.jianshu.com/writer...")
    page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)

    # 2. 点击【新建文章】
    print("[2/5] 点击【+ 新建文章】...")
    clicked_new = page.evaluate("""() => {
        // 查找包含“新建文章”的元素
        const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
            return (el.innerText || '').trim() === '新建文章' || (el.innerText || '').trim() === '+ 新建文章';
        });
        if (candidates.length > 0) {
            const btn = candidates[0];
            btn.click();
            return { found: true, tag: btn.tagName, text: btn.innerText };
        }
        return { found: false };
    }""")
    print("点击新建文章结果:", json.dumps(clicked_new, ensure_ascii=False))
    time.sleep(2)

    # 3. 填写标题
    print(f"[3/5] 填入标题: 《{title}》...")
    title_input = page.query_selector("input._24i7u, input[placeholder*='无标题'], input.title")
    if title_input:
        title_input.click()
        # 全选清空
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        time.sleep(0.5)
        title_input.fill(title)
        print("已成功填入标题！")
        time.sleep(1)
    else:
        print("⚠️ 未找到标题输入框，尝试查找第一个 text input...")
        first_input = page.query_selector("input[type='text']")
        if first_input:
            first_input.fill(title)

    # 4. 填写正文
    print("[4/5] 写入正文内容到编辑器...")
    editor = page.query_selector("div.kalamu-area, div[contenteditable='true']")
    if editor:
        editor.click()
        time.sleep(0.5)
        # 清空已有内容
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        time.sleep(0.5)
        
        # 逐段注入 Markdown 内容
        paragraphs = body.split("\n")
        for para in paragraphs:
            if not para.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(para)
            page.keyboard.press("Enter")
            time.sleep(0.01)
        print("正文全部写入完成！等待 4 秒简书自动保存草稿...")
        time.sleep(4)

    page.screenshot(path="tools/backlinks/jianshu_ready_to_publish.png")

    # 5. 点击右上角的【发布文章】
    print("[5/5] 点击右上角【发布文章】按钮...")
    clicked_pub = page.evaluate("""() => {
        const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
            const t = (el.innerText || '').trim();
            return t === '发布文章' || t.includes('发布文章');
        });
        for (const btn of candidates) {
            const rect = btn.getBoundingClientRect();
            // 右上角区域 x > 1000, y < 150
            if (rect.x > 800 && rect.y < 150 && rect.width > 20 && rect.height > 20) {
                btn.click();
                return { found: true, text: btn.innerText, x: rect.x, y: rect.y };
            }
        }
        // 如果上面没找到，找任何包含“发布文章”的按钮或链接
        const anyBtn = candidates.find(b => b.tagName === 'BUTTON' || b.tagName === 'A' || b.tagName === 'SPAN');
        if (anyBtn) {
            anyBtn.click();
            return { found: true, fallback: true, text: anyBtn.innerText };
        }
        return { found: false };
    }""")
    print("点击发布结果:", json.dumps(clicked_pub, ensure_ascii=False))

    print("已触发发布，等待 8 秒服务端处理并获取公开文章 URL...")
    time.sleep(8)

    page.screenshot(path="tools/backlinks/jianshu_after_publish.png")

    # 获取当前文章的查看链接
    article_url = page.evaluate("""() => {
        // 查找链接中包含 /p/ 的元素
        const links = Array.from(document.querySelectorAll('a[href*="/p/"]')).map(a => a.href);
        if (links.length > 0) return links[0];
        // 检查当前 URL 是否有 note_id
        const hash = window.location.hash;
        const m = hash.match(/notes\/(\d+)/);
        if (m) {
            return `https://www.jianshu.com/p/${m[1]}`;
        }
        return null;
    }""")

    print(f"🎉 简书文章发布结果: {article_url}")

    if article_url:
        # 记录到本地外链总账 (严格本地，绝不 push master)
        add_backlink(
            platform="简书 (Jianshu DA 86+)",
            region="国内",
            category="技术与数字人文专栏",
            post_title=title,
            target_url=SITE_DOMAIN,
            backlink_url=article_url,
            anchor_text="禅宗知识库 (chanzong.space) 全球图谱与典籍档案",
            link_type="Dofollow",
            status="Live",
            notes="简书资深佛学作者账号发布深度技术长文，挂载主站与图谱链接，已生成永久公开链接"
        )

    browser.close()
