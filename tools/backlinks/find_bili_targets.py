# -*- coding: utf-8 -*-
import os, sys, json, requests

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://search.bilibili.com"
}

def search_kw(kw):
    url = f"https://api.bilibili.com/x/web-interface/search/type?keyword={kw}&search_type=video&order=click"
    resp = requests.get(url, headers=headers, cookies=cookie_dict).json()
    items = resp.get("data", {}).get("result", [])
    candidates = []
    for item in items[:6]:
        title = item.get("title", "").replace('<em class="keyword">', '').replace('</em>', '')
        bvid = item.get("bvid")
        play = item.get("play")
        author = item.get("author")
        candidates.append({
            "title": title,
            "bvid": bvid,
            "play": play,
            "author": author,
            "url": f"https://www.bilibili.com/video/{bvid}"
        })
    return candidates

print("=== 金刚经热门视频 ===")
jg_list = search_kw("金刚经 讲解")
print(json.dumps(jg_list, ensure_ascii=False, indent=2))

print("\n=== 心经热门视频 ===")
xj_list = search_kw("心经 讲解")
print(json.dumps(xj_list, ensure_ascii=False, indent=2))
