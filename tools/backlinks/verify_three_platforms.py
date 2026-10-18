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

ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"

def check_all_three():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        # 1. 验证 CSDN
        print("\n--- [1/3] 验证 CSDN 创作者中心 ---")
        try:
            with open("tools/backlinks/.browser_profile/csdn_cookie.json", "r", encoding="utf-8") as f:
                csdn_c = json.load(f)
            ctx.add_cookies(csdn_c)
            page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=30000, wait_until="domcontentloaded")
            time.sleep(4)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "verify_csdn_editor.png"))
            print(f"CSDN 页面 URL: {page.url}")
            print(f"CSDN 页面 Title: {page.title()}")
            csdn_ok = "login" not in page.url and ("editor" in page.url or "mp.csdn.net" in page.url)
            print(f"CSDN 登录验证结果: {'成功 ✅' if csdn_ok else '未通过 ❌'}")
        except Exception as e:
            print("CSDN 验证异常:", e)
            
        # 2. 验证 博客园 CNBlogs
        print("\n--- [2/3] 验证 博客园 CNBlogs 后台 ---")
        try:
            with open("tools/backlinks/.browser_profile/cnblogs_cookie.json", "r", encoding="utf-8") as f:
                cnb_c = json.load(f)
            ctx.add_cookies(cnb_c)
            page.goto("https://i.cnblogs.com/posts/edit", timeout=30000, wait_until="domcontentloaded")
            time.sleep(4)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "verify_cnblogs_editor.png"))
            print(f"博客园 页面 URL: {page.url}")
            print(f"博客园 页面 Title: {page.title()}")
            cnb_ok = "signin" not in page.url and ("posts" in page.url or "i.cnblogs.com" in page.url)
            print(f"博客园 登录验证结果: {'成功 ✅' if cnb_ok else '未通过 ❌'}")
        except Exception as e:
            print("博客园 验证异常:", e)
            
        # 3. 验证 掘金 Juejin
        print("\n--- [3/3] 验证 掘金 Juejin 编辑器 ---")
        try:
            with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
                jj_c = json.load(f)
            ctx.add_cookies(jj_c)
            page.goto("https://juejin.cn/editor/drafts/new", timeout=30000, wait_until="domcontentloaded")
            time.sleep(4)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "verify_juejin_editor.png"))
            print(f"掘金 页面 URL: {page.url}")
            print(f"掘金 页面 Title: {page.title()}")
            jj_ok = "login" not in page.url and ("editor" in page.url or "juejin.cn" in page.url)
            print(f"掘金 登录验证结果: {'成功 ✅' if jj_ok else '未通过 ❌'}")
        except Exception as e:
            print("掘金 验证异常:", e)
            
        ctx.close()

if __name__ == "__main__":
    check_all_three()
