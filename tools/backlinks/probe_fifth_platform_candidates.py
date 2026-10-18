# -*- coding: utf-8 -*-
"""
探测第五个高权重平台候选者的登录状态与可用性：
1. 百度贴吧 (Baidu Tieba DA 92+)
2. 简书 (Jianshu DA 86+)
3. 小红书 (Xiaohongshu DA 85+)
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
from stealth_browser import create_stealth_context

def probe_candidates():
    results = {}
    
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        
        # 1. 探测百度贴吧
        tb_cookie_file = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")
        if os.path.exists(tb_cookie_file):
            with open(tb_cookie_file, "r", encoding="utf-8") as f:
                tb_raw = json.load(f)
            tb_cookies = tb_raw if isinstance(tb_raw, list) else [{"name": k, "value": v, "domain": ".baidu.com", "path": "/"} for k, v in tb_raw.items()]
            ctx.add_cookies(tb_cookies)
            try:
                print("正在探测百度贴吧登录态...")
                page.goto("https://tieba.baidu.com/index.html", timeout=30000)
                time.sleep(3)
                user_info = page.evaluate("""() => {
                    const u = document.querySelector('.u_username, .user_name, #user_name, .user-name, .u_login');
                    return u ? u.innerText.trim() : null;
                }""")
                page.screenshot(path=os.path.join(CUR_DIR, "candidate_tieba.png"))
                results["baidu_tieba"] = {
                    "available": True,
                    "user": user_info,
                    "url": page.url,
                    "title": page.title()
                }
                print(f"👉 百度贴吧探测结果: {results['baidu_tieba']}")
            except Exception as e:
                results["baidu_tieba"] = {"available": False, "error": str(e)}
                
        # 2. 探测简书
        ctx.clear_cookies()
        js_cookie_file = os.path.join(CUR_DIR, ".browser_profile", "jianshu_cookie.json")
        if os.path.exists(js_cookie_file):
            with open(js_cookie_file, "r", encoding="utf-8") as f:
                js_raw = json.load(f)
            js_cookies = js_raw if isinstance(js_raw, list) else [{"name": k, "value": v, "domain": ".jianshu.com", "path": "/"} for k, v in js_raw.items()]
            ctx.add_cookies(js_cookies)
            try:
                print("正在探测简书登录态...")
                page.goto("https://www.jianshu.com", timeout=30000)
                time.sleep(3)
                is_logged = page.evaluate("""() => {
                    return !!document.querySelector('.user .avatar, .avatar, a[href*="/u/"], .nav-user');
                }""")
                page.screenshot(path=os.path.join(CUR_DIR, "candidate_jianshu.png"))
                results["jianshu"] = {
                    "available": True,
                    "logged_in": is_logged,
                    "url": page.url,
                    "title": page.title()
                }
                print(f"👉 简书探测结果: {results['jianshu']}")
            except Exception as e:
                results["jianshu"] = {"available": False, "error": str(e)}
                
        # 3. 探测小红书
        ctx.clear_cookies()
        xhs_cookie_file = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
        if os.path.exists(xhs_cookie_file):
            with open(xhs_cookie_file, "r", encoding="utf-8") as f:
                xhs_raw = json.load(f)
            xhs_cookies = xhs_raw if isinstance(xhs_raw, list) else [{"name": k, "value": v, "domain": ".xiaohongshu.com", "path": "/"} for k, v in xhs_raw.items()]
            ctx.add_cookies(xhs_cookies)
            try:
                print("正在探测小红书登录态...")
                page.goto("https://www.xiaohongshu.com/explore", timeout=30000)
                time.sleep(3)
                xhs_logged = page.evaluate("""() => {
                    return !!document.querySelector('.user, .avatar-wrapper, a[href*="/user/profile"]');
                }""")
                page.screenshot(path=os.path.join(CUR_DIR, "candidate_xhs.png"))
                results["xiaohongshu"] = {
                    "available": True,
                    "logged_in": xhs_logged,
                    "url": page.url,
                    "title": page.title()
                }
                print(f"👉 小红书探测结果: {results['xiaohongshu']}")
            except Exception as e:
                results["xiaohongshu"] = {"available": False, "error": str(e)}

        ctx.close()
        
    print("\n" + "="*60)
    print("候选平台探测汇总:")
    print(json.dumps(results, ensure_ascii=False, indent=2))
    return results

if __name__ == "__main__":
    probe_candidates()
