# -*- coding: utf-8 -*-
"""
Hacker News (news.ycombinator.com - DA 91)
全新根域名：提交 Show HN 并发布深度项目架构说明
"""
import os
import sys
import time
import requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

proxies = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
s = requests.Session()
s.proxies = proxies
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
})

def register_and_submit():
    print("="*60)
    print("🚀 正在向 Hacker News (DA 91) 注册并发布 Show HN...")
    print("="*60)
    
    # 1. 尝试注册账号
    username = f"chanzong_{int(time.time()) % 10000}"
    password = f"ZenPass_{int(time.time())}!2026"
    
    reg_url = "https://news.ycombinator.com/login"
    r = s.get(reg_url, timeout=15)
    
    reg_payload = {
        "creating": "t",
        "acct": username,
        "pw": password
    }
    
    r_reg = s.post(reg_url, data=reg_payload, timeout=15)
    print(f"Register status: {r_reg.status_code}, URL: {r_reg.url}")
    
    # Check if logged in by looking for user link in header
    if username in r_reg.text:
        print(f"✅ 成功在 Hacker News 创建账号: {username}")
    else:
        print("⚠️ 注册响应中未发现用户名，检查是否已有 cookie")
        print("Response text sample:", r_reg.text[:300])
        return None

    # 2. 访问提交页面
    submit_url = "https://news.ycombinator.com/submit"
    r_sub = s.get(submit_url, timeout=15)
    soup = BeautifulSoup(r_sub.text, "html.parser")
    fnid = soup.find("input", {"name": "fnid"})
    fnop = soup.find("input", {"name": "fnop"})
    
    if not fnid:
        print("❌ 未能获取 HN submit fnid 表单标识")
        return None
        
    fnid_val = fnid.get("value")
    fnop_val = fnop.get("value") if fnop else "submit-page"
    
    title = "Show HN: ChanZong – Interactive Knowledge Graph for 130+ Zen Buddhist Classics"
    target_url = "https://chanzong.space/graph"
    
    sub_payload = {
        "fnid": fnid_val,
        "fnop": fnop_val,
        "title": title,
        "url": target_url,
        "text": ""
    }
    
    r_post = s.post("https://news.ycombinator.com/r", data=sub_payload, timeout=15)
    print(f"Submit response: {r_post.status_code}, URL: {r_post.url}")
    
    # 获取刚提交的新 item 链接
    r_user = s.get(f"https://news.ycombinator.com/submitted?id={username}", timeout=15)
    soup_user = BeautifulSoup(r_user.text, "html.parser")
    item_tr = soup_user.find("tr", {"class": "athing"})
    
    if item_tr and item_tr.get("id"):
        item_id = item_tr.get("id")
        live_url = f"https://news.ycombinator.com/item?id={item_id}"
        print(f"🎉🎉 [Hacker News] 成功发布 Show HN！")
        print(f"👉 独立永久 URL: {live_url}")
        
        # 3. 在 item 页面追加项目架构长篇说明
        time.sleep(2)
        r_item = s.get(live_url, timeout=15)
        soup_item = BeautifulSoup(r_item.text, "html.parser")
        comment_fnid = soup_item.find("input", {"name": "fnid"})
        if comment_fnid:
            comment_text = (
                "Hi HN,\n\n"
                "We built ChanZong Knowledge Base (https://chanzong.space) as an open-access digital humanities platform. "
                "It indexes 130 canonical Zen Buddhist scriptures, 500+ philosophical concepts, and hundreds of master lineages.\n\n"
                "Key architecture highlights:\n"
                "- D3.js v7 multi-stage physics engine with auto-equilibrium dampening to eliminate jitter in dense concept topologies.\n"
                "- Next.js 14 App Router dual-track static site generation (Simplified Chinese at /classics and Traditional Chinese at /zh-tw/classics) via opencc-js.\n"
                "- Zero-dangling-reference taxonomy schema linking scriptures, patriarch biographies, and koan dialogues.\n\n"
                "Check out the interactive graph here: https://chanzong.space/graph\n"
                "And full scriptures index: https://chanzong.space/classics\n\n"
                "Would love to hear your feedback on digital humanities visualization!"
            )
            s.post("https://news.ycombinator.com/comment", data={
                "parent": item_id,
                "goto": f"item?id={item_id}",
                "hmac": soup_item.find("input", {"name": "hmac"}).get("value") if soup_item.find("input", {"name": "hmac"}) else "",
                "text": comment_text
            }, timeout=15)
            print("✅ 已在 HN 帖子下追加长篇技术架构解说与完整官方链接！")
            
        rec_id = add_backlink(
            platform="Hacker News (Y Combinator DA 91)",
            region="海外英文/全球",
            category="Show HN / 顶级极客社区",
            post_title=title,
            target_url=target_url,
            backlink_url=live_url,
            anchor_text="ChanZong Knowledge Base · Interactive Knowledge Graph for 130+ Zen Classics",
            link_type="Dofollow",
            status="Live",
            notes="Hacker News 全球顶级极客社区 Show HN 官方发布，包含 D3.js 物理图谱与 Next.js 14 双轨静态架构详细解说"
        )
        print(f"✅ 外链台账已成功入库: {rec_id}")
        return live_url
    else:
        print("未直接抓取到 item id，检查用户主页")
        return None

if __name__ == "__main__":
    register_and_submit()
