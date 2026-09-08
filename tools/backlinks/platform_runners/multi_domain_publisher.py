# -*- coding: utf-8 -*-
"""
真正多独立域名 (Diverse Referring Domains) 矩阵发布引擎
面向不同权威独立顶级域名分发，杜绝单一站点过度集中，极大提升站点真实外链与域名多样性 (RD)。
"""
import os
import sys
import json
import urllib.request
import urllib.parse
import http.cookiejar
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

def publish_to_rentry(title: str, markdown_content: str, target_url: str, anchor_text: str, is_traditional: bool = False, region: str = "海外繁体"):
    """
    发布至 Rentry.co (独立域名 rentry.co, DA 78)
    """
    print(f"\n[Rentry.co] 正在向独立域名 rentry.co 发布: 《{title[:20]}...》")
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    
    # 获取 csrf token
    req = urllib.request.Request("https://rentry.co", headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    opener.open(req)
    cookies = {c.name: c.value for c in cj}
    token = cookies.get("csrftoken", "")
    
    full_md = f"# {title}\n\n> 来源出处与在线参修：[{anchor_text}]({target_url})\n\n{markdown_content}\n\n---\n**延伸阅读**：[D3.js 全球禅宗知识图谱]({SITE_DOMAIN}/graph) | [核心典籍库]({SITE_DOMAIN})"
    
    post_data = urllib.parse.urlencode({
        "csrfmiddlewaretoken": token,
        "text": full_md
    }).encode("utf-8")
    
    post_req = urllib.request.Request(
        "https://rentry.co/api/new",
        data=post_data,
        headers={
            "Referer": "https://rentry.co",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    
    res = opener.open(post_req)
    res_data = json.loads(res.read().decode("utf-8"))
    if res_data.get("status") == "200":
        live_url = res_data.get("url")
        print(f"🎉 [Rentry.co] 独立域名外链发布成功！URL: {live_url}")
        add_backlink(
            platform="Rentry.co (独立域名 DA 78)",
            region=region,
            category="Markdown 专栏",
            post_title=title,
            target_url=target_url,
            backlink_url=live_url,
            anchor_text=anchor_text,
            link_type="Dofollow",
            status="Live",
            notes="独立域名 rentry.co 永久外链，包含完整正文与双向回链"
        )
        return live_url
    else:
        raise Exception(f"Rentry error: {res_data}")

def publish_to_writeas(title: str, markdown_content: str, target_url: str, anchor_text: str, is_traditional: bool = False, region: str = "国内"):
    """
    发布至 Write.as (独立域名 write.as, DA 75)
    """
    print(f"\n[Write.as] 正在向独立域名 write.as 发布: 《{title[:20]}...》")
    full_body = f"# {title}\n\n【禅宗经典阅读与图谱指要】：[{anchor_text}]({target_url})\n\n{markdown_content}\n\n---\n🌐 全网交互式禅学知识图谱：[{SITE_DOMAIN}/graph]({SITE_DOMAIN}/graph)"
    
    payload = {
        "title": title[:64],
        "body": full_body
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://write.as/api/posts",
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        post_id = res["data"]["id"]
        live_url = f"https://write.as/{post_id}"
        print(f"🎉 [Write.as] 独立域名外链发布成功！URL: {live_url}")
        add_backlink(
            platform="Write.as (独立域名 DA 75)",
            region=region,
            category="独立博客专栏",
            post_title=title,
            target_url=target_url,
            backlink_url=live_url,
            anchor_text=anchor_text,
            link_type="Dofollow",
            status="Live",
            notes="独立域名 write.as 永久发布页，支持 Google/Bing 全球收录"
        )
        return live_url

def create_github_readme():
    """
    在 GitHub 仓库 (独立域名 github.com, DA 96) 创建官方完整 README.md
    包含全站 40 部典籍与 D3.js 知识图谱所有核心外链
    """
    print("\n[GitHub] 正在为 github.com 仓库构建全量回链 README.md...")
    classics = get_classics_list()
    
    readme_content = f"""# 禅宗知识库 (ChanZong Knowledge Base)

> 全球海量禅宗典籍网络、公案机锋与交互式多维知识图谱体系  
> 官方网站：**[chanzong.space](https://chanzong.space)**  
> 繁体中文版：**[chanzong.space (正體版)](https://chanzong.space)**

---

## 🌟 项目特色

1. **宏大典籍库**：涵盖中国、印度、朝韩、日本及欧美各大禅派核心典籍（当前收录 40+ 部，长期规划 1,000+ 部）。
2. **交互式 D3.js 知识图谱**：基于 Next.js 14 与 D3.js v7 渲染，展现历代祖师传法脉络、核心概念与公案问答网络。
   - 体验入口：**[D3.js 全球禅宗知识图谱]({SITE_DOMAIN}/graph)**
3. **逐句白话精注与音义字典**：深度清洗 OCR 噪点，提供定制现代白话导读与核心旨趣指要。
4. **原生离线 PWA 支持**：随时随地离线研读禅宗古籍。

---

## 📚 核心典籍在线阅读清单 (40+ 部持续扩充)

| 编号 | 典籍名称 | 作者/译者 | 核心分类 | 官网在线阅读与图谱 |
|---|---|---|---|---|
"""
    for c in classics:
        idx = c.get("idx", 1)
        bid = c.get("id", "")
        title = c.get("title", "")
        author = c.get("author", "")
        cat = c.get("category", "")
        book_url = f"{SITE_DOMAIN}/classics/{bid}"
        readme_content += f"| {idx} | **{title}** | {author} | {cat} | [阅读全文与知识图谱]({book_url}) |\n"

    readme_content += f"""
---

## 🔗 核心功能与资源直达

- 🌐 **知识网络图谱**：[{SITE_DOMAIN}/graph]({SITE_DOMAIN}/graph)
- 💡 **公案机锋精选**：[{SITE_DOMAIN}/qas]({SITE_DOMAIN}/qas)
- 🧘 **历代祖师源流**：[{SITE_DOMAIN}/persons]({SITE_DOMAIN}/persons)
- 📌 **核心禅学概念**：[{SITE_DOMAIN}/concepts]({SITE_DOMAIN}/concepts)
- 🛠️ **修持法门指南**：[{SITE_DOMAIN}/methods]({SITE_DOMAIN}/methods)

---

*本项目采用开源数字化古籍公有领域文本，旨在传承与弘扬东方禅宗智慧。*
"""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    readme_path = os.path.join(root_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content)
        
    print("✅ 项目根目录 README.md 已成功生成！")
    add_backlink(
        platform="GitHub (顶级独立域名 DA 96)",
        region="海外繁体",
        category="开源代码库索引",
        post_title="GitHub 官方开源项目主页及全量典籍网络清单",
        target_url=SITE_DOMAIN,
        backlink_url="https://github.com/gstar-byte/chanzong.space",
        anchor_text="chanzong.space 禅宗知识库",
        link_type="Dofollow",
        status="Live",
        notes="包含全站 40+ 部典籍详情页、D3 知识图谱及五大核心子频道的全量反向链接"
    )

def run_multi_domain_batch():
    print("="*60)
    print("🚀 正在跨各大独立域名 (Rentry, Write.as, GitHub) 构建多元化外链矩阵")
    print("="*60)
    
    # 1. GitHub 顶级域名外链 (github.com, DA 96)
    create_github_readme()
    
    # 2. Rentry.co 独立域名 (rentry.co, DA 78) - 繁体与海外
    seed_tw = [
        {"id": "biyanlu", "title": "碧岩錄"},
        {"id": "tanjing", "title": "六祖法寶壇經"},
        {"id": "wumenguan", "title": "無門關"}
    ]
    for item in seed_tw:
        t_tw, body_tw, target_url = synthesize_article(item["title"], is_traditional=True)
        publish_to_rentry(
            title=t_tw,
            markdown_content=body_tw,
            target_url=target_url,
            anchor_text=f"《{item['title']}》正體白話注譯與知識圖譜",
            is_traditional=True,
            region="海外繁体"
        )
        
    # 3. Write.as 独立域名 (write.as, DA 75) - 国内与简体
    seed_cn = [
        {"id": "bashiguijusong", "title": "八识规矩颂"},
        {"id": "jingangjing", "title": "金刚经"},
        {"id": "zhaozhouyulu", "title": "赵州语录"}
    ]
    for item in seed_cn:
        t_cn, body_cn, target_url = synthesize_article(item["title"], is_traditional=False)
        publish_to_writeas(
            title=t_cn,
            markdown_content=body_cn,
            target_url=target_url,
            anchor_text=f"《{item['title']}》现代白话译解与全书阅读",
            is_traditional=False,
            region="国内"
        )

if __name__ == "__main__":
    run_multi_domain_batch()
