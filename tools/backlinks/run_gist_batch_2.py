# -*- coding: utf-8 -*-
"""
GitHub Gist (DA 96) 顶级域名批量外链发布引擎 - 第二批
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
from content_synthesizer import synthesize_article, to_traditional
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

GIST_BATCH_2 = [
    {
        "id": "bashiguijusong",
        "title": "八识规矩颂转识成智与唯识参禅要诀",
        "filename": "八识规矩颂转识成智要诀.md",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "chuanxinfayao",
        "title": "黃檗禪師傳心法要直指自心即是佛旨歸",
        "filename": "黃檗禪師傳心法要直指即心即佛.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "dachengqixinlun",
        "title": "大乘起信论一心二门与真如熏习修证指要",
        "filename": "大乘起信论真如熏习指要.md",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "linjilu",
        "title": "臨濟慧照禪師語錄四照用與棒喝當機心法",
        "filename": "臨濟語錄四照用與當機心法.md",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shiniutu",
        "title": "禅宗十牛图寻牛见迹到入廛垂手十阶心路",
        "filename": "禅宗十牛图修证心路全解.md",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "lengqiejing",
        "title": "楞伽阿跋多羅寶經四卷印心與離言絕相心髓",
        "filename": "楞伽經印心法要與離言心髓.md",
        "trad": True,
        "region": "海外繁体"
    }
]

def run_gist_batch():
    print("="*60)
    print("🚀 正在通过 GitHub CLI 发布第二批 DA 96 顶级公开 Gist 外链...")
    print("="*60)
    
    count = 0
    for it in GIST_BATCH_2:
        bid = it["id"]
        title = it["title"]
        fn = it["filename"]
        is_trad = it["trad"]
        reg = it["region"]
        target_url = f"{SITE_DOMAIN}/zh-tw/books/{bid}" if is_trad else f"{SITE_DOMAIN}/books/{bid}"
        
        art_title, art_body, _ = synthesize_article(title, is_traditional=is_trad)
        header = f"# {title}\n\n> 📖 全文在線閱讀與知識圖譜：[{art_title}]({target_url})\n> 🌐 全球禪宗網絡：[{SITE_DOMAIN}]({SITE_DOMAIN}) | [D3.js 知識圖譜]({SITE_DOMAIN}/graph)\n\n---\n\n" if is_trad else f"# {title}\n\n> 📖 原文在线详注与知识图谱：[{art_title}]({target_url})\n> 🌐 全球禅宗知识网络：[{SITE_DOMAIN}]({SITE_DOMAIN}) | [D3.js 关系图谱]({SITE_DOMAIN}/graph)\n\n---\n\n"
        
        full_md = header + art_body
        tmp_file = os.path.join(CUR_DIR, fn)
        with open(tmp_file, "w", encoding="utf-8") as f:
            f.write(full_md)
            
        cmd = ["gh", "gist", "create", "--public", "--desc", f"{title} - chanzong.space", "-f", fn, tmp_file]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True, encoding="utf-8")
            gist_url = res.stdout.strip().split("\n")[-1].strip()
            print(f"🎉 [{reg}] 成功发布 Gist: 《{title}》\n👉 永久在线外链: {gist_url}\n👉 目标落地页: {target_url}\n")
            
            add_backlink(
                platform="GitHub Gist (顶级域名 DA 96)",
                region=reg,
                category="文献公开笔记",
                post_title=title,
                target_url=target_url,
                backlink_url=gist_url,
                anchor_text=f"《{title}》在线阅读与知识图谱",
                link_type="Dofollow",
                status="Live",
                notes=f"GitHub 官方公开 Gist 笔记，含 D3.js 禅宗关系网络图谱与文献回链 ({'繁体' if is_trad else '简体'})"
            )
            count += 1
            time.sleep(2)
        except Exception as e:
            print(f"⚠️ 发布 Gist 出错: {e}")
        finally:
            if os.path.exists(tmp_file):
                try:
                    os.remove(tmp_file)
                except Exception:
                    pass
                    
    print(f"✅ Gist 第二批完成！成功发布 {count} 条顶级外链。")

if __name__ == "__main__":
    run_gist_batch()
