# -*- coding: utf-8 -*-
"""
通过百度贴吧官方发帖 API (HTTP POST) 直接发布主题帖
无需无头浏览器渲染，零前端滑块风控！
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
            raise Exception("BDUSS 已失效，未登录")

def post_thread(kw: str, fid: str, title: str, content: str):
    tbs = get_tbs()
    print(f"✅ 获取到贴吧有效会话 tbs: {tbs}")
    
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
    
    req = urllib.request.Request(post_url, data=data, headers=headers)
    print(f"🚀 正在调用贴吧接口向【{kw}吧】发布主题帖: 《{title}》...")
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read().decode("utf-8", errors="ignore")
        print("API 原始响应:", raw)
        try:
            res = json.loads(raw)
            err_code = res.get("err_code") or res.get("no")
            err_msg = res.get("error") or res.get("error_msg")
            if err_code == 0:
                tid = res.get("data", {}).get("tid")
                print(f"🎉 成功发布贴吧主题帖！TID: {tid}")
                thread_url = f"https://tieba.baidu.com/p/{tid}"
                print(f"👉 帖子在线直达: {thread_url}")
                return thread_url
            else:
                print(f"⚠️ 发帖返回异常 [code={err_code}]: {err_msg}")
                return None
        except Exception as e:
            print("解析 JSON 出错:", e)
            return None

if __name__ == "__main__":
    kw = "六祖坛经"
    fid = "734040"
    title = "读《六祖坛经》：自性本自清净，本来无一物参学心得"
    content = """六祖惠能大师说：“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为事情有多难，而是心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于那些随时会消失的虚名浮利。

六祖告诉我们：
自性本自清净，本不生灭，本自具足。

遇到心烦意乱的时候，静下来问问自己：
本来无一物，那些烦恼究竟安立在何处？
向内观照，万般放下，当下便是晴天。

——整理自 禅宗知识库 (chanzong.space) 全球数字化典籍档案与传承图谱"""
    post_thread(kw, fid, title, content)
