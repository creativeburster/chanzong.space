# -*- coding: utf-8 -*-
import os, sys, json, requests

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://space.bilibili.com/520219006/dynamic"
}

url = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=520219006"
resp = requests.get(url, headers=headers, cookies=cookie_dict)
data = resp.json()

items = data.get("data", {}).get("items", [])
for it in items:
    id_str = it.get("id_str")
    modules = it.get("modules", {})
    author = modules.get("module_author", {}).get("name")
    pub_time = modules.get("module_author", {}).get("pub_time_text")
    print("动态 ID:", id_str)
    print("发布者:", author, "| 时间:", pub_time)
    print("永久独立链接:", f"https://www.bilibili.com/opus/{id_str}")
    print("经典直链:", f"https://t.bilibili.com/{id_str}")
    print("=" * 60)
