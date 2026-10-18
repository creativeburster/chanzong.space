# -*- coding: utf-8 -*-
import os, sys, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
}

opus_ids = [
    ("1245868844651642883", "大乘起信论"),
    ("1245869067999379456", "传心法要"),
    ("1245869282739355655", "信心铭")
]

for oid, title in opus_ids:
    url = f"https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id={oid}"
    r = requests.get(url, headers=headers).json()
    item = r.get("data", {}).get("item", {})
    text = item.get("modules", {}).get("module_dynamic", {}).get("desc", {}).get("text", "")
    print(f"\n[{title}] Opus: https://www.bilibili.com/opus/{oid}")
    print(f"内容预览: {text[:100]}...")
