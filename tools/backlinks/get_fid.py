# -*- coding: utf-8 -*-
import os
import sys
import json
import urllib.request
import urllib.parse
import re

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)

bduss = cd.get("BDUSS")

def get_forum_fid(kw):
    url = f"https://tieba.baidu.com/f?kw={urllib.parse.quote(kw)}&fr=index"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        "Cookie": f"BDUSS={bduss}; BDUSS_BFESS={bduss}",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            m = re.search(r'["\']forum_id["\']\s*:\s*(\d+)', html)
            if not m:
                m = re.search(r'["\']fid["\']\s*:\s*["\']?(\d+)', html)
            if not m:
                m = re.search(r'PageData\.forum\s*=\s*{[^}]*["\']id["\']\s*:\s*(\d+)', html)
            if m:
                return m.group(1)
            return None
    except Exception as e:
        print(f"Error fetching fid for {kw}:", e)
        return None

if __name__ == "__main__":
    for name in ["六祖坛经", "金刚经", "禅宗"]:
        fid = get_forum_fid(name)
        print(f"贴吧: 【{name}吧】 -> FID: {fid}")
