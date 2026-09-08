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

raw_cookie_str = """_xsrf=weDYAcCeb2xYUM2qFuOdfczU89WI0mVg; _zap=73c46dd6-b62e-4708-86d0-c7f601d87e48; d_c0=trdZPWOuexyPTsXTbtSm42-D_B0dgpkWFII=|1782116442; __snaker__id=B2joQIy6QLysb7fv; q_c1=e667f0795c454302925a66e8a797ce4d|1785137784000|1785137784000; __zse_ck=005_vR=C4fYe26O=OOwUCSP6RVDok6=NwRP4OVfuydBrqJrZ9QDzpkdyMRNQ6Ucu0INpPgXplaACyxkOULVCv4i38CWHui/gufwMxStWZL/BRAN4hq2B4ISDfecR6vPm9Cxi-IwhJXapdDjoWhrXK2bLZNMJWapjvuvr+mdydvULcmNLlAc/Bz5a9bVsFJhySEmNdjM+/gzdC/4MCH2u1+UX7IsFgarevNcR4kTYJaKBIbl2DfArUsAremt2klQK2yFqY; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1786691662,1787124738,1788830247; HMACCOUNT=5955EDD0375579E9; SESSIONID=5Bq3ycGwjfvK2ejW5eqEcGwvuh2MtS7Dro5WlDwIRvz; JOID=U1oRBk5QCermqzBnBzPquAnQn8geZk2a1dZQJnE-bJqsmVEOVn1sdIisNWAGwAvFDPx2tv7B221q7QC9jXSGgOA=; osd=W1AWCkNYA-3qpjhtAD_nsAPXk8UWbEqW2N5aIX0zZJCrlVwGXHpgeYCmMmwLyAHCAPF-vPnN1mVg6gywhX6BjO0=; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1788830330; BEC=9de1a923fbc880d97a5571e917aeb532; z_c0="2|1:0|10:1788830245|4:z_c0|92:Mi4xbmRidVRnQUFBQUMydDFrOVk2NTdIQ1lBQUFCZ0FsVk5KYkNNYXdEQmI0LXhrLW5PdldVUEdSUnlJOHlyVE41c3d3|b159bbcafd48da271af5a58c0badf9213639611f315416465a9109bfacdcdb30" """

cookies = []
cookie_map = {}
for item in raw_cookie_str.split(";"):
    if "=" in item:
        k, v = item.strip().split("=", 1)
        clean_v = v.strip().strip('"')
        cookie_map[k.strip()] = clean_v
        cookies.append({
            "name": k.strip(),
            "value": clean_v,
            "domain": ".zhihu.com",
            "path": "/"
        })

# 更新持久化 json
save_path = "tools/backlinks/.browser_profile/zhihu_cookie.json"
with open(save_path, "w", encoding="utf-8") as f:
    json.dump(cookie_map, f, indent=2, ensure_ascii=False)
    
print(f"已构建全量 {len(cookies)} 个 Cookie 指纹，已更新 {save_path}")

def test_question_access():
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
        
        # 1. 先访问知乎首页，建立合法 Referer 与 Session
        print("访问知乎首页...")
        page.goto("https://www.zhihu.com", wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
        
        # 2. 访问目标问题页面
        q_url = "https://www.zhihu.com/question/2036422757978723800"
        print(f"进入目标问题: {q_url}...")
        page.goto(q_url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(3)
        
        page.screenshot(path="tools/backlinks/zhihu_test_bypass.png")
        print("当前页面标题:", page.title())
        
        write_btn = page.query_selector("button:has-text('写回答'), a:has-text('写回答')")
        if write_btn:
            print("🎉 成功绕过风控！【写回答】按钮已找到！按钮文字:", write_btn.inner_text())
        else:
            print("未能找到写回答按钮，请查看截图 tools/backlinks/zhihu_test_bypass.png")
            
        browser.close()

if __name__ == "__main__":
    test_question_access()
