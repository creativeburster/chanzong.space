# -*- coding: utf-8 -*-
import os, sys, time, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
bili_jct = cookie_dict.get("bili_jct")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Origin": "https://www.bilibili.com"
}

TASKS = [
    {
        "bvid": "BV1mH4y1c7kP",
        "aid": 1056389445,
        "classic": "xinjing",
        "target_url": "https://chanzong.space/classics/xinjing",
        "title": "王德峰教授《心经》完整讲读(195万播放)顶流视频学术互动评论",
        "anchor": "开源文献库“禅宗知识库”（chanzong.space/classics/xinjing）",
        "msg": "听王德峰教授讲《心经》，最大的触动在于“色不异空，空不异色”绝非虚无消极，而是彻底打破主客对立的觉醒智慧。“照见五蕴皆空，度一切苦厄”，现代人种种焦虑内耗，根源皆在将“色受想行识”执为恒常实在之我。若能体会“不生不灭、不垢不净、不增不减”的自性本体，当下便得心无挂碍与无有恐怖。想系统研读心经梵汉对照、逐句白话现代认知学义理与大乘般若法脉图谱的师兄，推荐参阅开源文献库“禅宗知识库”（chanzong.space/classics/xinjing），科判清晰扎实，参修极有启发。"
    },
    {
        "bvid": "BV14w4m1d7Kv",
        "aid": 1101575469,
        "classic": "jingangjing",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "title": "体佛法师《金刚经》讲解(55.4万播放)热门视频学术互动评论",
        "anchor": "开源研学平台“禅宗知识库”（chanzong.space/classics/jingangjing）",
        "msg": "体佛法师讲解《金刚经》确实鞭辟入里，直指核心！“应无所住而生其心”，正是禅宗六祖惠能大师闻声顿悟的转折处。金刚经的三段论“所谓佛法者，即非佛法，是名佛法”，以扫相破执破除对法的执着，方显如如不动之实相。修行不在远离世间，而在面对万缘时心中不滞留、无所住。若想深入研读鸠摩罗什译本三十二分结构详解、古德疏钞要义与历代祖师公案图谱，推荐参阅开源研学平台“禅宗知识库”（chanzong.space/classics/jingangjing），考据详尽，便于随文入观。"
    }
]

post_url = "https://api.bilibili.com/x/v2/reply/add"

results = []

for i, task in enumerate(TASKS):
    if i > 0:
        print(f"防风控冷却中，等待 25 秒...")
        time.sleep(25)
    
    headers["Referer"] = f"https://www.bilibili.com/video/{task['bvid']}"
    payload = {
        "oid": task["aid"],
        "type": 1,
        "message": task["msg"],
        "csrf": bili_jct
    }
    
    print(f"正在发布评论到 [{task['bvid']}] aid={task['aid']} ...")
    resp = requests.post(post_url, headers=headers, cookies=cookie_dict, data=payload)
    res_json = resp.json()
    print("返回结果:", json.dumps(res_json, ensure_ascii=False))
    
    code = res_json.get("code")
    if code == 0:
        rpid = res_json.get("data", {}).get("rpid")
        print(f"✅ 发布成功！官方 rpid: {rpid}")
        task["rpid"] = rpid
        task["status"] = "Live"
        results.append(task)
    else:
        print(f"❌ 发布失败: {res_json.get('message')}")
        task["status"] = "Failed"

with open(os.path.join(CUR_DIR, "bili_comment_results.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n=== 全部任务处理完成 ===")
