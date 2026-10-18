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

print("API 返回码:", data.get("code"))
items = data.get("data", {}).get("items", [])
print("获取到的动态数量:", len(items))

for it in items[:3]:
    id_str = it.get("id_str")
    modules = it.get("modules", {})
    author = modules.get("module_author", {}).get("name")
    pub_time = modules.get("module_author", {}).get("pub_time_text")
    desc = modules.get("module_dynamic", {}).get("desc", {}).get("text")
    print(f"动态 ID: {id_str}")
    print(f"发布者: {author} | 时间: {pub_time}")
    print(f"内容摘要: {desc[:60] if desc else ''}...")
    print(f"永久直链: https://www.bilibili.com/opus/{id_str}")
    print(f"经典动态链接: https://t.bilibili.com/{id_str}")
    print("-" * 50)
