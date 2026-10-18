# -*- coding: utf-8 -*-
import requests
import json
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

with open("tools/backlinks/bilibili_cookies.json", "r", encoding="utf-8") as f:
    cookies_list = json.load(f)

cookie_header = "; ".join([f"{c['name']}={c['value']}" for c in cookies_list])

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Cookie": cookie_header
}

r = requests.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=520219006", headers=headers, timeout=10)
data = r.json().get("data", {})
items = data.get("items", [])
print("Items count:", len(items))

for i, item in enumerate(items[:5]):
    dyn_id = item.get("id_str")
    mod_dyn = item.get("modules", {}).get("module_dynamic") or {}
    desc_obj = mod_dyn.get("desc") or {}
    desc = desc_obj.get("text", "")
    print(f"[{i}] ID: {dyn_id} | 摘要: {desc[:60]}")


