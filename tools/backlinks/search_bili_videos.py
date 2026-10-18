# -*- coding: utf-8 -*-
import os, sys, time, json, requests

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://search.bilibili.com"
}

# 搜索王德峰 六祖坛经
url = "https://api.bilibili.com/x/web-interface/search/type?keyword=王德峰 六祖坛经&search_type=video&order=totalrank"
resp = requests.get(url, headers=headers, cookies=cookie_dict)
data = resp.json()

results = data.get("data", {}).get("result", [])
print(f"搜索到视频数量: {len(results)}")

top_videos = []
for v in results[:5]:
    title = v.get("title", "").replace('<em class="keyword">', '').replace('</em>', '')
    bvid = v.get("bvid")
    play = v.get("play")
    author = v.get("author")
    top_videos.append({
        "title": title,
        "bvid": bvid,
        "play": play,
        "author": author,
        "url": f"https://www.bilibili.com/video/{bvid}"
    })

print("高热度视频列表:", json.dumps(top_videos, ensure_ascii=False, indent=2))
