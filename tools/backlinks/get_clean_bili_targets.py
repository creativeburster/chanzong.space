# -*- coding: utf-8 -*-
import os, sys, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://search.bilibili.com"
}

def get_detail(bvid):
    url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
    resp = requests.get(url, headers=headers, cookies=cookie_dict).json()
    data = resp.get("data", {})
    return {
        "bvid": bvid,
        "aid": data.get("aid"),
        "title": data.get("title"),
        "owner": data.get("owner", {}).get("name"),
        "view": data.get("stat", {}).get("view"),
        "danmaku": data.get("stat", {}).get("danmaku"),
        "reply": data.get("stat", {}).get("reply"),
        "desc": data.get("desc")[:100] if data.get("desc") else ""
    }

# 候选 1: BV1gqdUYMERu (62.6万播放)
# 候选 2: BV14w4m1d7Kv (55.4万播放)
# 候选 3: BV1V1f7BQETu (18.3万播放)
# 候选 4: BV1Zee4zCE6V (23.2万播放)

for bvid in ["BV1gqdUYMERu", "BV14w4m1d7Kv", "BV1Zee4zCE6V", "BV1V1f7BQETu"]:
    info = get_detail(bvid)
    print(f"[{info['bvid']}] aid={info['aid']} | 播放={info['view']} | 评论={info['reply']} | 作者: {info['owner']} | 标题: {info['title']}")
