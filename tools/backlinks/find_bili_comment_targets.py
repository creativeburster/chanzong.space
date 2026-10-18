# -*- coding: utf-8 -*-
import os, sys, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import urllib.parse

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://search.bilibili.com"
}

def find_target(kw):
    encoded_kw = urllib.parse.quote(kw)
    search_url = f"https://api.bilibili.com/x/web-interface/search/type?keyword={encoded_kw}&search_type=video&order=click"
    r = requests.get(search_url, headers=headers, cookies=cookie_dict).json()
    items = r.get("data", {}).get("result", [])
    if not items:
        return None
    top = items[0]
    bvid = top.get("bvid")
    title = top.get("title", "").replace('<em class="keyword">', '').replace('</em>', '')
    play = top.get("play")
    author = top.get("author")
    
    # 获取视频 aid
    view_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
    v_data = requests.get(view_url, headers=headers, cookies=cookie_dict).json().get("data", {})
    aid = v_data.get("aid")
    
    # 获取该视频下的高赞评论（用于二级回复）
    reply_url = f"https://api.bilibili.com/x/v2/reply?oid={aid}&type=1&sort=1"
    rep_data = requests.get(reply_url, headers=headers, cookies=cookie_dict).json().get("data", {})
    replies = rep_data.get("replies", []) or []
    
    top_replies = []
    for rep in replies[:3]:
        top_replies.append({
            "rpid": rep.get("rpid"),
            "mid": rep.get("mid"),
            "uname": rep.get("member", {}).get("uname"),
            "message": rep.get("content", {}).get("message")[:60]
        })
        
    return {
        "kw": kw,
        "title": title,
        "bvid": bvid,
        "aid": aid,
        "play": play,
        "author": author,
        "top_replies": top_replies
    }

keywords = ["大乘起信论 讲解", "黄檗传心法要 讲解", "信心铭 讲解"]
all_targets = {}
for kw in keywords:
    tgt = find_target(kw)
    all_targets[kw] = tgt
    print(f"[{kw}] 视频: {tgt['title']} (BV: {tgt['bvid']}, aid: {tgt['aid']}, 播放: {tgt['play']})")
    print(f"  高赞评论数量: {len(tgt['top_replies'])}")
    for tr in tgt['top_replies']:
        print(f"    - rpid: {tr['rpid']} ({tr['uname']}): {tr['message']}")

with open(os.path.join(CUR_DIR, "bili_comment_targets.json"), "w", encoding="utf-8") as f:
    json.dump(all_targets, f, ensure_ascii=False, indent=2)

print("\n目标数据已固化至 bili_comment_targets.json！")
