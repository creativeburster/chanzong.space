# -*- coding: utf-8 -*-
"""
Telegraph (DA 92) 深度学术长文全自动发布矩阵 - 第二批
"""
import os
import sys
import json
import time
import urllib.request

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
from telegraph_publisher import create_telegraph_page
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

TELEGRAPH_BATCH_2 = [
    {
        "id": "chuanxinfayao",
        "title": "黃檗禪師傳心法要：諸佛與一切眾生唯是一心",
        "author": "黃檗希運",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "linjilu",
        "title": "临济禅师语录：赤肉团上有一无位真人常在面门出入",
        "author": "临济义玄",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "yuanjuejing",
        "title": "大方廣圓覺修多羅了義經：知幻即離不作方便離幻即覺",
        "author": "佛陀 / 禪宗印心",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "damoxuemai",
        "title": "达摩大师血脉论：若欲见佛须是见性性即是佛",
        "author": "菩提达摩",
        "trad": False,
        "region": "国内"
    },
    {
        "id": "baizhanglu",
        "title": "百丈懷海禪師語錄：心境虛朗諒無拘繫與叢林二十條清規",
        "author": "百丈懷海",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shiniutu",
        "title": "禅宗十牛图解悟：从寻牛见迹到入廛垂手的十重觉照境界",
        "author": "廓庵师远",
        "trad": False,
        "region": "国内"
    }
]

def run_telegraph_batch():
    print("="*60)
    print("🚀 启动 Telegraph (DA 92) 深度学术长文专栏第二批发布...")
    print("="*60)
    
    count = 0
    for item in TELEGRAPH_BATCH_2:
        bid = item["id"]
        title_raw = item["title"]
        author = item["author"]
        is_trad = item["trad"]
        reg = item["region"]
        target_url = f"{SITE_DOMAIN}/zh-tw/books/{bid}" if is_trad else f"{SITE_DOMAIN}/books/{bid}"
        
        art_title, art_body, _ = synthesize_article(title_raw, is_traditional=is_trad)
        paragraphs = art_body.split("\n\n")
        anchor = f"《{art_title.split('：')[-1]}》在線閱讀與關係圖譜" if is_trad else f"《{title_raw.split('：')[0]}》在线阅读与知识图谱"
        
        print(f"\n[Telegraph] 正在发布: 《{art_title}》 (语言: {'繁体' if is_trad else '简体'})...")
        try:
            live_url = create_telegraph_page(
                title=art_title,
                body_paragraphs=paragraphs,
                target_url=target_url,
                anchor_text=anchor,
                is_traditional=is_trad
            )
            print(f"🎉 [{reg}] 成功发布永久外链！\n👉 在线地址: {live_url}\n👉 目标落地页: {target_url}")
            
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
                notes=f"深度学术文献长文，附带 D3 知识图谱与《{title_raw.split('：')[0]}》文献回链 ({'繁体' if is_trad else '简体'})"
            )
            count += 1
            time.sleep(1)
        except Exception as e:
            print(f"⚠️ Telegraph 发布失败: {e}")
            
    print(f"\n✅ Telegraph 第二批完成！成功新增 {count} 条高权重外部反向链接。")

if __name__ == "__main__":
    run_telegraph_batch()
