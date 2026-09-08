# -*- coding: utf-8 -*-
import os
import sys
import json
import urllib.request
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")
COOKIE_FILE = os.path.join(PROFILE_DIR, "zhihu_cookie.txt")
COOKIE_JSON = os.path.join(PROFILE_DIR, "zhihu_cookie.json")

def save_and_verify(cookie_raw: str):
    os.makedirs(PROFILE_DIR, exist_ok=True)
    with open(COOKIE_FILE, "w", encoding="utf-8") as f:
        f.write(cookie_raw.strip())
        
    cookies = {}
    for item in cookie_raw.split(';'):
        if '=' in item:
            k, v = item.strip().split('=', 1)
            cookies[k.strip()] = v.strip()
            
    with open(COOKIE_JSON, "w", encoding="utf-8") as f:
        json.dump(cookies, f, indent=2)
        
    print(f"[Cookie] 已成功解析出 {len(cookies)} 个 Cookie 键值对！")
    
    # 验证知乎身份
    req = urllib.request.Request(
        "https://www.zhihu.com/api/v4/me",
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Cookie": cookie_raw.strip()
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            name = data.get("name", "")
            uid = data.get("id", "")
            headline = data.get("headline", "")
            print(f"🎉 知乎登录验证成功！当前登录账号: {name} (ID: {uid})")
            if headline:
                print(f"   一句话介绍: {headline}")
            return True, data
    except Exception as e:
        print("⚠️ 知乎 API 验证返回:", e)
        if hasattr(e, 'read'):
            try:
                print("   详情:", e.read().decode("utf-8", errors="ignore")[:300])
            except Exception:
                pass
        return False, None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        save_and_verify(sys.argv[1])
    else:
        if os.path.exists(COOKIE_FILE):
            with open(COOKIE_FILE, "r", encoding="utf-8") as f:
                save_and_verify(f.read())
