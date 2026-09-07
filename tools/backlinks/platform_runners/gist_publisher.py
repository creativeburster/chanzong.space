# -*- coding: utf-8 -*-
"""
GitHub Gist (DA 96 顶级独立域名) 官方外链与公案导读发布引擎
利用已认证的 GitHub CLI (gh) 极速发布公开 Markdown 导读笔记，永久获得 DA 96 权重。
"""
import os
import sys
import subprocess

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from content_synthesizer import synthesize_article, to_traditional
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

GIST_ITEMS = [
    {
        "id": "biyanlu",
        "title": "碧岩錄宗門第一書與禪修公案精解",
        "filename": "碧岩錄核心導讀.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "bashiguijusong",
        "title": "八识规矩颂与唯识转识成智实修指要",
        "filename": "八识规矩颂实修指要.md",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "wumenguan",
        "title": "無門關四十八則公案機鋒精粹",
        "filename": "無門關公案導讀.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "jingangjing",
        "title": "金刚经破相明心与四句偈参修指要",
        "filename": "金刚经破相明心.md",
        "trad": False,
        "region": "国内"
    }
]

def publish_gists():
    print("="*60)
    print("🚀 正在通过 GitHub CLI 发布 DA 96 顶级公开 Gist 外链...")
    print("="*60)
    
    for it in GIST_ITEMS:
        bid = it["id"]
        title = it["title"]
        fn = it["filename"]
        is_trad = it["trad"]
        reg = it["region"]
        target_url = f"{SITE_DOMAIN}/zh-tw/classics/{bid}" if is_trad else f"{SITE_DOMAIN}/classics/{bid}"
        
        art_title, art_body, _ = synthesize_article(title, is_traditional=is_trad)
        header = f"# {title}\n\n> 📖 全文在線閱讀與知識圖譜：[{art_title}]({target_url})\n> 🌐 全球禪宗網絡：[{SITE_DOMAIN}]({SITE_DOMAIN}) | [D3.js 知識圖譜]({SITE_DOMAIN}/graph)\n\n---\n\n" if is_trad else f"# {title}\n\n> 📖 原文在线详注与知识图谱：[{art_title}]({target_url})\n> 🌐 全球禅宗知识网络：[{SITE_DOMAIN}]({SITE_DOMAIN}) | [D3.js 关系图谱]({SITE_DOMAIN}/graph)\n\n---\n\n"
        
        full_md = header + art_body
        
        # 临时写文件
        tmp_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), fn)
        with open(tmp_file, "w", encoding="utf-8") as f:
            f.write(full_md)
            
        cmd = ["gh", "gist", "create", "--public", "--desc", f"{title} - chanzong.space", "-f", fn, tmp_file]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            gist_url = res.stdout.strip().split("\n")[-1].strip()
            print(f"🎉 成功发布 Gist: {title} -> {gist_url}")
            
            add_backlink(
                platform="GitHub Gist (顶级域名 DA 96)",
                region=reg,
                category="文献公开笔记",
                post_title=title,
                target_url=target_url,
                backlink_url=gist_url,
                anchor_text=f"《{title}》参修指要与知识图谱",
                link_type="Dofollow",
                status="Live",
                notes=f"GitHub 官方 Gist 永久独立外链，面向全球搜索引擎收录"
            )
        except Exception as e:
            print(f"⚠️ 发布 Gist 出错: {e}")
        finally:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)

if __name__ == "__main__":
    publish_gists()
