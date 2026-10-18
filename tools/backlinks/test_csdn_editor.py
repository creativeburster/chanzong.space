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
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "csdn_cookie.json")
ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"

def test_csdn():
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问 CSDN 创作者中心编辑器: https://mp.csdn.net/mp_blog/creation/editor ...")
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=35000, wait_until="domcontentloaded")
        time.sleep(4)
        
        screen_path = os.path.join(ARTIFACT_DIR, "csdn_editor_probe.png")
        page.screenshot(path=screen_path)
        print(f"编辑器页面截图已保存: {screen_path}")
        print("当前页面 URL:", page.url)
        print("当前页面 Title:", page.title())
        
        # 检查是否登录成功
        is_logged_in = "login" not in page.url and ("editor" in page.url or "mp.csdn.net" in page.url)
        print("CSDN 是否已登录成功:", is_logged_in)
        
        # 探测编辑器结构 (Markdown 或 富文本)
        editor_info = page.evaluate("""() => {
            const titleInp = document.querySelector('input.article-bar__title, input[placeholder*="文章标题"], #txtTitle');
            const editorEl = document.querySelector('.cledit-section, .editor__inner, .markdown-body, textarea, [contenteditable="true"]');
            const pubBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('发布文章') || (b.innerText || '').includes('发布'));
            return {
                hasTitleInput: !!titleInp,
                hasEditor: !!editorEl,
                hasPubBtn: !!pubBtn,
                pubBtnText: pubBtn ? pubBtn.innerText.trim() : null
            };
        }""")
        print("编辑器探测结构:", json.dumps(editor_info, ensure_ascii=False, indent=2))
        
        ctx.close()

if __name__ == "__main__":
    test_csdn()
