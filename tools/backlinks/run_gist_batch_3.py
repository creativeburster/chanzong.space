# -*- coding: utf-8 -*-
"""
GitHub Gist (DA 96 顶级独立域名) 官方外链与公案导读发布引擎 - 第三批
针对最新经典发布繁体与学术 Markdown 导读笔记，永久获得 DA 96 顶级反向链接。
"""
import os
import sys
import subprocess
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
sys.path.append(os.path.join(CUR_DIR, "platform_runners"))
from content_synthesizer import synthesize_article, to_traditional
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

GIST_ITEMS = [
    {
        "id": "jingangsanmeijing",
        "title": "金剛三昧經達摩印心根本聖典白話解構",
        "filename": "金剛三昧經本覺心髓.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shiertimenlun",
        "title": "十二門論龍樹菩薩中觀正觀與緣起性空指歸",
        "filename": "十二門論中觀正觀.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shengmanjing",
        "title": "勝鬘師子吼一乘大方便方廣經在纏如來藏妙旨",
        "filename": "勝鬘經一乘如來藏.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "pingshiyulu",
        "title": "平石如砥禪師語錄自心覺照與十二時歌精要",
        "filename": "平石如砥禪師語錄.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "chaozongyulu",
        "title": "黃龍派超宗慧方禪師語錄古鏡銘與向上一路",
        "filename": "超宗慧方古鏡銘.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "baoxingwangzhenglun",
        "title": "龍樹菩薩寶行王正論信智二根與大乘仁恕心法",
        "filename": "寶行王正論修證.md",
        "trad": True,
        "region": "海外繁体"
    }
]

def publish_gists():
    print("="*60)
    print("🚀 正在通过 GitHub CLI 发布 DA 96 顶级公开 Gist 繁体文献外链...")
    print("="*60)
    
    count = 0
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
        
        tmp_file = os.path.join(CUR_DIR, fn)
        with open(tmp_file, "w", encoding="utf-8") as f:
            f.write(full_md)
            
        cmd = ["gh", "gist", "create", "--public", "--desc", f"{title} - chanzong.space", "-f", fn, tmp_file]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            gist_url = res.stdout.strip().split("\n")[-1].strip()
            print(f"🎉 成功发布 Gist: {title}\n👉 {gist_url}")
            
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
                notes=f"GitHub 官方 Gist 永久独立外链，面向全球搜索引擎收录与繁体数字人文检索"
            )
            count += 1
            time.sleep(1)
        except Exception as e:
            print(f"⚠️ 发布 Gist 出错: {e}")
        finally:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
                
    print(f"\n✅ GitHub Gist 第三批完成！成功新增 {count} 条 DA 96 顶级独立外链。")

if __name__ == "__main__":
    publish_gists()
