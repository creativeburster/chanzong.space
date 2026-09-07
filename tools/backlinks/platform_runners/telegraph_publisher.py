# -*- coding: utf-8 -*-
"""
Telegraph (Telegra.ph, DA 92+) 全自动高权重外链专栏发布引擎
通过官方 API 直接发布深度学术长文与繁体专栏，挂载 chanzong.space 核心落地页，瞬间生成永久外链。
"""
import os
import sys
import json
import urllib.request
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from content_synthesizer import synthesize_article, get_classics_list, to_traditional
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

def get_or_create_token():
    token_cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".telegraph_token")
    if os.path.exists(token_cache):
        with open(token_cache, "r", encoding="utf-8") as f:
            tok = f.read().strip()
            if tok:
                return tok
                
    api_url = "https://api.telegra.ph/createAccount"
    payload = {
        "short_name": "chanzong",
        "author_name": "禅宗知识库",
        "author_url": SITE_DOMAIN
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(api_url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        token = res["result"]["access_token"]
        with open(token_cache, "w", encoding="utf-8") as f:
            f.write(token)
        return token

def create_telegraph_page(title: str, body_paragraphs: list, target_url: str, anchor_text: str, is_traditional: bool = False):
    token = get_or_create_token()
    api_url = "https://api.telegra.ph/createPage"
    
    # 构造 Telegraph 富文本 DOM 节点
    content_nodes = []
    
    author_display = "禪宗知識庫 (chanzong.space)" if is_traditional else "禅宗知识库 (chanzong.space)"
    intro_ref = "【經典原文、白話詳註與全球圖譜導覽】：\n" if is_traditional else "【经典原文、白话详注与全球图谱导览】：\n"
    
    # 顶部引言卡片
    content_nodes.append({
        "tag": "blockquote",
        "children": [
            intro_ref,
            {"tag": "a", "attrs": {"href": target_url}, "children": [f"📖 {anchor_text}"]}
        ]
    })
    
    # 文章段落
    for p in body_paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if p_clean.startswith("### "):
            content_nodes.append({"tag": "h4", "children": [p_clean.replace("### ", "")]})
        elif p_clean.startswith("## "):
            content_nodes.append({"tag": "h3", "children": [p_clean.replace("## ", "")]})
        else:
            content_nodes.append({"tag": "p", "children": [p_clean]})
            
    # 底部核心回链与知识图谱链接
    footer_text = "查看全站 40+ 禪宗典籍與全球關係網絡圖譜：" if is_traditional else "查看全站 40+ 禅宗典籍与全球关系网络图谱："
    content_nodes.append({"tag": "hr"})
    content_nodes.append({
        "tag": "p",
        "children": [
            footer_text,
            {"tag": "a", "attrs": {"href": f"{SITE_DOMAIN}/graph"}, "children": [" [D3.js 全球禅宗知识图谱] "]},
            " | ",
            {"tag": "a", "attrs": {"href": target_url}, "children": [f" [{anchor_text}] "]}
        ]
    })
    
    payload = {
        "access_token": token,
        "title": title[:64],
        "author_name": author_display,
        "author_url": SITE_DOMAIN,
        "content": content_nodes,
        "return_content": False
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(api_url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        if res.get("ok"):
            page_url = res["result"]["url"]
            return page_url
        else:
            raise Exception(res.get("error", "Unknown error"))

def run_batch_publish(count: int = 4):
    print("="*60)
    print("🚀 启动 Telegraph (DA 92) 全自动高权重外链发布矩阵")
    print(f"🎯 规划发布 {count} 篇深度专栏 (兼顾国内简体与海外正体)")
    print("="*60)
    
    classics = get_classics_list()
    # 挑选核心知名经典
    seed_books = [
        {"id": "liuzutanjing", "title": "六祖法宝坛经", "author": "惠能", "trad": False, "region": "国内"},
        {"id": "biyanlu", "title": "碧岩录", "author": "圜悟克勤", "trad": True, "region": "海外繁体"},
        {"id": "bashiguijusong", "title": "八识规矩颂", "author": "玄奘", "trad": False, "region": "国内"},
        {"id": "wumenguan", "title": "无门关", "author": "无门慧开", "trad": True, "region": "海外繁体"},
        {"id": "jingangjing", "title": "金刚般若波罗蜜经", "author": "鸠摩罗什", "trad": False, "region": "国内"},
        {"id": "wanlinglu", "title": "黄檗断际禅师宛陵录", "author": "黄檗希运", "trad": True, "region": "海外繁体"},
        {"id": "changuancejin", "title": "禅关策进", "author": "云栖袾宏", "trad": False, "region": "国内"},
        {"id": "xinming", "title": "信心铭", "author": "三祖僧璨", "trad": True, "region": "海外繁体"}
    ]
    
    published = 0
    for item in seed_books[:count]:
        b_id = item["id"]
        is_trad = item["trad"]
        reg = item["region"]
        title_raw = item["title"]
        target_url = f"{SITE_DOMAIN}/books/{b_id}"
        
        art_title, art_body, _ = synthesize_article(title_raw, is_traditional=is_trad)
        paragraphs = art_body.split("\n\n")
        anchor = f"《{art_title.split('：')[-1]}》參修指要與在線閱讀" if is_trad else f"《{title_raw}》参修指要与在线阅读"
        
        print(f"\n[Telegraph] 正在发布: 《{art_title}》 (语言: {'繁体' if is_trad else '简体'})...")
        try:
            live_url = create_telegraph_page(
                title=art_title,
                body_paragraphs=paragraphs,
                target_url=target_url,
                anchor_text=anchor,
                is_traditional=is_trad
            )
            print(f"🎉 成功发布永久外链！\n👉 页面地址: {live_url}\n👉 目标落地页: {target_url}")
            
            add_backlink(
                platform="Telegraph (DA 92 高权重专栏)",
                region=reg,
                category="高权重专栏",
                post_title=art_title,
                target_url=target_url,
                backlink_url=live_url,
                anchor_text=anchor,
                link_type="Dofollow",
                status="Live",
                notes=f"全篇深度导读文章，附带 D3 知识图谱与《{title_raw}》原书文献锚文本"
            )
            published += 1
        except Exception as e:
            print(f"⚠️ 发布失败: {e}")
            
    print(f"\n✅ 批量发布完成！本次新增 {published} 条高权重外部反向链接。")

if __name__ == "__main__":
    run_batch_publish(8)
