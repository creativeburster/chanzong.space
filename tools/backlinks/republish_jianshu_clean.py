# -*- coding: utf-8 -*-
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

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    tok = json.load(f).get("remember_user_token")

cookies = [
    {"name": "remember_user_token", "value": tok, "domain": ".jianshu.com", "path": "/"}
]

with open(ARTICLE_PATH, "r", encoding="utf-8") as f:
    article_text = f.read()

lines = article_text.splitlines()
title = lines[0].replace("# ", "").strip()
body = "\n".join(lines[1:]).strip()

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("正在打开简书工作台重新编辑刚才的文章...")
    page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)

    # 找到刚刚发布的文章并点击进入编辑
    page.evaluate("""() => {
        const item = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('开源数字人文'));
        if (item) item.click();
    }""")
    time.sleep(2)

    # 清空编辑器并重新注入 2 链接以内的规范正文
    editor = page.query_selector("div.kalamu-area, div[contenteditable='true']")
    if editor:
        editor.click()
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        time.sleep(0.5)

        for p_line in body.split("\n"):
            if not p_line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(p_line)
            page.keyboard.press("Enter")
            time.sleep(0.01)
        print("已成功替换为合规正文！等待 4 秒自动保存...")
        time.sleep(4)

    # 点击发布文章更新
    click_res = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('*')).filter(e => {
            const t = (e.innerText || '').trim();
            return t === '发布文章' || t === '重新发布' || t === '发布更新' || t.includes('发布更新') || t.includes('发布文章');
        });
        for (const b of btns) {
            const r = b.getBoundingClientRect();
            if (r.x > 800 && r.y < 150 && r.width > 20) {
                b.click();
                return { clicked: true, text: b.innerText, x: r.x, y: r.y };
            }
        }
        return { clicked: false };
    }""")
    print("重新发布点击结果:", json.dumps(click_res, ensure_ascii=False))
    time.sleep(6)

    page.screenshot(path="tools/backlinks/jianshu_clean_published.png")
    print("重新发布截图已保存！")

    # 检查文章链接
    post_info = page.evaluate("""() => {
        const item = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('开源数字人文'));
        // 查找可能存在的公开链接或者右上角状态
        const links = Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }));
        return { links: links.filter(l => l.href.includes('/p/')) };
    }""")
    print("文章信息:", json.dumps(post_info, ensure_ascii=False))

    browser.close()
