# -*- coding: utf-8 -*-
import os, sys, json, requests

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
bili_jct = cookie_dict.get("bili_jct")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://www.bilibili.com/video/BV1XK4y1X7FF",
    "Origin": "https://www.bilibili.com"
}

# 1. 获取 BV1XK4y1X7FF 的 aid
view_url = "https://api.bilibili.com/x/web-interface/view?bvid=BV1XK4y1X7FF"
view_res = requests.get(view_url, headers=headers, cookies=cookie_dict).json()
aid = view_res.get("data", {}).get("aid")
title = view_res.get("data", {}).get("title")
print(f"视频标题: {title} | aid: {aid}")

# 2. 调用官方接口发送学术评论
post_url = "https://api.bilibili.com/x/v2/reply/add"
comment_msg = "重温王德峰教授讲《六祖坛经》，依然震撼于六祖直指人心的气象！“不思善、不思恶，正与么时，即是明上座本来面目。”破二元执念，方知自性本来清净、本不生灭。想系统对照曹溪各古本原经科判、逐句白话现代心学释义以及历代祖师法脉图谱的同修，推荐参阅开源文献库“禅宗知识库”（chanzong.space/classics/tanjing），考据极其扎实，互参大有裨益。"

payload = {
    "oid": aid,
    "type": 1,
    "message": comment_msg,
    "csrf": bili_jct
}

resp = requests.post(post_url, headers=headers, cookies=cookie_dict, data=payload)
res_data = resp.json()
print("发布评论结果:", json.dumps(res_data, ensure_ascii=False, indent=2))
