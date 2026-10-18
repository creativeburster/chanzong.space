# -*- coding: utf-8 -*-
"""
百度贴吧 (Baidu Tieba DA 92+) 全自动高权重外链批量发布引擎
通过官方底座 API 直接提交主题帖，极速秒发，避免无头滑块阻碍。
"""
import os
import sys
import json
import time
import urllib.request
import urllib.parse

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "baidu_cookie.json")
sys.path.append(CUR_DIR)
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cd = json.load(f)

bduss = cd.get("BDUSS")

def get_tbs():
    url = "http://tieba.baidu.com/dc/common/tbs"
    req = urllib.request.Request(url, headers={
        "Cookie": f"BDUSS={bduss}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        if data.get("is_login") == 1:
            return data.get("tbs")
        else:
            raise Exception("BDUSS 已失效")

def post_tieba_topic(kw: str, fid: str, title: str, content: str, classic_id: str):
    tbs = get_tbs()
    post_url = "http://tieba.baidu.com/f/commit/thread/add"
    payload = {
        "ie": "utf-8",
        "kw": kw,
        "fid": fid,
        "tbs": tbs,
        "title": title,
        "content": content,
        "rich_text": "1",
        "__type__": "thread"
    }
    data = urllib.parse.urlencode(payload).encode("utf-8")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Cookie": f"BDUSS={bduss}; BDUSS_BFESS={bduss}",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": f"http://tieba.baidu.com/f?kw={urllib.parse.quote(kw)}",
        "Origin": "http://tieba.baidu.com"
    }
    
    print(f"\n[百度贴吧] 正在向【{kw}吧】发布: 《{title}》...")
    req = urllib.request.Request(post_url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")
            res = json.loads(raw)
            err_code = res.get("err_code") or res.get("no")
            if err_code == 0:
                tid = res.get("data", {}).get("tid")
                post_url_live = f"https://tieba.baidu.com/p/{tid}"
                target_url = f"{SITE_DOMAIN}/books/{classic_id}"
                print(f"🎉 成功发布贴吧主题帖！\n👉 帖子链接: {post_url_live}\n👉 目标落地页: {target_url}")
                
                # 记录到本地外链总账 (严格本地，不 push master)
                add_backlink(
                    platform="百度贴吧 (Baidu Tieba DA 92+)",
                    region="国内",
                    category="高权重中文讨论社区",
                    post_title=f"【{kw}吧】{title}",
                    target_url=target_url,
                    backlink_url=post_url_live,
                    anchor_text=f"禅宗知识库 · 《{title[:10]}》文献档案与图谱",
                    link_type="Brand Mention / Contextual",
                    status="Live",
                    notes=f"百度贴吧官方 API 提交，发布至【{kw}吧】，带品牌出处与落地页"
                )
                return post_url_live
            else:
                err_msg = res.get("error") or res.get("error_msg")
                print(f"⚠️ 发帖失败 [code={err_code}]: {err_msg}")
                return None
    except Exception as e:
        print(f"⚠️ 请求异常: {e}")
        return None

TIEBA_POSTS = [
    {
        "kw": "金刚经吧",
        "fid": "2109824",
        "classic_id": "jingangjing",
        "title": "研读《金刚经》：凡所有相皆是虚妄，如何应用于当下生活",
        "content": """《金刚经》云：“凡所有相，皆是虚妄。若见诸相非相，则见如来。”

在喧嚣快节奏的现代生活中，我们每天被无数的念头、比较、焦虑和得失牵着走。
很多人读《金刚经》，以为“破相”是要否定一切世间生活，其实不然。

真正的“破相”，不是消极避世，而是破除内心的执着与妄见：
1. 事情来时，全身心应对，尽心尽力；
2. 事情过去，不挂碍留恋，心无挂碍。
正所谓“应无所住而生其心”。

遇到困境与得失时，默念一句“诸相非相”，向内观照那颗从未动摇的本心，当下便得自在。

——整理自 禅宗知识库 (chanzong.space) 全球数字化典籍档案与传承图谱"""
    },
    {
        "kw": "禅宗修行",
        "fid": "1966755",
        "classic_id": "damoxuemai",
        "title": "达摩西来大意与自性本净：何为直指人心见性成佛",
        "content": """菩提达摩大师在《血脉论》中开示：
“若欲见佛，须是见性，性即是佛。若不见性，念佛诵经持戒，亦无是处。”

禅宗修行之所以被称为“顿教”，在于它不立文字，直指本心。
后世学人往往在经卷浩瀚的名相概念中打转，求玄求妙，却忽略了眼前这个会听、会看、会知会觉的本来面目。

马祖道一说“平常心是道”，饥来吃饭，困来即眠。
一切修行，最终不过是认得自家的无尽宝藏，不再向外驰求。

——整理自 禅宗知识库 (chanzong.space) 全球数字化典籍档案与传承图谱"""
    }
]

def run_all():
    print("="*60)
    print("🚀 正在批量向百度贴吧发布高权重经典文献帖...")
    print("="*60)
    for p in TIEBA_POSTS:
        post_tieba_topic(p["kw"], p["fid"], p["title"], p["content"], p["classic_id"])
        time.sleep(3)

if __name__ == "__main__":
    run_all()
