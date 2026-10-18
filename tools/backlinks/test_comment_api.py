# -*- coding: utf-8 -*-
import urllib.request
import json
import os

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
c_str = "; ".join([f"{k}={v.strip('\"')}" for k, v in cookie_dict.items()])

# 测试 mid: 5340727993172310 (对应 Rh5wjdjgi)
mid = "5340727993172310"
comment_url = "https://weibo.com/ajax/comments/create"

payload = json.dumps({
    "id": mid,
    "comment": "三心不可得，正是直破凡夫的时间执念。我们在做《禅宗知识库》(chanzong.space)文献拓扑时也深有同感！",
    "pic_id": ""
}).encode("utf-8")

req = urllib.request.Request(
    comment_url,
    data=payload,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Cookie": c_str,
        "Content-Type": "application/json;charset=UTF-8",
        "Referer": "https://weibo.com/2156211775/Rh5wjdjgi",
        "X-Requested-With": "XMLHttpRequest"
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Response Code:", resp.getcode())
        print("Response:", resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    try:
        print("Details:", e.read().decode("utf-8"))
    except Exception:
        pass
except Exception as e:
    print("Error:", e)
