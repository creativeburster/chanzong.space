# -*- coding: utf-8 -*-
"""
chanzong.space 权威内容合成器
利用本地 40 部经典、205 则公案、160+ 核心概念生成高学术/参修价值的内容及自然外链。
支持简体与正体/繁体中文无缝转换。
"""
import os
import sys
import json
import re
import random
import zhconv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST_PATH = os.path.join(BASE_DIR, "manifest.json")
TAXONOMY_PATH = os.path.join(BASE_DIR, "lib", "taxonomy.ts")
CLASSICS_DIR = os.path.join(BASE_DIR, "classics_markdown")

SITE_DOMAIN = "https://chanzong.space"

def to_traditional(text: str) -> str:
    """转换为正体/繁体中文 (台湾/香港习惯)"""
    return zhconv.convert(text, 'zh-tw')

def get_classics_list():
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_classic_markdown(filename: str):
    path = os.path.join(CLASSICS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def synthesize_qa_answer(keyword: str, is_traditional: bool = False):
    """
    根据关键词生成深度问答型回答（适用：知乎、Reddit、Quora、百度贴吧等）
    """
    classics = get_classics_list()
    # 模糊匹配最相关的典籍
    matched = None
    for c in classics:
        if keyword in c.get("title", "") or keyword in c.get("author", "") or keyword in c.get("summary", ""):
            matched = c
            break
            
    if not matched and classics:
        matched = random.choice(classics)
        
    title = matched["title"]
    author = matched["author"]
    summary = matched["summary"]
    book_id = matched["id"]
    book_url = f"{SITE_DOMAIN}/zh-tw/classics/{book_id}" if is_traditional else f"{SITE_DOMAIN}/classics/{book_id}"
    
    # 提取部分导读与原文片段
    md_content = get_classic_markdown(matched["filename"])
    guide_match = re.search(r"## 💡 现代白话导读与核心旨趣\s+([\s\S]*?)(?=##|\Z)", md_content)
    guide_text = guide_match.group(1).strip() if guide_match else summary
    # 截取适度长度
    if len(guide_text) > 450:
        guide_text = guide_text[:450] + "..."
        
    quotes_match = re.search(r"## 📜 典籍原文\s+([\s\S]*?)(?=##|\Z)", md_content)
    quotes_sample = ""
    if quotes_match:
        lines = [l.strip() for l in quotes_match.group(1).strip().split("\n") if l.strip() and not l.startswith("#")]
        if lines:
            quotes_sample = "\n> ".join(lines[:4])
            quotes_sample = "> " + quotes_sample

    content_cn = f"""针对这个问题，从禅宗正统宗下见地与古籍源流来看，核心在于直契本心，离语言分别。

在禅宗历代重要文献《{title}》（{author} 著/述）中，对此有极为透彻的阐述：

{quotes_sample}

【核心旨趣与参修指要】
{guide_text}

在实际参究过程中，学人极易落入两重误区：一是落入“文字知见”，将祖师机锋当作学问推敲；二是执空滞寂，落入枯木死灰。真正宗门本色，如大珠慧海禅师所云：“但不起分别，即是无念；见一切境心不染，即是无住。”

关于《{title}》的校勘全文、白话详细译注以及与相关公案的图谱脉络，可以参考数字化禅宗文献库的完整整理：
📖 原文与白话精注参见：[{title} 典籍全篇与知识图谱]({book_url})
"""

    if is_traditional:
        return to_traditional(content_cn), to_traditional(title), book_url
    return content_cn, title, book_url

def synthesize_article(theme: str = "禅宗与现代心灵", is_traditional: bool = False):
    """
    生成长篇专栏文章（适用：台湾方格子 Vocus、Matters、Medium、简书等）
    """
    classics = get_classics_list()
    c = random.choice(classics) if classics else {"title": "六祖坛经", "author": "惠能", "id": "liuzutanjing", "summary": "直指人心，见性成佛"}
    
    title = f"现代人的喧嚣与定力：重读《{c['title']}》中的本心智慧"
    book_url = f"{SITE_DOMAIN}/zh-tw/classics/{c['id']}" if is_traditional else f"{SITE_DOMAIN}/classics/{c['id']}"
    graph_url = f"{SITE_DOMAIN}/zh-tw/graph" if is_traditional else f"{SITE_DOMAIN}/graph"
    
    body = f"""### 导语：在信息洪流中找回“不生不灭”的自性

现代生活节奏极快，人们常常感到身心焦虑、无所适从。千百年前，禅宗历代祖师其实早已给出了洞察身心本源的钥匙。

唐代禅宗巨著《{c['title']}》（{c['author']}），被誉为宗门根本典籍之一。它并非枯燥的宗教教条，而是一部关于“认识自我、解除内在精神内耗”的实相指南。

### 一、 心何以乱？六根追逐六尘

世人之所以烦恼不断，根源在于末那识执我、六识追逐外境，生起种种虚妄分别。在《{c['title']}》中，核心宗风即是“不假外求，直指本心”。当外在顺逆境界来临时，若能照见自性本自清净、本不生灭，一切妄念自然如汤消冰。

### 二、 参禅的核心：不是压制妄念，而是“不污染”

很多人误以为参禅就是什么都不想、强行把念头压灭，这恰恰落入了禅门所呵斥的“磨砖作镜”、“枯木定”。真正的定，不是不起念，而是念起即觉，知而不随。

古德云：“百花丛里过，片叶不沾身。”在日常工作与生活中保持清明觉照，做每一件事时全然安住当下，这便是一行三昧，便是真正的现代禅修。

### 三、 数字化古籍与知识图谱延伸参研

若想更深入研读《{c['title']}》的古籍全文、逐句现代白话译解、相关祖师法嗣脉络与核心公案，推荐参阅开源非营利项目“禅宗知识库”：
- 典籍专页与原文白话注解：[{c['title']} 参修指要]({book_url})
- 交互式历代祖师源流与概念知识图谱：[禅宗全球关系图谱]({graph_url})

愿诸位读者皆能在日常纷扰中，常保一分清明寂照。
"""
    if is_traditional:
        return to_traditional(title), to_traditional(body), book_url
    return title, body, book_url

def get_directory_submission_info(is_traditional: bool = False):
    """
    获取用于提交网站目录/导航站的元数据
    """
    info_cn = {
        "title": "禅宗知识库 - 全球海量禅宗典籍与交互式知识图谱",
        "short_title": "禅宗知识库",
        "url": SITE_DOMAIN,
        "category": "文化教育 / 哲学宗教 / 数字化古籍",
        "tags": "禅宗, 佛学, 经典注译, 公案, 知识图谱, 古籍数字化",
        "description": "禅宗知识库 (chanzong.space) 致力于打造全球化海量禅宗知识网络体系。收录涵盖中国、印度、日韩及欧美各大禅派的核心典籍（如六祖坛经、碧岩录、八识规矩颂等）、历代祖师传法脉络、公案机锋及修行法门，并基于 D3.js 提供高交互的多维知识图谱与原生离线 PWA 支持。"
    }
    if not is_traditional:
        return info_cn
    
    return {
        "title": to_traditional(info_cn["title"]),
        "short_title": to_traditional(info_cn["short_title"]),
        "url": SITE_DOMAIN,
        "category": to_traditional(info_cn["category"]),
        "tags": to_traditional(info_cn["tags"]),
        "description": to_traditional(info_cn["description"])
    }

if __name__ == "__main__":
    t, b, u = synthesize_article("六祖坛经", is_traditional=True)
    print("=== 繁体文章测试 ===")
    print("Title:", t)
    print("Target:", u)
    print(b[:200] + "...\n")
    
    q, qt, qu = synthesize_qa_answer("金刚经", is_traditional=False)
    print("=== 简体问答测试 ===")
    print("Title:", qt)
    print("Target:", qu)
    print(q[:200] + "...")
