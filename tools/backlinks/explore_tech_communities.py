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

PLATFORMS = [
    {
        "name": "开源中国 (OSChina)",
        "id": "oschina",
        "home": "https://www.oschina.net",
        "login": "https://www.oschina.net/home/login",
        "write": "https://my.oschina.net/u/post/write"
    },
    {
        "name": "博客园 (CNBlogs)",
        "id": "cnblogs",
        "home": "https://www.cnblogs.com",
        "login": "https://account.cnblogs.com/signin",
        "write": "https://i.cnblogs.com/posts/edit"
    },
    {
        "name": "掘金 (Juejin)",
        "id": "juejin",
        "home": "https://juejin.cn",
        "login": "https://juejin.cn/login",
        "write": "https://juejin.cn/editor/drafts/new"
    },
    {
        "name": "CSDN",
        "id": "csdn",
        "home": "https://www.csdn.net",
        "login": "https://passport.csdn.net/login",
        "write": "https://editor.csdn.net/md/"
    }
]

def explore_all():
    results = {}
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        for p_info in PLATFORMS:
            p_id = p_info["id"]
            p_name = p_info["name"]
            print(f"\n================ 探测平台: {p_name} ================")
            
            # 1. 打开登录页
            try:
                page.goto(p_info["login"], timeout=25000, wait_until="domcontentloaded")
                time.sleep(3)
                login_screen = os.path.join(ARTIFACT_DIR, f"probe_{p_id}_login.png")
                page.screenshot(path=login_screen)
                print(f"登录页已截图: {login_screen}")
                
                # 检查支持的第三方登录方式
                third_parties = page.evaluate("""() => {
                    const text = document.body.innerText;
                    const res = [];
                    if (text.includes('微信') || document.querySelector('[class*="wechat"], [class*="wx"]')) res.push('微信扫码');
                    if (text.includes('GitHub') || document.querySelector('[class*="github"], a[href*="github"]')) res.push('GitHub授权');
                    if (text.includes('QQ') || document.querySelector('[class*="qq"]')) res.push('QQ');
                    if (text.includes('手机') || document.querySelector('input[type="tel"], [placeholder*="手机"]')) res.push('手机短信');
                    if (text.includes('密码') || document.querySelector('input[type="password"]')) res.push('账号密码');
                    return res;
                }""")
                
                # 检查登录页是否有直接可见的二维码
                has_qr = page.evaluate("""() => {
                    const imgs = Array.from(document.querySelectorAll('img, canvas')).filter(el => {
                        const r = el.getBoundingClientRect();
                        return r.width >= 100 && r.height >= 100 && (el.src || '').includes('qr') || (el.className || '').includes('qr');
                    });
                    return imgs.length > 0;
                }""")
                
                results[p_id] = {
                    "name": p_name,
                    "url": page.url,
                    "title": page.title(),
                    "third_parties": third_parties,
                    "has_direct_qr": has_qr,
                    "login_screenshot": f"probe_{p_id}_login.png"
                }
                print(f"探测结果: {results[p_id]}")
            except Exception as e:
                print(f"探测 {p_name} 出错: {e}")
                results[p_id] = {"name": p_name, "error": str(e)}
                
        ctx.close()
        
    res_path = os.path.join(CUR_DIR, "tech_platforms_probe_result.json")
    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n全部探测完成！结果已存至: {res_path}")

if __name__ == "__main__":
    explore_all()
