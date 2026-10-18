# -*- coding: utf-8 -*-
import os, sys, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://space.bilibili.com/520219006/dynamic"
}

url = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=520219006"
resp = requests.get(url, headers=headers, cookies=cookie_dict).json()
items = resp.get("data", {}).get("items", [])

print(f"获取到个人动态数量: {len(items)}")
results = []
for item in items[:6]:
    id_str = item.get("id_str")
    modules = item.get("modules", {})
    dyn_mod = modules.get("module_dynamic") or {}
    desc_obj = dyn_mod.get("desc") or {}
    desc_text = desc_obj.get("text", "") if isinstance(desc_obj, dict) else ""
    pub_time = modules.get("module_author", {}).get("pub_time_text", "")
    opus_url = f"https://www.bilibili.com/opus/{id_str}"
    results.append({
        "id": id_str,
        "url": opus_url,
        "pub_time": pub_time,
        "desc": desc_text[:80].replace("\n", " ")
    })
    print(f"[{id_str}] 发布: {pub_time} | URL: {opus_url}")
    print(f"   摘要: {desc_text[:60]}")

with open(os.path.join(CUR_DIR, "bili_my_dynamics.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
