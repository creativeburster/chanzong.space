# -*- coding: utf-8 -*-
import os, sys, json, requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = {c["name"]: c["value"] for c in json.load(f)}

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
r = requests.get("https://book.douban.com/people/132002368/reviews", cookies=cookies, headers=headers).text
soup = BeautifulSoup(r, "html.parser")

for a in soup.find_all("a"):
    href = a.get("href", "")
    if "/review/" in href:
        t = a.text.strip()
        if len(t) > 3 and "展开" not in t:
            print(f"[{href}] {t}")
